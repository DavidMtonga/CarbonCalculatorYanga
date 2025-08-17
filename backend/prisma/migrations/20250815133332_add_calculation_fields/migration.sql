/*
  Warnings:

  - You are about to drop the `calculations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."calculations" DROP CONSTRAINT "calculations_userId_fkey";

-- DropTable
DROP TABLE "public"."calculations";

-- CreateTable
CREATE TABLE "public"."Calculation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "public"."CalculationType" NOT NULL,
    "commute" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waste" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "electricity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meals" INTEGER NOT NULL DEFAULT 0,
    "embodiedCarbon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emissions" DOUBLE PRECISION NOT NULL,
    "carbonOffset" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cookingDuration" DOUBLE PRECISION,
    "cookingMeals" INTEGER,
    "fuelType" TEXT,
    "charcoalUsed" DOUBLE PRECISION,
    "brazierUses" INTEGER,
    "brazierDuration" DOUBLE PRECISION,
    "afforestationArea" DOUBLE PRECISION,
    "treeSpecies" TEXT,
    "afforestationYears" INTEGER,
    "waterSaved" DOUBLE PRECISION,
    "energySaved" DOUBLE PRECISION,
    "agricultureLand" DOUBLE PRECISION,
    "fertilizer" DOUBLE PRECISION,
    "livestock" INTEGER,
    "methaneCapture" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Calculation_userId_idx" ON "public"."Calculation"("userId");

-- CreateIndex
CREATE INDEX "Calculation_type_idx" ON "public"."Calculation"("type");

-- CreateIndex
CREATE INDEX "Calculation_createdAt_idx" ON "public"."Calculation"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
