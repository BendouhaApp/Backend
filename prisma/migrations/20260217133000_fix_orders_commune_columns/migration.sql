-- Fix missing commune columns on orders in environments where
-- 20260217001000_add_shipping_communes was partially applied/resolved.

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "customer_commune" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "shipping_commune_id" INTEGER;

CREATE INDEX IF NOT EXISTS "idx_order_shipping_commune_id"
  ON "orders"("shipping_commune_id");

DO $$
BEGIN
  IF to_regclass('public.shipping_communes') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'orders_shipping_commune_id_fkey'
     ) THEN
    ALTER TABLE "orders"
      ADD CONSTRAINT "orders_shipping_commune_id_fkey"
      FOREIGN KEY ("shipping_commune_id")
      REFERENCES "shipping_communes"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END
$$;
