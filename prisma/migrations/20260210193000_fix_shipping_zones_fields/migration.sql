-- Ensure shipping_zones has delivery fields expected by Prisma schema
ALTER TABLE public.shipping_zones
  ADD COLUMN IF NOT EXISTS home_delivery_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS home_delivery_price numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS office_delivery_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS office_delivery_price numeric(10,2) DEFAULT 0;

-- Align default with schema
ALTER TABLE public.shipping_zones
  ALTER COLUMN active SET DEFAULT true;
