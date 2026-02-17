-- Seed missing shipping communes.
-- This keeps existing commune data untouched and only backfills zones with none.
INSERT INTO "shipping_communes" (
    "shipping_zone_id",
    "name",
    "display_name",
    "active",
    "free_shipping",
    "home_delivery_enabled",
    "home_delivery_price",
    "office_delivery_enabled",
    "office_delivery_price"
)
SELECT
    sz."id",
    'default',
    CASE
        WHEN COALESCE(NULLIF(TRIM(sz."display_name"), ''), NULLIF(TRIM(sz."name"), '')) IS NOT NULL
            THEN COALESCE(NULLIF(TRIM(sz."display_name"), ''), NULLIF(TRIM(sz."name"), '')) || ' Centre'
        ELSE 'Centre'
    END,
    COALESCE(sz."active", true),
    COALESCE(sz."free_shipping", false),
    COALESCE(sz."home_delivery_enabled", true),
    COALESCE(sz."home_delivery_price", 0),
    COALESCE(sz."office_delivery_enabled", true),
    COALESCE(sz."office_delivery_price", 0)
FROM "shipping_zones" sz
WHERE NOT EXISTS (
    SELECT 1
    FROM "shipping_communes" sc
    WHERE sc."shipping_zone_id" = sz."id"
)
ON CONFLICT ("shipping_zone_id", "name") DO NOTHING;
