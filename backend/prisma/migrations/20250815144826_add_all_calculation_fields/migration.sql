/*
  Warnings:

  - The values [PERSONAL,BRAZIER] on the enum `CalculationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `afforestationArea` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `afforestationYears` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `agricultureLand` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `brazierDuration` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `brazierUses` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `energySaved` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `fertilizer` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `livestock` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `methaneCapture` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `treeSpecies` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `waterSaved` on the `Calculation` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CalculationType_new" AS ENUM ('TRANSPORTATION', 'WASTE', 'ENERGY', 'FOOD', 'COOKING', 'CONSTRUCTION', 'MANUFACTURING', 'AFFORESTATION', 'WATER', 'AGRICULTURE');
ALTER TABLE "public"."Calculation" ALTER COLUMN "type" TYPE "public"."CalculationType_new" USING ("type"::text::"public"."CalculationType_new");
ALTER TYPE "public"."CalculationType" RENAME TO "CalculationType_old";
ALTER TYPE "public"."CalculationType_new" RENAME TO "CalculationType";
DROP TYPE "public"."CalculationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Calculation" DROP COLUMN "afforestationArea",
DROP COLUMN "afforestationYears",
DROP COLUMN "agricultureLand",
DROP COLUMN "brazierDuration",
DROP COLUMN "brazierUses",
DROP COLUMN "energySaved",
DROP COLUMN "fertilizer",
DROP COLUMN "livestock",
DROP COLUMN "methaneCapture",
DROP COLUMN "treeSpecies",
DROP COLUMN "waterSaved",
ADD COLUMN     "commuteType" TEXT,
ADD COLUMN     "dietType" TEXT,
ADD COLUMN     "energySource" TEXT,
ADD COLUMN     "wasteType" TEXT;
