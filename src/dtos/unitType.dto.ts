import { z } from 'zod';

export const unitTypeCreateSchema = z.object({ name: z.string().min(1) });
export const unitTypeUpdateSchema = z.object({ name: z.string().min(1).optional() });

export type UnitTypeCreateDto = z.infer<typeof unitTypeCreateSchema>;
export type UnitTypeUpdateDto = z.infer<typeof unitTypeUpdateSchema>;
