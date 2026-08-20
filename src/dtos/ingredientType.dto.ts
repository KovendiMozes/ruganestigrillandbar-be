import { z } from 'zod';

export const ingredientTypeCreateSchema = z.object({
  name: z.string().min(1),
});
export const ingredientTypeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().optional(),
});
export type IngredientTypeCreateDto = z.infer<typeof ingredientTypeCreateSchema>;
export type IngredientTypeUpdateDto = z.infer<typeof ingredientTypeUpdateSchema>;
