/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `shipping_zones` will be added. If there are existing duplicate values, this will fail.
  - Made the column `active` on table `shipping_zones` required. This step will fail if there are existing NULL values in that column.
  - Made the column `free_shipping` on table `shipping_zones` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "shipping_zones" ADD COLUMN     "home_delivery_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "home_delivery_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "office_delivery_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "office_delivery_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "active" SET NOT NULL,
ALTER COLUMN "active" SET DEFAULT true,
ALTER COLUMN "free_shipping" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "shipping_zones_name_key" ON "shipping_zones"("name");
