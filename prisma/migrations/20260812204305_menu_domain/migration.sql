-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientDef" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariationSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VariationSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariationOption" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceDelta" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VariationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "totalWeightGr" INTEGER,
    "priceRon" DOUBLE PRECISION NOT NULL,
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemIngredient" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItemIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientChoice" (
    "id" TEXT NOT NULL,
    "menuItemIngredientId" TEXT NOT NULL,
    "ingredientDefId" TEXT NOT NULL,
    "weightGr" INTEGER,
    "count" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IngredientChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuItemVariationSets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientDef_name_key" ON "IngredientDef"("name");

-- CreateIndex
CREATE INDEX "VariationOption_setId_idx" ON "VariationOption"("setId");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");

-- CreateIndex
CREATE INDEX "MenuItemIngredient_menuItemId_idx" ON "MenuItemIngredient"("menuItemId");

-- CreateIndex
CREATE INDEX "IngredientChoice_menuItemIngredientId_idx" ON "IngredientChoice"("menuItemIngredientId");

-- CreateIndex
CREATE INDEX "IngredientChoice_ingredientDefId_idx" ON "IngredientChoice"("ingredientDefId");

-- CreateIndex
CREATE UNIQUE INDEX "_MenuItemVariationSets_AB_unique" ON "_MenuItemVariationSets"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuItemVariationSets_B_index" ON "_MenuItemVariationSets"("B");

-- AddForeignKey
ALTER TABLE "VariationOption" ADD CONSTRAINT "VariationOption_setId_fkey" FOREIGN KEY ("setId") REFERENCES "VariationSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemIngredient" ADD CONSTRAINT "MenuItemIngredient_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientChoice" ADD CONSTRAINT "IngredientChoice_menuItemIngredientId_fkey" FOREIGN KEY ("menuItemIngredientId") REFERENCES "MenuItemIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientChoice" ADD CONSTRAINT "IngredientChoice_ingredientDefId_fkey" FOREIGN KEY ("ingredientDefId") REFERENCES "IngredientDef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemVariationSets" ADD CONSTRAINT "_MenuItemVariationSets_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemVariationSets" ADD CONSTRAINT "_MenuItemVariationSets_B_fkey" FOREIGN KEY ("B") REFERENCES "VariationSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
