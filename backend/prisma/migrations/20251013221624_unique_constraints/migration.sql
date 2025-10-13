/*
  Warnings:

  - You are about to drop the column `name` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the column `rrcOperatorNo` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the `OperatorContact` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[operatorEnum,stateAbbr]` on the table `Operator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `operatorEnum` to the `Operator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateAbbr` to the `Operator` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."OperatorContact" DROP CONSTRAINT "OperatorContact_operatorId_fkey";

-- DropIndex
DROP INDEX "public"."Operator_operatorNo_key";

-- AlterTable
ALTER TABLE "Operator" DROP COLUMN "name",
DROP COLUMN "rrcOperatorNo",
ADD COLUMN     "operatorEnum" TEXT NOT NULL,
ADD COLUMN     "stateAbbr" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT;

-- DropTable
DROP TABLE "public"."OperatorContact";

-- CreateTable
CREATE TABLE "OperatorEnum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OperatorEnum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOperator" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "operator" TEXT NOT NULL,

    CONSTRAINT "UserOperator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserOperator_user_operator_key" ON "UserOperator"("user", "operator");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_operatorEnum_stateAbbr_key" ON "Operator"("operatorEnum", "stateAbbr");

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_operatorEnum_fkey" FOREIGN KEY ("operatorEnum") REFERENCES "OperatorEnum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOperator" ADD CONSTRAINT "UserOperator_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOperator" ADD CONSTRAINT "UserOperator_operator_fkey" FOREIGN KEY ("operator") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
