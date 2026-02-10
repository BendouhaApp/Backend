ALTER TABLE "orders"
ADD COLUMN     "customer_phone" VARCHAR(255),
ADD COLUMN     "customer_wilaya" VARCHAR(255),
ADD COLUMN     "delivery_type" VARCHAR(20),
ADD COLUMN     "shipping_zone_id" INTEGER,
ADD COLUMN     "shipping_price" DECIMAL(10,2),
ADD COLUMN     "total_price" DECIMAL(10,2);
