CREATE TABLE "UnitType" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UnitType_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UnitType_name_key" ON "UnitType"("name");

ALTER TABLE "IngredientDef" ADD COLUMN "unitTypeId" TEXT;

CREATE INDEX "IngredientDef_unitTypeId_idx" ON "IngredientDef"("unitTypeId");

ALTER TABLE "IngredientDef" ADD CONSTRAINT "IngredientDef_unitTypeId_fkey"
  FOREIGN KEY ("unitTypeId") REFERENCES "UnitType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
