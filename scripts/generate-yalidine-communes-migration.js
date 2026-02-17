const fs = require("fs");
const path = require("path");

const records = JSON.parse(fs.readFileSync(".tmp_yalidine_communes.json", "utf8"));

const escapeSql = (value) => String(value).replace(/'/g, "''");

const values = records
  .map(
    (record) =>
      `  (${record.wilayaCode}, '${escapeSql(record.wilayaSlug)}', '${escapeSql(record.communeSlug)}', '${escapeSql(record.commune)}')`,
  )
  .join(",\n");

const sql = `-- Seed communes from Yalidine "Nos agences" (Wilaya/Commune columns)
-- Source: https://www.yalidine.com/nos-agences/
WITH source(wilaya_code, wilaya_slug, commune_slug, commune_display_name) AS (
VALUES
${values}
),
matched_zones AS (
  SELECT DISTINCT ON (s.wilaya_code, s.commune_slug)
    z.id AS shipping_zone_id,
    s.commune_slug,
    s.commune_display_name
  FROM source s
  JOIN shipping_zones z
    ON (
      regexp_replace(
        translate(
          lower(coalesce(z.name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g')
      OR regexp_replace(
        translate(
          lower(coalesce(z.display_name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g')
      OR z.id = s.wilaya_code
    )
  ORDER BY
    s.wilaya_code,
    s.commune_slug,
    CASE
      WHEN regexp_replace(
        translate(
          lower(coalesce(z.name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g') THEN 0
      WHEN regexp_replace(
        translate(
          lower(coalesce(z.display_name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g') THEN 1
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
  z.active,
  z.free_shipping,
  z.home_delivery_enabled,
  z.home_delivery_price,
  z.office_delivery_enabled,
  z.office_delivery_price
FROM matched_zones mz
JOIN shipping_zones z
  ON z.id = mz.shipping_zone_id
WHERE mz.commune_slug <> ''
ON CONFLICT (shipping_zone_id, name) DO NOTHING;
`;

const migrationDir = path.join(
  "prisma",
  "migrations",
  "20260217014000_seed_yalidine_communes",
);
fs.mkdirSync(migrationDir, { recursive: true });
fs.writeFileSync(path.join(migrationDir, "migration.sql"), sql);

console.log(`Created migration with ${records.length} commune rows.`);
