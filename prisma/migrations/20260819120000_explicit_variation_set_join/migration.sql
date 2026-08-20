-- CreateTable: explicit join for MenuItem <-> VariationSet with maxSelections per menu item
CREATE TABLE "MenuItemVariationSet" (
    "menuItemId" TEXT NOT NULL,
    "variationSetId" TEXT NOT NULL,
    "maxSelections" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MenuItemVariationSet_pkey" PRIMARY KEY ("menuItemId","variationSetId")
);

-- Migrate data from implicit join table (A = MenuItem, B = VariationSet alphabetically)
INSERT INTO "MenuItemVariationSet" ("menuItemId", "variationSetId", "maxSelections")
SELECT "A", "B", 1 FROM "_MenuItemVariationSets";

-- CreateIndex
CREATE INDEX "MenuItemVariationSet_variationSetId_idx" ON "MenuItemVariationSet"("variationSetId");

-- AddForeignKey
ALTER TABLE "MenuItemVariationSet" ADD CONSTRAINT "MenuItemVariationSet_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemVariationSet" ADD CONSTRAINT "MenuItemVariationSet_variationSetId_fkey" FOREIGN KEY ("variationSetId") REFERENCES "VariationSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop implicit join table
DROP TABLE "_MenuItemVariationSets";

-- Remove maxSelections from VariationSet (now per menu item)
ALTER TABLE "VariationSet" DROP COLUMN IF EXISTS "maxSelections";
