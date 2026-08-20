import { prisma } from '@/config/db';
import { HttpError } from '@/utils/httpError';
import type { AllergenCreateDto, AllergenUpdateDto } from '@/dtos/allergen.dto';

export const allergenService = {
  list: () => prisma.allergen.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] }),

  async create(dto: AllergenCreateDto) {
    const exists = await prisma.allergen.findUnique({ where: { name: dto.name } });
    if (exists) throw new HttpError(409, 'Allergen already exists');
    return prisma.allergen.create({ data: dto });
  },

  update: (id: string, dto: AllergenUpdateDto) =>
    prisma.allergen.update({ where: { id }, data: dto }),

  async updateTranslations(id: string, nameEn: string, nameRo: string) {
    return prisma.allergen.update({ where: { id }, data: { nameEn, nameRo } });
  },

  async remove(id: string) {
    await prisma.allergen.delete({ where: { id } });
  },
};
