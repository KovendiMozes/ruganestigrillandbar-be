import { prisma } from '@/config/db';
import { HttpError } from '@/utils/httpError';
import type { IngredientTypeCreateDto, IngredientTypeUpdateDto } from '@/dtos/ingredientType.dto';

export const ingredientTypeService = {
  list: () => prisma.ingredientType.findMany({ orderBy: { order: 'asc' } }),

  async create(dto: IngredientTypeCreateDto) {
    const exists = await prisma.ingredientType.findUnique({ where: { name: dto.name } });
    if (exists) throw new HttpError(409, 'Type already exists');
    const count = await prisma.ingredientType.count();
    return prisma.ingredientType.create({ data: { ...dto, order: count } });
  },

  update: (id: string, dto: IngredientTypeUpdateDto) =>
    prisma.ingredientType.update({ where: { id }, data: dto }),

  async updateTranslations(id: string, nameEn: string, nameRo: string) {
    return prisma.ingredientType.update({ where: { id }, data: { nameEn, nameRo } });
  },

  async remove(id: string) {
    const uses = await prisma.ingredientDef.count({ where: { typeId: id } });
    if (uses > 0) throw new HttpError(409, `Type is used by ${uses} ingredient(s)`);
    await prisma.ingredientType.delete({ where: { id } });
  },
};
