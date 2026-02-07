#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

dotenv.config();

const DEFAULT_CONFIG = {
  sourceDir: 'C:/Users/dell/Downloads/Bendouha',
  defaults: {
    published: false,
    disable_out_of_stock: true,
    quantity: 0,
  },
  skuSource: 'reference',
  parentRules: [],
  fileOverrides: {},
};

const HEADER_SKIP = new Set([
  'Arial',
  'Microsoft XPS Document Writer',
  'Liste des Produits',
  'Désignation',
  'Prix de Vente',
  'Code-barre',
  'Reference',
]);

function parseArgs(argv) {
  const args = {
    dryRun: false,
    limit: null,
    sourceDir: null,
    configPath: null,
    published: null,
    quantity: null,
    disableOutOfStock: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--source') {
      args.sourceDir = argv[i + 1];
      i += 1;
    } else if (a === '--config') {
      args.configPath = argv[i + 1];
      i += 1;
    } else if (a === '--limit') {
      args.limit = Number(argv[i + 1]);
      i += 1;
    } else if (a === '--published') {
      args.published = parseBool(argv[i + 1]);
      i += 1;
    } else if (a === '--quantity') {
      args.quantity = Number(argv[i + 1]);
      i += 1;
    } else if (a === '--disable-out-of-stock') {
      args.disableOutOfStock = parseBool(argv[i + 1]);
      i += 1;
    } else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  // eslint-disable-next-line no-console
  console.log(`\nUsage:\n  node scripts/import-frp.js [options]\n\nOptions:\n  --config <path>             Path to config JSON\n  --source <path>             Override source directory\n  --dry-run                   Parse and report, no DB writes\n  --limit <n>                  Limit number of products processed\n  --published <true|false>     Override published default\n  --quantity <n>               Override quantity default\n  --disable-out-of-stock <t/f> Override disable_out_of_stock default\n`);
}

function parseBool(value) {
  if (value == null) return null;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'n'].includes(v)) return false;
  return null;
}

function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function loadConfig(configPath) {
  if (!configPath) return DEFAULT_CONFIG;
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw);
  return deepMerge(DEFAULT_CONFIG, parsed);
}

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSequences(buffer) {
  const text = buffer.toString('latin1');
  return text.match(/[\x20-\x7E\xA0-\xFF]{4,}/g) || [];
}

function getNextValue(seqs, idx) {
  const maxLookahead = 8;
  for (let j = idx + 1; j < seqs.length && j <= idx + maxLookahead; j += 1) {
    const raw = seqs[j];
    if (!raw) continue;
    const value = normalizeWhitespace(raw);
    if (!value) continue;
    if (HEADER_SKIP.has(value)) continue;
    if (/^Memo\d+$/i.test(value)) continue;
    return value;
  }
  return null;
}

function parsePrice(raw) {
  if (!raw) return null;
  const normalized = raw.replace(/\s+/g, '').replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function parseFrpFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const seqs = extractSequences(buffer);
  const records = [];
  let current = null;

  for (let i = 0; i < seqs.length; i += 1) {
    const token = seqs[i];
    if (token === 'Memo5') {
      if (current && current.designation) {
        records.push(current);
      }
      const designation = getNextValue(seqs, i);
      current = {
        designation: designation ? normalizeWhitespace(designation) : null,
        priceRaw: null,
        barcode: null,
        reference: null,
      };
      continue;
    }

    if (!current) continue;

    if (token === 'Memo7') {
      current.priceRaw = getNextValue(seqs, i);
    } else if (token === 'Memo13') {
      current.barcode = normalizeWhitespace(getNextValue(seqs, i) || '');
    } else if (token === 'Memo11') {
      const ref = getNextValue(seqs, i);
      current.reference = ref ? normalizeWhitespace(ref) : null;
    }
  }

  if (current && current.designation) {
    records.push(current);
  }

  return records
    .map((r) => {
      const price = parsePrice(r.priceRaw);
      return {
        designation: r.designation,
        salePrice: price ?? 0,
        barcode: r.barcode || null,
        reference: r.reference || null,
      };
    })
    .filter((r) => r.designation);
}

function resolveCategory(baseName, config) {
  const overrides = config.fileOverrides || {};
  const override = overrides[`${baseName}.frp`] || overrides[baseName] || null;
  const normalizedBase = normalizeWhitespace(baseName);
  const baseLower = normalizedBase.toLowerCase();

  let parent = override?.parent || null;
  if (!parent) {
    for (const rule of config.parentRules || []) {
      const regex = new RegExp(rule.match, 'i');
      if (regex.test(baseLower)) {
        parent = rule.parent;
        break;
      }
    }
  }

  if (!parent) {
    parent = baseLower.split(' ')[0];
  }

  const subcategory = override?.subcategory || normalizedBase;

  return {
    parentName: normalizeWhitespace(parent),
    subcategoryName: normalizeWhitespace(subcategory),
  };
}

function pickSku(barcode, reference, skuSource) {
  const b = barcode ? normalizeWhitespace(barcode) : null;
  const r = reference ? normalizeWhitespace(reference) : null;
  if (skuSource === 'barcode') {
    return b || r || null;
  }
  return r || b || null;
}

function buildNote(fileBase, barcode, reference, sku) {
  const parts = [`import:${fileBase}`];
  if (barcode) parts.push(`barcode:${barcode}`);
  if (reference) parts.push(`reference:${reference}`);
  if (sku) parts.push(`sku:${sku}`);
  return parts.join(' | ');
}

function buildSlug(name, barcode, reference) {
  const base = slugify(name, { lower: true, strict: true, locale: 'fr' });
  const extra = barcode || reference || null;
  if (extra) {
    const suffix = slugify(String(extra), { lower: true, strict: true, locale: 'fr' });
    if (suffix) return `${base}-${suffix}`;
  }
  return base;
}

function truncate(value, max) {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

async function ensureCategory(prisma, name, parentId, dryRun, cache, counters) {
  if (cache.has(name)) return cache.get(name);

  if (dryRun) {
    const fakeId = `__dry__${name}`;
    cache.set(name, fakeId);
    counters.categoriesCreated += 1;
    return fakeId;
  }

  const existing = await prisma.categories.findUnique({
    where: { category_name: name },
  });

  if (existing) {
    if (parentId && existing.parent_id !== parentId) {
      await prisma.categories.update({
        where: { id: existing.id },
        data: { parent_id: parentId },
      });
      counters.categoriesUpdated += 1;
    }
    cache.set(name, existing.id);
    return existing.id;
  }

  const created = await prisma.categories.create({
    data: {
      category_name: name,
      parent_id: parentId,
      active: true,
    },
  });

  counters.categoriesCreated += 1;
  cache.set(name, created.id);
  return created.id;
}

async function ensureProductCategory(prisma, productId, categoryId, dryRun, counters) {
  if (dryRun) {
    counters.productCategoryLinks += 1;
    return;
  }

  const existing = await prisma.product_categories.findFirst({
    where: { product_id: productId, category_id: categoryId },
  });

  if (!existing) {
    await prisma.product_categories.create({
      data: { product_id: productId, category_id: categoryId },
    });
    counters.productCategoryLinks += 1;
  }
}

async function upsertProduct(prisma, record, context, dryRun, counters) {
  const { parentName, defaults, skuSource } = context;

  const name = normalizeWhitespace(record.designation);
  const barcode = record.barcode ? normalizeWhitespace(record.barcode) : null;
  const reference = record.reference ? normalizeWhitespace(record.reference) : null;
  const sku = pickSku(barcode, reference, skuSource);
  const note = buildNote(context.fileBase, barcode, reference, sku);

  const shortDescription = truncate(name, 165);
  const productDescription = name;

  if (dryRun) {
    counters.productsCreated += 1;
    return { id: `__dry__${name}` };
  }

  let existing = null;
  if (sku) {
    existing = await prisma.products.findFirst({ where: { sku } });
  }

  if (!existing) {
    const slugBase = buildSlug(name, barcode, reference);
    let slug = slugBase;
    let suffix = 2;

    // Ensure slug uniqueness
    while (await prisma.products.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const created = await prisma.products.create({
      data: {
        slug,
        product_name: name,
        sku: sku || null,
        sale_price: record.salePrice,
        quantity: defaults.quantity,
        short_description: shortDescription,
        product_description: productDescription,
        product_type: parentName,
        published: defaults.published,
        disable_out_of_stock: defaults.disable_out_of_stock,
        note,
      },
    });

    counters.productsCreated += 1;
    return created;
  }

  const updateData = {
    product_name: name,
    sale_price: record.salePrice,
    short_description: shortDescription,
    product_description: productDescription,
    product_type: parentName,
    note,
  };

  if (sku && (!existing.sku || existing.sku === sku)) {
    updateData.sku = sku;
  }

  const updated = await prisma.products.update({
    where: { id: existing.id },
    data: updateData,
  });

  counters.productsUpdated += 1;
  return updated;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const defaultConfigPath = path.join(__dirname, 'import-frp.config.json');
  const configPath = args.configPath || (fs.existsSync(defaultConfigPath) ? defaultConfigPath : null);
  const config = loadConfig(configPath);

  if (args.sourceDir) config.sourceDir = args.sourceDir;
  if (args.published != null) config.defaults.published = args.published;
  if (args.quantity != null && Number.isFinite(args.quantity)) config.defaults.quantity = args.quantity;
  if (args.disableOutOfStock != null) config.defaults.disable_out_of_stock = args.disableOutOfStock;

  const sourceDir = config.sourceDir;
  if (!sourceDir || !fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => f.toLowerCase().endsWith('.frp'))
    .sort((a, b) => a.localeCompare(b, 'fr'));

  let pool = null;
  const prisma = args.dryRun
    ? null
    : (() => {
        pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter });
      })();
  const counters = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    productCategoryLinks: 0,
    productsSkipped: 0,
  };

  const categoryCache = new Map();

  let processed = 0;

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const baseName = path.basename(file, path.extname(file));
    const { parentName, subcategoryName } = resolveCategory(baseName, config);

    const parentId = await ensureCategory(prisma, parentName, null, args.dryRun, categoryCache, counters);
    const subcategoryId = await ensureCategory(prisma, subcategoryName, parentId, args.dryRun, categoryCache, counters);

    const records = parseFrpFile(filePath);

    for (const record of records) {
      if (args.limit && processed >= args.limit) break;

      const product = await upsertProduct(
        prisma,
        record,
        {
          parentName,
          fileBase: baseName,
          defaults: config.defaults,
          skuSource: config.skuSource,
        },
        args.dryRun,
        counters,
      );

      if (subcategoryId && product?.id) {
        await ensureProductCategory(prisma, product.id, subcategoryId, args.dryRun, counters);
      }

      processed += 1;
    }

    if (args.limit && processed >= args.limit) break;
  }

  if (prisma) {
    await prisma.$disconnect();
    if (pool) {
      await pool.end();
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        dryRun: args.dryRun,
        processedProducts: processed,
        counters,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
