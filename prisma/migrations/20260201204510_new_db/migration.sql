CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdminLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CartItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "AdminAction" ADD VALUE 'LOGIN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminEntity" ADD VALUE 'COUPON';
ALTER TYPE "AdminEntity" ADD VALUE 'SHIPPING';
ALTER TYPE "AdminEntity" ADD VALUE 'USER';
ALTER TYPE "AdminEntity" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "AdminLog" DROP CONSTRAINT "AdminLog_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_product_id_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_created_by_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_order_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_product_id_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_category_id_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "AdminLog";

-- DropTable
DROP TABLE "Cart";

-- DropTable
DROP TABLE "CartItem";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "Product";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "attribute_id" UUID NOT NULL,
    "attribute_value" VARCHAR(255) NOT NULL,
    "color" VARCHAR(50),

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "attribute_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "card_id" UUID,
    "product_id" UUID,
    "quantity" INTEGER DEFAULT 1,

    CONSTRAINT "card_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "customer_id" UUID,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parent_id" UUID,
    "category_name" VARCHAR(255) NOT NULL,
    "category_description" TEXT,
    "icon" TEXT,
    "image" TEXT,
    "placeholder" TEXT,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "iso" CHAR(2) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "upper_name" VARCHAR(80) NOT NULL,
    "iso3" CHAR(3),
    "num_code" SMALLINT,
    "phone_code" INTEGER NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) NOT NULL,
    "discount_value" DECIMAL,
    "discount_type" VARCHAR(50) NOT NULL,
    "times_used" DECIMAL NOT NULL DEFAULT 0,
    "max_usage" DECIMAL,
    "order_amount_limit" DECIMAL,
    "coupon_start_date" TIMESTAMPTZ(6),
    "coupon_end_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "customer_id" UUID,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "phone_number" VARCHAR(255) NOT NULL,
    "dial_code" VARCHAR(100) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "postal_code" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN DEFAULT true,
    "registered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID,
    "image" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "is_thumbnail" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "account_id" UUID,
    "title" VARCHAR(100),
    "content" TEXT,
    "seen" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receive_time" TIMESTAMPTZ(6),
    "notification_expiry_date" DATE,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID,
    "order_id" VARCHAR(50),
    "price" DECIMAL NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_statuses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "status_name" VARCHAR(255) NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "privacy" VARCHAR(10) NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "order_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(50) NOT NULL,
    "coupon_id" UUID,
    "customer_id" UUID,
    "order_status_id" UUID,
    "order_approved_at" TIMESTAMPTZ(6),
    "order_delivered_carrier_date" TIMESTAMPTZ(6),
    "order_delivered_customer_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_values" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_attribute_id" UUID NOT NULL,
    "attribute_value_id" UUID NOT NULL,

    CONSTRAINT "product_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_coupons" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,

    CONSTRAINT "product_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_shipping_info" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID,
    "weight" DECIMAL NOT NULL DEFAULT 0,
    "weight_unit" VARCHAR(10),
    "volume" DECIMAL NOT NULL DEFAULT 0,
    "volume_unit" VARCHAR(10),
    "dimension_width" DECIMAL NOT NULL DEFAULT 0,
    "dimension_height" DECIMAL NOT NULL DEFAULT 0,
    "dimension_depth" DECIMAL NOT NULL DEFAULT 0,
    "dimension_unit" VARCHAR(10),

    CONSTRAINT "product_shipping_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_suppliers" (
    "product_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,

    CONSTRAINT "product_suppliers_pkey" PRIMARY KEY ("product_id","supplier_id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "tag_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("tag_id","product_id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(255),
    "sale_price" DECIMAL NOT NULL DEFAULT 0,
    "compare_price" DECIMAL DEFAULT 0,
    "buying_price" DECIMAL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "short_description" VARCHAR(165) NOT NULL,
    "product_description" TEXT NOT NULL,
    "product_type" VARCHAR(64),
    "published" BOOLEAN DEFAULT false,
    "disable_out_of_stock" BOOLEAN DEFAULT true,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(255) NOT NULL,
    "privileges" TEXT[],

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sells" (
    "id" SERIAL NOT NULL,
    "product_id" UUID,
    "price" DECIMAL NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "sells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_country_zones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "shipping_zone_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "shipping_country_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "shipping_zone_id" INTEGER NOT NULL,
    "weight_unit" VARCHAR(10),
    "min_value" DECIMAL NOT NULL DEFAULT 0,
    "max_value" DECIMAL,
    "no_max" BOOLEAN DEFAULT true,
    "price" DECIMAL NOT NULL DEFAULT 0,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "active" BOOLEAN DEFAULT false,
    "free_shipping" BOOLEAN DEFAULT false,
    "rate_type" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slideshows" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(80),
    "destination_url" TEXT,
    "image" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "description" VARCHAR(160),
    "btn_label" VARCHAR(50),
    "display_order" INTEGER NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "styles" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "slideshows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_accounts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role_id" INTEGER,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN DEFAULT true,
    "image" TEXT,
    "placeholder" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "staff_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "admin_id" UUID NOT NULL,
    "action" "AdminAction" NOT NULL,
    "entity" "AdminEntity" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "supplier_name" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255),
    "phone_number" VARCHAR(255),
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "country_id" INTEGER NOT NULL,
    "city" VARCHAR(255),
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tag_name" VARCHAR(255) NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_options" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "image_id" UUID,
    "product_id" UUID NOT NULL,
    "sale_price" DECIMAL NOT NULL DEFAULT 0,
    "compare_price" DECIMAL DEFAULT 0,
    "buying_price" DECIMAL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "sku" VARCHAR(255),
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "variant_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_values" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "variant_id" UUID NOT NULL,
    "product_attribute_value_id" UUID NOT NULL,

    CONSTRAINT "variant_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "variant_option" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_option_id" UUID NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_attribute_values" ON "attribute_values"("attribute_id");

-- CreateIndex
CREATE INDEX "idx_customer_id_card" ON "cards"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "idx_code_coupons" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "idx_customer_email" ON "customers"("email");

-- CreateIndex
CREATE INDEX "idx_image_gallery" ON "gallery"("product_id", "is_thumbnail");

-- CreateIndex
CREATE INDEX "idx_order_id_order_item" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_product_id_order_item" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "idx_order_customer_id" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "idx_product_attribute_values_attribute_value_id" ON "product_attribute_values"("attribute_value_id");

-- CreateIndex
CREATE INDEX "idx_product_attribute_values_product_attribute_id" ON "product_attribute_values"("product_attribute_id");

-- CreateIndex
CREATE INDEX "idx_product_attribute_fk" ON "product_attributes"("product_id", "attribute_id");

-- CreateIndex
CREATE INDEX "idx_product_category" ON "product_categories"("product_id", "category_id");

-- CreateIndex
CREATE INDEX "idx_product_id_coupon_id_product_coupons" ON "product_coupons"("product_id", "coupon_id");

-- CreateIndex
CREATE INDEX "idx_product_shipping_info_product_id" ON "product_shipping_info"("product_id");

-- CreateIndex
CREATE INDEX "idx_product_supplier" ON "product_suppliers"("product_id", "supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "idx_product_publish" ON "products"("published");

-- CreateIndex
CREATE UNIQUE INDEX "sells_product_id_key" ON "sells"("product_id");

-- CreateIndex
CREATE INDEX "idx_country_id_shipping_country_zones" ON "shipping_country_zones"("country_id");

-- CreateIndex
CREATE INDEX "idx_shipping_zone_id_shipping_country_zones" ON "shipping_country_zones"("shipping_zone_id");

-- CreateIndex
CREATE INDEX "idx_slideshows_publish" ON "slideshows"("published");

-- CreateIndex
CREATE UNIQUE INDEX "staff_accounts_email_key" ON "staff_accounts"("email");

-- CreateIndex
CREATE INDEX "admins_logs_admin_id_idx" ON "admins_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admins_logs_entity_entity_id_idx" ON "admins_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "idx_variant_options_product_id" ON "variant_options"("product_id");

-- CreateIndex
CREATE INDEX "idx_product_attribute_value_id_variant_values" ON "variant_values"("product_attribute_value_id");

-- CreateIndex
CREATE INDEX "idx_variant_id_variant_values" ON "variant_values"("variant_id");

-- CreateIndex
CREATE INDEX "idx_product_id_variants" ON "variants"("product_id");

-- CreateIndex
CREATE INDEX "idx_variant_option_id_variants" ON "variants"("variant_option_id");

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_items" ADD CONSTRAINT "card_items_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_items" ADD CONSTRAINT "card_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_statuses" ADD CONSTRAINT "order_statuses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_statuses" ADD CONSTRAINT "order_statuses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_id_fkey" FOREIGN KEY ("order_status_id") REFERENCES "order_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_product_attribute_id_fkey" FOREIGN KEY ("product_attribute_id") REFERENCES "product_attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_coupons" ADD CONSTRAINT "product_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_coupons" ADD CONSTRAINT "product_coupons_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_shipping_info" ADD CONSTRAINT "product_shipping_info_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sells" ADD CONSTRAINT "sells_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shipping_country_zones" ADD CONSTRAINT "shipping_country_zones_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shipping_country_zones" ADD CONSTRAINT "shipping_country_zones_shipping_zone_id_fkey" FOREIGN KEY ("shipping_zone_id") REFERENCES "shipping_zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_shipping_zone_id_fkey" FOREIGN KEY ("shipping_zone_id") REFERENCES "shipping_zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "slideshows" ADD CONSTRAINT "slideshows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "slideshows" ADD CONSTRAINT "slideshows_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_accounts" ADD CONSTRAINT "staff_accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_accounts" ADD CONSTRAINT "staff_accounts_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_accounts" ADD CONSTRAINT "staff_accounts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admins_logs" ADD CONSTRAINT "admins_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "staff_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "staff_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "gallery"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variant_values" ADD CONSTRAINT "variant_values_product_attribute_value_id_fkey" FOREIGN KEY ("product_attribute_value_id") REFERENCES "product_attribute_values"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variant_values" ADD CONSTRAINT "variant_values_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variants" ADD CONSTRAINT "variants_variant_option_id_fkey" FOREIGN KEY ("variant_option_id") REFERENCES "variant_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
