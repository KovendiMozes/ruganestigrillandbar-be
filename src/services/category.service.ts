import { prisma } from '@/config/db';
import { HttpError } from '@/utils/httpError';
import type { CategoryCreateDto, CategoryUpdateDto } from '@/dtos/category.dto';

export const categoryService = {
  list: () => prisma.category.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] }),

  async create(dto: CategoryCreateDto) {
    const exists = await prisma.category.findUnique({ where: { name: dto.name } });
    if (exists) throw new HttpError(409, 'Category already exists');
    return prisma.category.create({ data: dto });
  },

  async update(id: string, dto: CategoryUpdateDto) {
    return prisma.category.update({ where: { id }, data: dto });
  },

  async updateTranslations(id: string, nameEn: string, nameRo: string) {
    return prisma.category.update({ where: { id }, data: { nameEn, nameRo } });
  },

  async remove(id: string) {
    const inUse = await prisma.menuItem.count({ where: { categoryId: id } });
    if (inUse > 0) throw new HttpError(409, `Category is used by ${inUse} menu item(s)`);
    await prisma.category.delete({ where: { id } });
  },

  async findOrCreateByName(name: string): Promise<string> {
    const found = await prisma.category.findUnique({ where: { name } });
    if (found) return found.id;
    const created = await prisma.category.create({ data: { name } });
    return created.id;
  },
};
