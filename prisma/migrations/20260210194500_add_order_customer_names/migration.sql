-- Add required customer identity fields to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_first_name varchar(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_last_name varchar(100) NOT NULL DEFAULT '';

-- Ensure phone is required
UPDATE public.orders SET customer_phone = '' WHERE customer_phone IS NULL;
ALTER TABLE public.orders ALTER COLUMN customer_phone SET DEFAULT '';
ALTER TABLE public.orders ALTER COLUMN customer_phone SET NOT NULL;
