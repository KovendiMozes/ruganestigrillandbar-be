-- DropForeignKey
ALTER TABLE "VariationOption" DROP CONSTRAINT "VariationOption_ingredientDefId_fkey";

-- DropIndex
DROP INDEX "VariationOption_ingredientDefId_idx";

-- AlterTable (clear first since name is required)
DELETE FROM "VariationOption";
ALTER TABLE "VariationOption" DROP COLUMN "ingredientDefId",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';
