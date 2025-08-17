/*
  Warnings:

  - The values [TRANSPORTATION,WASTE,ENERGY,FOOD,CONSTRUCTION,MANUFACTURING,AFFORESTATION,WATER,AGRICULTURE] on the enum `CalculationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `commute` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `commuteType` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `dietType` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `electricity` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `embodiedCarbon` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `energySource` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `meals` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `waste` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `wasteType` on the `Calculation` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CalculationType_new" AS ENUM ('COOKING');
ALTER TABLE "public"."Calculation" ALTER COLUMN "type" TYPE "public"."CalculationType_new" USING ("type"::text::"public"."CalculationType_new");
ALTER TYPE "public"."CalculationType" RENAME TO "CalculationType_old";
ALTER TYPE "public"."CalculationType_new" RENAME TO "CalculationType";
DROP TYPE "public"."CalculationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Calculation" DROP COLUMN "commute",
DROP COLUMN "commuteType",
DROP COLUMN "dietType",
DROP COLUMN "electricity",
DROP COLUMN "embodiedCarbon",
DROP COLUMN "energySource",
DROP COLUMN "meals",
DROP COLUMN "waste",
DROP COLUMN "wasteType",
ALTER COLUMN "type" SET DEFAULT 'COOKING';
