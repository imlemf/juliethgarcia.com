import { eq, desc, and, asc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import {
  recipes,
  recipeCategories,
  recipePreparations,
  recipeSteps,
  recipePreparationIngredients,
} from '@/db/schema';
import type {
  RecipePreparationInput,
} from '@/lib/validations/recipe';

// Types for full recipe with nested data
export type RecipeWithDetails = Awaited<ReturnType<typeof getRecipeWithDetails>>;
export type RecipeListItem = Awaited<ReturnType<typeof getAllRecipes>>[number];

// Get all recipes (list view)
export async function getAllRecipes(db: DbClient, onlyPublished = true) {
  const conditions = onlyPublished ? [eq(recipes.isPublished, true)] : [];

  return db
    .select({
      id: recipes.id,
      name: recipes.name,
      slug: recipes.slug,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      estimatedTime: recipes.estimatedTime,
      calories: recipes.calories,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      categoryId: recipes.categoryId,
      categoryName: recipeCategories.name,
      categorySlug: recipeCategories.slug,
      isPublished: recipes.isPublished,
      isPremium: recipes.isPremium,
      publishedAt: recipes.publishedAt,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .leftJoin(recipeCategories, eq(recipes.categoryId, recipeCategories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(recipes.createdAt));
}

// Get recipes by category
export async function getRecipesByCategory(
  db: DbClient,
  categoryId: string,
  onlyPublished = true
) {
  const conditions = [eq(recipes.categoryId, categoryId)];
  if (onlyPublished) {
    conditions.push(eq(recipes.isPublished, true));
  }

  return db
    .select({
      id: recipes.id,
      name: recipes.name,
      slug: recipes.slug,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      estimatedTime: recipes.estimatedTime,
      calories: recipes.calories,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      categoryId: recipes.categoryId,
      categoryName: recipeCategories.name,
      categorySlug: recipeCategories.slug,
      isPublished: recipes.isPublished,
      isPremium: recipes.isPremium,
      publishedAt: recipes.publishedAt,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .leftJoin(recipeCategories, eq(recipes.categoryId, recipeCategories.id))
    .where(and(...conditions))
    .orderBy(desc(recipes.createdAt));
}

// Get recipe by ID (basic info)
export async function getRecipeById(db: DbClient, id: string) {
  const [recipe] = await db
    .select({
      id: recipes.id,
      name: recipes.name,
      slug: recipes.slug,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      estimatedTime: recipes.estimatedTime,
      calories: recipes.calories,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      categoryId: recipes.categoryId,
      categoryName: recipeCategories.name,
      categorySlug: recipeCategories.slug,
      isPublished: recipes.isPublished,
      isPremium: recipes.isPremium,
      publishedAt: recipes.publishedAt,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .leftJoin(recipeCategories, eq(recipes.categoryId, recipeCategories.id))
    .where(eq(recipes.id, id))
    .limit(1);
  return recipe || null;
}

// Get recipe by slug (basic info)
export async function getRecipeBySlug(
  db: DbClient,
  slug: string,
  onlyPublished = true
) {
  const conditions = [eq(recipes.slug, slug)];
  if (onlyPublished) {
    conditions.push(eq(recipes.isPublished, true));
  }

  const [recipe] = await db
    .select({
      id: recipes.id,
      name: recipes.name,
      slug: recipes.slug,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      estimatedTime: recipes.estimatedTime,
      calories: recipes.calories,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      categoryId: recipes.categoryId,
      categoryName: recipeCategories.name,
      categorySlug: recipeCategories.slug,
      isPublished: recipes.isPublished,
      isPremium: recipes.isPremium,
      publishedAt: recipes.publishedAt,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .leftJoin(recipeCategories, eq(recipes.categoryId, recipeCategories.id))
    .where(and(...conditions))
    .limit(1);
  return recipe || null;
}

// Get full recipe with all nested data (preparations, steps, ingredients)
export async function getRecipeWithDetails(
  db: DbClient,
  id: string,
  onlyPublished = false
) {
  // Get recipe base
  const recipe = await getRecipeById(db, id);
  if (!recipe) return null;

  if (onlyPublished && !recipe.isPublished) return null;

  // Get preparations with steps and ingredients
  const preparations = await db
    .select()
    .from(recipePreparations)
    .where(eq(recipePreparations.recipeId, id))
    .orderBy(asc(recipePreparations.order));

  const preparationsWithDetails = await Promise.all(
    preparations.map(async (prep) => {
      const [steps, ingredients] = await Promise.all([
        db
          .select()
          .from(recipeSteps)
          .where(eq(recipeSteps.preparationId, prep.id))
          .orderBy(asc(recipeSteps.order)),
        db
          .select()
          .from(recipePreparationIngredients)
          .where(eq(recipePreparationIngredients.preparationId, prep.id))
          .orderBy(asc(recipePreparationIngredients.order)),
      ]);

      return {
        ...prep,
        steps,
        ingredients,
      };
    })
  );

  return {
    ...recipe,
    preparations: preparationsWithDetails,
  };
}

// Get full recipe by slug
export async function getRecipeWithDetailsBySlug(
  db: DbClient,
  slug: string,
  onlyPublished = true
) {
  const recipe = await getRecipeBySlug(db, slug, onlyPublished);
  if (!recipe) return null;

  return getRecipeWithDetails(db, recipe.id, onlyPublished);
}

// Create recipe with all nested data
export async function createRecipe(
  db: DbClient,
  data: {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    estimatedTime: number;
    calories?: number | null;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    categoryId?: string | null;
    isPublished?: boolean;
    isPremium?: boolean;
    preparations: RecipePreparationInput[];
  }
) {
  const { preparations, ...recipeData } = data;
  const publishedAt = data.isPublished ? new Date() : null;

  // Insert recipe
  const [recipe] = await db
    .insert(recipes)
    .values({
      ...recipeData,
      publishedAt,
    })
    .returning();

  // Insert preparations, steps, and ingredients
  for (let prepIndex = 0; prepIndex < preparations.length; prepIndex++) {
    const prepData = preparations[prepIndex];
    const [preparation] = await db
      .insert(recipePreparations)
      .values({
        recipeId: recipe.id,
        title: prepData.title,
        order: prepData.order ?? prepIndex,
      })
      .returning();

    // Insert steps for this preparation
    for (let stepIndex = 0; stepIndex < prepData.steps.length; stepIndex++) {
      const stepData = prepData.steps[stepIndex];
      await db
        .insert(recipeSteps)
        .values({
          preparationId: preparation.id,
          instruction: stepData.instruction,
          order: stepData.order ?? stepIndex,
          timerSeconds: stepData.timerSeconds,
        });
    }

    // Insert ingredients for this preparation
    const ingredients = prepData.ingredients || [];
    for (let ingIndex = 0; ingIndex < ingredients.length; ingIndex++) {
      const ingData = ingredients[ingIndex];
      await db.insert(recipePreparationIngredients).values({
        preparationId: preparation.id,
        name: ingData.name,
        quantity: Math.round(ingData.quantity * 100), // Store as integer (x100)
        unit: ingData.unit,
        calories: ingData.calories ?? null,
        order: ingData.order ?? ingIndex,
      });
    }
  }

  return getRecipeWithDetails(db, recipe.id);
}

// Update recipe with all nested data
export async function updateRecipe(
  db: DbClient,
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    estimatedTime: number;
    calories: number | null;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    categoryId: string | null;
    isPublished: boolean;
    isPremium: boolean;
    preparations: RecipePreparationInput[];
  }>
) {
  const { preparations, ...recipeData } = data;

  // Get current recipe state for publishedAt logic
  const currentRecipe = await getRecipeById(db, id);
  if (!currentRecipe) return null;

  let publishedAt = currentRecipe.publishedAt;
  if (data.isPublished !== undefined) {
    if (data.isPublished && !currentRecipe.isPublished) {
      publishedAt = new Date();
    }
  }

  // Update recipe base
  const [recipe] = await db
    .update(recipes)
    .set({
      ...recipeData,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id))
    .returning();

  // If preparations are provided, replace all nested data
  if (preparations !== undefined) {
    // Delete existing preparations (cascades to steps and ingredients)
    await db.delete(recipePreparations).where(eq(recipePreparations.recipeId, id));

    // Insert new preparations
    for (let prepIndex = 0; prepIndex < preparations.length; prepIndex++) {
      const prepData = preparations[prepIndex];
      const [preparation] = await db
        .insert(recipePreparations)
        .values({
          recipeId: recipe.id,
          title: prepData.title,
          order: prepData.order ?? prepIndex,
        })
        .returning();

      // Insert steps for this preparation
      for (let stepIndex = 0; stepIndex < prepData.steps.length; stepIndex++) {
        const stepData = prepData.steps[stepIndex];
        await db
          .insert(recipeSteps)
          .values({
            preparationId: preparation.id,
            instruction: stepData.instruction,
            order: stepData.order ?? stepIndex,
            timerSeconds: stepData.timerSeconds,
          });
      }

      // Insert ingredients for this preparation
      const ingredients = prepData.ingredients || [];
      for (let ingIndex = 0; ingIndex < ingredients.length; ingIndex++) {
        const ingData = ingredients[ingIndex];
        await db.insert(recipePreparationIngredients).values({
          preparationId: preparation.id,
          name: ingData.name,
          quantity: Math.round(ingData.quantity * 100),
          unit: ingData.unit,
          calories: ingData.calories ?? null,
          order: ingData.order ?? ingIndex,
        });
      }
    }
  }

  return getRecipeWithDetails(db, recipe.id);
}

// Delete recipe (cascades to all nested data)
export async function deleteRecipe(db: DbClient, id: string) {
  await db.delete(recipes).where(eq(recipes.id, id));
}

// Toggle recipe published status
export async function toggleRecipePublished(db: DbClient, id: string) {
  const recipe = await getRecipeById(db, id);
  if (!recipe) return null;

  const newPublished = !recipe.isPublished;
  const publishedAt = newPublished && !recipe.publishedAt ? new Date() : recipe.publishedAt;

  const [updated] = await db
    .update(recipes)
    .set({
      isPublished: newPublished,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id))
    .returning();

  return updated;
}
