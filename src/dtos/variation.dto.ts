import { z } from 'zod';

export const variationOptionSchema = z.object({
  name: z.string().min(1),
  priceDelta: z.number().nullable().optional(),
});

export const variationCreateSchema = z.object({
  name: z.string(),
  ingredientDefId: z.string().nullable().optional(),
  hideFromKitchen: z.boolean().optional(),
  options: z.array(variationOptionSchema).default([]),
});

export const variationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  ingredientDefId: z.string().nullable().optional(),
  hideFromKitchen: z.boolean().optional(),
  options: z.array(variationOptionSchema).optional(),
});

export type VariationOptionDto = z.infer<typeof variationOptionSchema>;
export type VariationCreateDto = z.infer<typeof variationCreateSchema>;
export type VariationUpdateDto = z.infer<typeof variationUpdateSchema>;
