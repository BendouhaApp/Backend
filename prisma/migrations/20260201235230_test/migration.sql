/*
  Warnings:

  - You are about to drop the column `email` on the `staff_accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `staff_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `staff_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "staff_accounts_email_key";

-- AlterTable
ALTER TABLE "staff_accounts" DROP COLUMN "email",
ADD COLUMN     "username" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "staff_accounts_username_key" ON "staff_accounts"("username");
