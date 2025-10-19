/*
  Warnings:

  - You are about to drop the `UserOperator` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `phoneNumber` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."UserOperator" DROP CONSTRAINT "UserOperator_operator_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserOperator" DROP CONSTRAINT "UserOperator_user_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phoneNumber" SET NOT NULL;

-- DropTable
DROP TABLE "public"."UserOperator";

-- CreateTable
CREATE TABLE "OperatorUser" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "operator" TEXT NOT NULL,

    CONSTRAINT "OperatorUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperatorUser_user_operator_key" ON "OperatorUser"("user", "operator");

-- AddForeignKey
ALTER TABLE "OperatorUser" ADD CONSTRAINT "OperatorUser_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorUser" ADD CONSTRAINT "OperatorUser_operator_fkey" FOREIGN KEY ("operator") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
