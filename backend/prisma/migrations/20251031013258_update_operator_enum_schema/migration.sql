/*
  Warnings:

  - You are about to drop the column `operatorEnum` on the `Operator` table. All the data in the column will be lost.
  - The primary key for the `OperatorEnum` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OperatorEnum` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OperatorEnum` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company,stateAbbr]` on the table `Operator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company` to the `Operator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `OperatorEnum` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Operator" DROP CONSTRAINT "Operator_operatorEnum_fkey";

-- DropIndex
DROP INDEX "public"."Operator_operatorEnum_stateAbbr_key";

-- AlterTable
ALTER TABLE "Operator" DROP COLUMN "operatorEnum",
ADD COLUMN     "company" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OperatorEnum" DROP CONSTRAINT "OperatorEnum_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "company" TEXT NOT NULL,
ADD CONSTRAINT "OperatorEnum_pkey" PRIMARY KEY ("company");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_company_stateAbbr_key" ON "Operator"("company", "stateAbbr");

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_company_fkey" FOREIGN KEY ("company") REFERENCES "OperatorEnum"("company") ON DELETE CASCADE ON UPDATE CASCADE;
