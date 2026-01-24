-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'CONFIRM', 'CANCEL');

-- CreateEnum
CREATE TYPE "AdminEntity" AS ENUM ('PRODUCT', 'CATEGORY', 'ORDER');

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" "AdminAction" NOT NULL,
    "entity" "AdminEntity" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminLog_admin_id_idx" ON "AdminLog"("admin_id");

-- CreateIndex
CREATE INDEX "AdminLog_entity_entity_id_idx" ON "AdminLog"("entity", "entity_id");

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
