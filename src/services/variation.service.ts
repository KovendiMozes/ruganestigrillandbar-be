import { prisma } from '@/config/db';
import type {
  VariationCreateDto,
  VariationOptionDto,
  VariationUpdateDto,
} from '@/dtos/variation.dto';

const include = {
  ingredientDef: { select: { id: true, name: true } },
  options: { orderBy: { order: 'asc' as const } },
};

const optionsData = (options: VariationOptionDto[]) =>
  options.map((o, i) => ({
    name: o.name,
    priceDelta: o.priceDelta ?? null,
    order: i,
  }));

export const variationService = {
  list: () => prisma.variationSet.findMany({ include, orderBy: { createdAt: 'asc' } }),

  findById: (id: string) => prisma.variationSet.findUnique({ where: { id }, include }),

  create: (dto: VariationCreateDto) =>
    prisma.variationSet.create({
      data: {
        name: dto.name,
        ingredientDefId: dto.ingredientDefId ?? null,
        hideFromKitchen: dto.hideFromKitchen ?? false,
        options: { create: optionsData(dto.options) },
      },
      include,
    }),

  async update(id: string, dto: VariationUpdateDto) {
    return prisma.$transaction(async (tx) => {
      if (dto.options) {
        await tx.variationOption.deleteMany({ where: { setId: id } });
        await tx.variationOption.createMany({
          data: optionsData(dto.options).map((o) => ({ ...o, setId: id })),
        });
      }
      return tx.variationSet.update({
        where: { id },
        data: {
          ...(dto.name != null ? { name: dto.name } : {}),
          ...(dto.ingredientDefId !== undefined
            ? {
                ingredientDef: dto.ingredientDefId
                  ? { connect: { id: dto.ingredientDefId } }
                  : { disconnect: true },
              }
            : {}),
          ...(dto.hideFromKitchen !== undefined ? { hideFromKitchen: dto.hideFromKitchen } : {}),
        },
        include,
      });
    });
  },

  async remove(id: string) {
    await prisma.variationSet.delete({ where: { id } });
  },

  async updateOptionTranslations(optionId: string, nameEn: string, nameRo: string) {
    return prisma.variationOption.update({
      where: { id: optionId },
      data: { nameEn, nameRo },
    });
  },

  listOptions: () =>
    prisma.variationOption.findMany({
      orderBy: [{ setId: 'asc' }, { order: 'asc' }],
      include: { set: { select: { id: true, name: true } } },
    }),
};
