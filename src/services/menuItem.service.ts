import { prisma } from '@/config/db';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import type {
  MenuIngredientDto,
  MenuItemCreateDto,
  MenuItemUpdateDto,
} from '@/dtos/menuItem.dto';

const include = {
  category: true,
  allergens: true,
  variationSets: {
    include: {
      variationSet: {
        include: { options: { orderBy: { order: 'asc' as const } } },
      },
    },
  },
  ingredients: {
    orderBy: { order: 'asc' as const },
    include: {
      choices: {
        orderBy: { order: 'asc' as const },
        include: { ingredientDef: { include: { unitType: true } }, variationOption: true },
      },
    },
  },
};

// Flatten MenuItemVariationSet join rows into VariationSet[] with maxSelections
function reshapeItem(item: Awaited<ReturnType<typeof prisma.menuItem.findUniqueOrThrow>>) {
  const raw = item as any;
  return {
    ...raw,
    variationSets: (raw.variationSets as any[]).map((mivs: any) => ({
      ...mivs.variationSet,
      maxSelections: mivs.maxSelections,
    })),
  };
}

const ingredientCreateData = (ingredients: MenuIngredientDto[]) =>
  ingredients.map((ing, i) => ({
    order: i,
    maxSelections: ing.maxSelections ?? 1,
    choices: {
      create: ing.choices.map((c, j) => ({
        ingredientDefId: c.ingredientDefId,
        variationOptionId: c.variationOptionId ?? null,
        weightGr: c.weightGr ?? null,
        count: c.count ?? null,
        order: j,
      })),
    },
  }));

export const menuItemService = {
  async list() {
    const items = await prisma.menuItem.findMany({ include, orderBy: { createdAt: 'asc' } });
    return items.map(reshapeItem);
  },

  async findById(id: string) {
    const item = await prisma.menuItem.findUnique({ where: { id }, include });
    return item ? reshapeItem(item) : null;
  },

  async create(dto: MenuItemCreateDto) {
    const categoryId = await categoryService.findOrCreateByName(dto.category);
    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name: dto.name,
        imageUrl: dto.imageUrl ?? null,
        totalWeightGr: dto.totalWeightGr ?? null,
        priceRon: dto.priceRon,
        allergens: { connect: dto.allergenIds.map((id) => ({ id })) },
        variationSets: {
          create: dto.variationSets.map(({ id, maxSelections }) => ({
            variationSetId: id,
            maxSelections,
          })),
        },
        ingredients: { create: ingredientCreateData(dto.ingredients) },
      },
      include,
    });
    return reshapeItem(item);
  },

  async update(id: string, dto: MenuItemUpdateDto) {
    const existing = await prisma.menuItem.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    const data: Record<string, unknown> = {};
    if (dto.name != null) data.name = dto.name;
    if (dto.category != null) data.categoryId = await categoryService.findOrCreateByName(dto.category);
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl ?? null;
    if (dto.totalWeightGr !== undefined) data.totalWeightGr = dto.totalWeightGr ?? null;
    if (dto.priceRon != null) data.priceRon = dto.priceRon;

    const updated = await prisma.$transaction(async (tx) => {
      if (dto.ingredients) {
        await tx.menuItemIngredient.deleteMany({ where: { menuItemId: id } });
        data.ingredients = { create: ingredientCreateData(dto.ingredients) };
      }

      if (dto.variationSets) {
        await tx.menuItemVariationSet.deleteMany({ where: { menuItemId: id } });
        await tx.menuItemVariationSet.createMany({
          data: dto.variationSets.map(({ id: variationSetId, maxSelections }) => ({
            menuItemId: id,
            variationSetId,
            maxSelections,
          })),
        });
      }

      if (dto.allergenIds) {
        data.allergens = { set: dto.allergenIds.map((aid) => ({ id: aid })) };
      }

      const result = await tx.menuItem.update({ where: { id }, data, include });

      if (
        existing?.imageUrl &&
        dto.imageUrl !== undefined &&
        existing.imageUrl !== dto.imageUrl
      ) {
        const key = uploadService.keyFromUrl(existing.imageUrl);
        if (key) uploadService.deleteImage(key).catch(() => {});
      }

      return result;
    });

    return reshapeItem(updated);
  },

  async updateTranslations(id: string, nameEn: string, nameRo: string) {
    const item = await prisma.menuItem.update({
      where: { id },
      data: { nameEn, nameRo },
      include,
    });
    return reshapeItem(item);
  },

  async remove(id: string) {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    await prisma.menuItem.delete({ where: { id } });
    if (item?.imageUrl) {
      const key = uploadService.keyFromUrl(item.imageUrl);
      if (key) uploadService.deleteImage(key).catch(() => {});
    }
  },
};
