-- CreateTable
CREATE TABLE "public"."Offset" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "baselineCalculationId" INTEGER,
    "improvedCalculationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offset_userId_idx" ON "public"."Offset"("userId");

-- CreateIndex
CREATE INDEX "Offset_baselineCalculationId_idx" ON "public"."Offset"("baselineCalculationId");

-- CreateIndex
CREATE INDEX "Offset_improvedCalculationId_idx" ON "public"."Offset"("improvedCalculationId");

-- AddForeignKey
ALTER TABLE "public"."Offset" ADD CONSTRAINT "Offset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Offset" ADD CONSTRAINT "Offset_baselineCalculationId_fkey" FOREIGN KEY ("baselineCalculationId") REFERENCES "public"."Calculation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Offset" ADD CONSTRAINT "Offset_improvedCalculationId_fkey" FOREIGN KEY ("improvedCalculationId") REFERENCES "public"."Calculation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
