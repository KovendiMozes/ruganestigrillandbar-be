import { prisma } from '@/config/db';

const DEFAULTS: Record<string, string> = {
  packFeeRon: '2',
};

export const settingService = {
  async get(key: string): Promise<string> {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? DEFAULTS[key] ?? '';
  },

  async getAll(): Promise<Record<string, string>> {
    const rows = await prisma.setting.findMany();
    const result = { ...DEFAULTS };
    for (const r of rows) result[r.key] = r.value;
    return result;
  },

  async set(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },
};
