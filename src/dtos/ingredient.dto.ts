import { z } from 'zod';

export const ingredientCreateSchema = z.object({
  name: z.string().min(1),
  priceRon: z.number().min(0).nullable().optional(),
  typeId: z.string().nullable().optional(),
  unitTypeId: z.string().nullable().optional(),
  hideFromKitchen: z.boolean().optional(),
  weightPerUnit: z.number().min(0).nullable().optional(),
});

export const ingredientUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  priceRon: z.number().min(0).nullable().optional(),
  typeId: z.string().nullable().optional(),
  unitTypeId: z.string().nullable().optional(),
  hideFromKitchen: z.boolean().optional(),
  weightPerUnit: z.number().min(0).nullable().optional(),
});

export type IngredientCreateDto = z.infer<typeof ingredientCreateSchema>;
export type IngredientUpdateDto = z.infer<typeof ingredientUpdateSchema>;
