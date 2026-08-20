-- AlterTable
ALTER TABLE "VariationOption" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VariationSet" ADD COLUMN     "ingredientDefId" TEXT;

-- CreateIndex
CREATE INDEX "VariationSet_ingredientDefId_idx" ON "VariationSet"("ingredientDefId");

-- AddForeignKey
ALTER TABLE "VariationSet" ADD CONSTRAINT "VariationSet_ingredientDefId_fkey" FOREIGN KEY ("ingredientDefId") REFERENCES "IngredientDef"("id") ON DELETE SET NULL ON UPDATE CASCADE;
