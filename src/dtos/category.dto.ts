import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().optional(),
});

export type CategoryCreateDto = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateDto = z.infer<typeof categoryUpdateSchema>;
