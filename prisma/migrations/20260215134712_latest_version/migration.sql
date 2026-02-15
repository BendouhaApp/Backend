/*
  Warnings:

  - You are about to drop the column `privileges` on the `roles` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AdminAction" ADD VALUE 'LOGIN_FAILED';

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "customer_phone" DROP DEFAULT,
ALTER COLUMN "customer_first_name" DROP DEFAULT,
ALTER COLUMN "customer_last_name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "angle" SET DEFAULT 60,
ALTER COLUMN "cct" SET DEFAULT 3000,
ALTER COLUMN "cri" SET DEFAULT 90,
ALTER COLUMN "lumen" SET DEFAULT 800,
ALTER COLUMN "power" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "privileges",
ADD COLUMN     "permissions" TEXT[];

-- AlterTable
ALTER TABLE "staff_accounts" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_failed_login_at" TIMESTAMP(3),
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "locked_until" TIMESTAMP(3),
ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "room_type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "width" DECIMAL(6,2) NOT NULL,
    "length" DECIMAL(6,2) NOT NULL,
    "height" DECIMAL(6,2) NOT NULL,
    "unit" VARCHAR(10) NOT NULL DEFAULT 'm',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_obstacles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "room_id" UUID NOT NULL,
    "obstacle_id" VARCHAR(64) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "width" DECIMAL(6,2) NOT NULL,
    "depth" DECIMAL(6,2) NOT NULL,
    "height" DECIMAL(6,2) NOT NULL,
    "placement_x" DECIMAL(5,2) NOT NULL,
    "placement_z" DECIMAL(5,2) NOT NULL,
    "blocks_light" BOOLEAN DEFAULT false,

    CONSTRAINT "room_obstacles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_refresh_tokens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "admin_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_room_type" ON "rooms"("room_type");

-- CreateIndex
CREATE INDEX "idx_room_obstacles_room_id" ON "room_obstacles"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_refresh_tokens_token_hash_key" ON "admin_refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "admin_refresh_tokens_admin_id_idx" ON "admin_refresh_tokens"("admin_id");

-- CreateIndex
CREATE INDEX "admin_refresh_tokens_expires_at_idx" ON "admin_refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "admin_refresh_tokens_revoked_idx" ON "admin_refresh_tokens"("revoked");

-- CreateIndex
CREATE INDEX "staff_accounts_role_id_idx" ON "staff_accounts"("role_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_zone_id_fkey" FOREIGN KEY ("shipping_zone_id") REFERENCES "shipping_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_obstacles" ADD CONSTRAINT "room_obstacles_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin_refresh_tokens" ADD CONSTRAINT "admin_refresh_tokens_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "staff_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
