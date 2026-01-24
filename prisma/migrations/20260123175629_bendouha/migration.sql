/*
  Warnings:

  - You are about to drop the column `customer_email` on the `Order` table. All the data in the column will be lost.
  - Added the required column `customer_phone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_wilaya` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customer_email",
ADD COLUMN     "customer_phone" TEXT NOT NULL,
ADD COLUMN     "customer_wilaya" TEXT NOT NULL;
