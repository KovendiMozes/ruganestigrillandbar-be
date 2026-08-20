import { z } from 'zod';

export const allergenCreateSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().optional(),
});

export const allergenUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().optional(),
});

export type AllergenCreateDto = z.infer<typeof allergenCreateSchema>;
export type AllergenUpdateDto = z.infer<typeof allergenUpdateSchema>;
