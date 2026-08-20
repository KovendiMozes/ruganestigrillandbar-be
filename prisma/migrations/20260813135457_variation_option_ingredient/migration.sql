-- Clear existing options (dev data, name column is being replaced)
DELETE FROM "VariationOption";

-- AlterTable
ALTER TABLE "VariationOption" DROP COLUMN "name",
ADD COLUMN     "ingredientDefId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "VariationOption_ingredientDefId_idx" ON "VariationOption"("ingredientDefId");

-- AddForeignKey
ALTER TABLE "VariationOption" ADD CONSTRAINT "VariationOption_ingredientDefId_fkey" FOREIGN KEY ("ingredientDefId") REFERENCES "IngredientDef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
