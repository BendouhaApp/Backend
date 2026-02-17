-- Add commune-level shipping table
CREATE TABLE "shipping_communes" (
    "id" SERIAL NOT NULL,
    "shipping_zone_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "free_shipping" BOOLEAN NOT NULL DEFAULT false,
    "home_delivery_enabled" BOOLEAN NOT NULL DEFAULT true,
    "home_delivery_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "office_delivery_enabled" BOOLEAN NOT NULL DEFAULT true,
    "office_delivery_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipping_communes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "uq_shipping_communes_zone_name"
    ON "shipping_communes"("shipping_zone_id", "name");
CREATE INDEX "idx_shipping_communes_zone_id"
    ON "shipping_communes"("shipping_zone_id");
CREATE INDEX "idx_shipping_communes_active"
    ON "shipping_communes"("active");

ALTER TABLE "shipping_communes"
    ADD CONSTRAINT "shipping_communes_shipping_zone_id_fkey"
    FOREIGN KEY ("shipping_zone_id")
    REFERENCES "shipping_zones"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

-- Store selected commune on orders
ALTER TABLE "orders"
    ADD COLUMN "customer_commune" VARCHAR(255),
    ADD COLUMN "shipping_commune_id" INTEGER;

CREATE INDEX "idx_order_shipping_commune_id"
    ON "orders"("shipping_commune_id");

ALTER TABLE "orders"
    ADD CONSTRAINT "orders_shipping_commune_id_fkey"
    FOREIGN KEY ("shipping_commune_id")
    REFERENCES "shipping_communes"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Backfill one default commune per existing wilaya (zone)
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
    sz."name",
    sz."display_name",
    sz."active",
    sz."free_shipping",
    sz."home_delivery_enabled",
    sz."home_delivery_price",
    sz."office_delivery_enabled",
    sz."office_delivery_price"
FROM "shipping_zones" sz;
