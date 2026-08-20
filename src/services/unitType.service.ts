import { prisma } from '@/config/db';
import { HttpError } from '@/utils/httpError';
import type { UnitTypeCreateDto, UnitTypeUpdateDto } from '@/dtos/unitType.dto';

export const unitTypeService = {
  list: () => prisma.unitType.findMany({ orderBy: { name: 'asc' } }),

  async create(dto: UnitTypeCreateDto) {
    const exists = await prisma.unitType.findUnique({ where: { name: dto.name } });
    if (exists) throw new HttpError(409, 'Unit type already exists');
    return prisma.unitType.create({ data: { name: dto.name } });
  },

  update: (id: string, dto: UnitTypeUpdateDto) =>
    prisma.unitType.update({ where: { id }, data: dto }),

  async updateTranslations(id: string, nameEn: string, nameRo: string) {
    return prisma.unitType.update({ where: { id }, data: { nameEn, nameRo } });
  },

  async remove(id: string) {
    const uses = await prisma.ingredientDef.count({ where: { unitTypeId: id } });
    if (uses > 0) throw new HttpError(409, `Unit type is used by ${uses} ingredient(s)`);
    await prisma.unitType.delete({ where: { id } });
  },
};
