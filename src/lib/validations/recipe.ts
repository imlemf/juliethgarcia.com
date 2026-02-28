import { z } from 'zod';

// Helper to generate slug from name
export function generateRecipeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// Measurement units
export const MEASUREMENT_UNITS = [
  { value: 'g', label: 'gramos' },
  { value: 'kg', label: 'kilogramos' },
  { value: 'ml', label: 'mililitros' },
  { value: 'l', label: 'litros' },
  { value: 'unit', label: 'unidad(es)' },
  { value: 'tbsp', label: 'cucharada(s)' },
  { value: 'tsp', label: 'cucharadita(s)' },
  { value: 'cup', label: 'taza(s)' },
  { value: 'pinch', label: 'pizca(s)' },
] as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Medio' },
  { value: 'hard', label: 'Difícil' },
] as const;

// Recipe Category schemas
export const createRecipeCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(200, 'La descripción es muy larga').optional().nullable(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updateRecipeCategorySchema = createRecipeCategorySchema.partial();

// Ingredient schema (for preparation ingredients)
export const recipeIngredientSchema = z.object({
  id: z.string().optional(), // for editing existing
  name: z.string().min(1, 'El nombre del ingrediente es requerido').max(100),
  quantity: z.number().min(0, 'La cantidad debe ser positiva'),
  unit: z.string().min(1, 'La unidad es requerida'),
  calories: z.number().min(0).optional().nullable(),
  order: z.number().min(0).optional(),
});

// Step schema
export const recipeStepSchema = z.object({
  id: z.string().optional(), // for editing existing
  instruction: z.string().min(1, 'La instrucción es requerida').max(1000),
  order: z.number().min(0).optional(),
  timerSeconds: z.number().min(1).optional().nullable(),
});

// Preparation schema
export const recipePreparationSchema = z.object({
  id: z.string().optional(), // for editing existing
  title: z.string().min(1, 'El título de la preparación es requerido').max(100),
  order: z.number().min(0).optional(),
  steps: z.array(recipeStepSchema).min(1, 'La preparación debe tener al menos un paso'),
  ingredients: z.array(recipeIngredientSchema).optional().default([]),
});

// Main recipe schema
export const createRecipeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(200, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(2000, 'La descripción es muy larga').optional().nullable(),
  imageUrl: z.string().url('URL de imagen inválida').optional().nullable().or(z.literal('')),
  estimatedTime: z.number().min(1, 'El tiempo debe ser al menos 1 minuto'),
  calories: z.number().min(0).optional().nullable(),
  servings: z.number().min(1, 'Debe ser para al menos 1 comensal').default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  categoryId: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  preparations: z.array(recipePreparationSchema).min(1, 'La receta debe tener al menos una preparación'),
});

export const updateRecipeSchema = createRecipeSchema.partial();

// Types
export type RecipeIngredientInput = z.infer<typeof recipeIngredientSchema>;
export type RecipeStepInput = z.infer<typeof recipeStepSchema>;
export type RecipePreparationInput = z.infer<typeof recipePreparationSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type CreateRecipeCategoryInput = z.infer<typeof createRecipeCategorySchema>;
export type UpdateRecipeCategoryInput = z.infer<typeof updateRecipeCategorySchema>;

// Helper to format timer seconds to readable format
export function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }
  return `${minutes}min ${remainingSeconds}s`;
}

// Helper to parse timer input (e.g., "5min 30s" or "330")
export function parseTimerInput(input: string): number | null {
  // If it's just a number, treat as seconds
  const justNumber = parseInt(input, 10);
  if (!isNaN(justNumber) && input.trim() === String(justNumber)) {
    return justNumber;
  }

  // Parse formats like "5min", "30s", "5min 30s"
  const minMatch = input.match(/(\d+)\s*min/i);
  const secMatch = input.match(/(\d+)\s*s(?:eg)?/i);

  let totalSeconds = 0;
  if (minMatch) totalSeconds += parseInt(minMatch[1], 10) * 60;
  if (secMatch) totalSeconds += parseInt(secMatch[1], 10);

  return totalSeconds > 0 ? totalSeconds : null;
}
