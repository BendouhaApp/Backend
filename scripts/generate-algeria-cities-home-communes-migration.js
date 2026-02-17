const fs = require("fs");
const path = require("path");

const SOURCE_URL =
  "https://raw.githubusercontent.com/othmanus/algeria-cities/master/json/algeria_cities.json";
const MIGRATION_NAME = "20260217170000_seed_home_communes_from_algeria_cities";
const TRANSLATE_FROM_SQL =
  "U&'\\00E0\\00E1\\00E2\\00E3\\00E4\\00E5\\00E7\\00E8\\00E9\\00EA\\00EB\\00EC\\00ED\\00EE\\00EF\\00F1\\00F2\\00F3\\00F4\\00F5\\00F6\\00F9\\00FA\\00FB\\00FC\\00FD\\00FF\\00C0\\00C1\\00C2\\00C3\\00C4\\00C5\\00C7\\00C8\\00C9\\00CA\\00CB\\00CC\\00CD\\00CE\\00CF\\00D1\\00D2\\00D3\\00D4\\00D5\\00D6\\00D9\\00DA\\00DB\\00DC\\00DD'";
const TRANSLATE_TO_SQL =
  "'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'";

const escapeSql = (value) => String(value).replace(/'/g, "''");

const slugify = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['`\u2019\u00B4]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizedSqlExpr = (expr) =>
  `regexp_replace(translate(lower(coalesce(${expr}, '')), ${TRANSLATE_FROM_SQL}, ${TRANSLATE_TO_SQL}), '[^a-z0-9]+', '', 'g')`;

const buildSourceRows = (rows) => {
  const unique = new Map();

  for (const row of rows) {
    const wilayaCode = Number.parseInt(String(row.wilaya_code ?? ""), 10);
    const wilayaName = row.wilaya_name_ascii || row.wilaya_name;
    const communeName = row.commune_name_ascii || row.commune_name;

    if (!Number.isFinite(wilayaCode) || !wilayaName || !communeName) continue;

    const wilayaSlug = slugify(wilayaName);
    const communeSlug = slugify(communeName);

    if (!wilayaSlug || !communeSlug) continue;

    const key = `${wilayaCode}|${communeSlug}`;
    if (!unique.has(key)) {
      unique.set(key, {
        wilayaCode,
        wilayaSlug,
        communeSlug,
        communeDisplayName: String(communeName).trim(),
      });
    }
  }

  return Array.from(unique.values()).sort((a, b) => {
    if (a.wilayaCode !== b.wilayaCode) return a.wilayaCode - b.wilayaCode;
    return a.communeDisplayName.localeCompare(b.communeDisplayName, "fr", {
      sensitivity: "base",
    });
  });
};

const buildSql = (rows) => {
  const values = rows
    .map(
      (row) =>
        `  (${row.wilayaCode}, '${escapeSql(row.wilayaSlug)}', '${escapeSql(row.communeSlug)}', '${escapeSql(row.communeDisplayName)}')`,
    )
    .join(",\n");

  return `-- Seed missing home-delivery communes from Algeria cities dataset.
-- Source: ${SOURCE_URL}
-- Rules:
-- 1) Insert only missing communes (ON CONFLICT DO NOTHING).
-- 2) Keep existing bureau communes untouched.
-- 3) New communes are home-delivery oriented (office disabled by default).
WITH source(wilaya_code, wilaya_slug, commune_slug, commune_display_name) AS (
VALUES
${values}
),
source_normalized AS (
  SELECT
    s.*,
    ${normalizedSqlExpr("s.wilaya_slug")} AS wilaya_slug_key,
    ${normalizedSqlExpr("s.commune_slug")} AS commune_slug_key,
    ${normalizedSqlExpr("s.commune_display_name")} AS commune_display_key
  FROM source s
),
matched_zones AS (
  SELECT DISTINCT ON (s.wilaya_code, s.commune_slug)
    z.id AS shipping_zone_id,
    s.commune_slug,
    s.commune_display_name,
    s.commune_slug_key,
    s.commune_display_key
  FROM source_normalized s
  JOIN shipping_zones z
    ON (
      ${normalizedSqlExpr("z.name")} = s.wilaya_slug_key
      OR ${normalizedSqlExpr("z.display_name")} = s.wilaya_slug_key
      OR z.id = s.wilaya_code
    )
  ORDER BY
    s.wilaya_code,
    s.commune_slug,
    CASE
      WHEN ${normalizedSqlExpr("z.name")} = s.wilaya_slug_key THEN 0
      WHEN ${normalizedSqlExpr("z.display_name")} = s.wilaya_slug_key THEN 1
      WHEN z.id = s.wilaya_code THEN 2
      ELSE 3
    END,
    z.id
)
INSERT INTO shipping_communes (
  shipping_zone_id,
  name,
  display_name,
  active,
  free_shipping,
  home_delivery_enabled,
  home_delivery_price,
  office_delivery_enabled,
  office_delivery_price
)
SELECT
  mz.shipping_zone_id,
  mz.commune_slug,
  mz.commune_display_name,
  COALESCE(z.active, true),
  COALESCE(z.free_shipping, false),
  COALESCE(z.home_delivery_enabled, true),
  COALESCE(z.home_delivery_price, 0),
  false,
  0
FROM matched_zones mz
JOIN shipping_zones z
  ON z.id = mz.shipping_zone_id
WHERE mz.commune_slug <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM shipping_communes sc
    WHERE sc.shipping_zone_id = mz.shipping_zone_id
      AND (
        ${normalizedSqlExpr("sc.name")} = mz.commune_slug_key
        OR ${normalizedSqlExpr("sc.display_name")} = mz.commune_display_key
        OR ${normalizedSqlExpr("sc.name")} = mz.commune_display_key
        OR ${normalizedSqlExpr("sc.display_name")} = mz.commune_slug_key
      )
  )
ON CONFLICT (shipping_zone_id, name) DO NOTHING;
`;
};

const run = async () => {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch source: ${response.status}`);
  }

  const json = await response.json();
  if (!Array.isArray(json)) {
    throw new Error("Unexpected source format: expected array");
  }

  const rows = buildSourceRows(json);
  const sql = buildSql(rows);

  const migrationDir = path.join("prisma", "migrations", MIGRATION_NAME);
  fs.mkdirSync(migrationDir, { recursive: true });
  fs.writeFileSync(path.join(migrationDir, "migration.sql"), sql);

  console.log(`Created ${MIGRATION_NAME} with ${rows.length} unique communes.`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});