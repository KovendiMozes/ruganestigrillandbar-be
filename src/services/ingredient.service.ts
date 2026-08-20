import { prisma } from '@/config/db';
import { HttpError } from '@/utils/httpError';
import type { IngredientCreateDto, IngredientUpdateDto } from '@/dtos/ingredient.dto';

const includeRelations = {
  type: { select: { id: true, name: true } },
  unitType: { select: { id: true, name: true, nameEn: true, nameRo: true } },
};

export const ingredientService = {
  list: () => prisma.ingredientDef.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, nameEn: true, nameRo: true,
      priceRon: true, typeId: true, hideFromKitchen: true, weightPerUnit: true,
      type: { select: { id: true, name: true } },
      unitTypeId: true,
      unitType: { select: { id: true, name: true, nameEn: true, nameRo: true } },
    },
  }),

  async create(dto: IngredientCreateDto) {
    const exists = await prisma.ingredientDef.findUnique({ where: { name: dto.name } });
    if (exists) throw new HttpError(409, 'Ingredient already exists');
    return prisma.ingredientDef.create({
      data: {
        name: dto.name,
        priceRon: dto.priceRon,
        typeId: dto.typeId,
        unitTypeId: dto.unitTypeId ?? null,
        hideFromKitchen: dto.hideFromKitchen ?? false,
        weightPerUnit: dto.weightPerUnit ?? null,
      },
      include: includeRelations,
    });
  },

  update: (id: string, dto: IngredientUpdateDto) =>
    prisma.ingredientDef.update({
      where: { id },
      data: { name: dto.name, priceRon: dto.priceRon, typeId: dto.typeId, unitTypeId: dto.unitTypeId, hideFromKitchen: dto.hideFromKitchen, weightPerUnit: dto.weightPerUnit },
      include: includeRelations,
    }),

  async updateTranslations(id: string, nameEn: string, nameRo: string) {
    return prisma.ingredientDef.update({ where: { id }, data: { nameEn, nameRo } });
  },

  async remove(id: string) {
    const uses = await prisma.ingredientChoice.count({ where: { ingredientDefId: id } });
    if (uses > 0) throw new HttpError(409, `Ingredient is used in ${uses} place(s)`);
    await prisma.ingredientDef.delete({ where: { id } });
  },
};
