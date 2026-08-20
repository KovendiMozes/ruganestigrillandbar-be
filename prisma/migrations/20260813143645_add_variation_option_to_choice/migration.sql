-- AlterTable
ALTER TABLE "IngredientChoice" ADD COLUMN     "variationOptionId" TEXT;

-- CreateIndex
CREATE INDEX "IngredientChoice_variationOptionId_idx" ON "IngredientChoice"("variationOptionId");

-- AddForeignKey
ALTER TABLE "IngredientChoice" ADD CONSTRAINT "IngredientChoice_variationOptionId_fkey" FOREIGN KEY ("variationOptionId") REFERENCES "VariationOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
