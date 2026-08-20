import { z } from 'zod';

export const ingredientChoiceSchema = z.object({
  ingredientDefId: z.string().min(1),
  variationOptionId: z.string().nullable().optional(),
  weightGr: z.number().int().nonnegative().nullable().optional(),
  count: z.number().int().nonnegative().nullable().optional(),
});

export const menuIngredientSchema = z.object({
  choices: z.array(ingredientChoiceSchema).min(1),
  maxSelections: z.number().int().min(1).default(1),
});

const baseFields = {
  category: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().url().nullable().optional(),
  totalWeightGr: z.number().int().nonnegative().nullable().optional(),
  priceRon: z.number().nonnegative(),
  allergenIds: z.array(z.string()).default([]),
  variationSets: z.array(z.object({
    id: z.string(),
    maxSelections: z.number().int().min(1).default(1),
  })).default([]),
  ingredients: z.array(menuIngredientSchema).default([]),
};

export const menuItemCreateSchema = z.object(baseFields);
export const menuItemUpdateSchema = z.object({
  category: baseFields.category.optional(),
  name: baseFields.name.optional(),
  imageUrl: baseFields.imageUrl,
  totalWeightGr: baseFields.totalWeightGr,
  priceRon: baseFields.priceRon.optional(),
  allergenIds: baseFields.allergenIds.optional(),
  variationSets: baseFields.variationSets.optional(),
  ingredients: baseFields.ingredients.optional(),
});

export type MenuItemCreateDto = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateDto = z.infer<typeof menuItemUpdateSchema>;
export type MenuIngredientDto = z.infer<typeof menuIngredientSchema>;
