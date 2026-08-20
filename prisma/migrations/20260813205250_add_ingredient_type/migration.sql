-- AlterTable
ALTER TABLE "IngredientDef" ADD COLUMN     "typeId" TEXT;

-- CreateTable
CREATE TABLE "IngredientType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngredientType_name_key" ON "IngredientType"("name");

-- CreateIndex
CREATE INDEX "IngredientDef_typeId_idx" ON "IngredientDef"("typeId");

-- AddForeignKey
ALTER TABLE "IngredientDef" ADD CONSTRAINT "IngredientDef_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "IngredientType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
