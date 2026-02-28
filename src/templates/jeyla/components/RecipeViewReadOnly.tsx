/**
 * Read-only version of RecipeView for non-authenticated users.
 * Shows all recipe content (ingredients, preparations, steps) but:
 * - Does NOT load timer code
 * - Does NOT load progress tracking code
 * - "Iniciar" button triggers premium dialog instead of starting preparation
 */

import { formatQuantity, getUnitLabel, type Recipe } from '@/lib/recipes';

interface RecipeColors {
  pink: string;
  peach: string;
  mint: string;
  lavender: string;
  greenMint: string;
  textDark: string;
  textMedium: string;
}

interface RecipeViewReadOnlyProps {
  recipe: Recipe;
  colors?: RecipeColors;
  servings: number;
  onPremiumFeature: () => void;
}

const defaultColors: RecipeColors = {
  pink: '#FFD6E8',
  peach: '#FFDAB9',
  mint: '#C7EAE4',
  lavender: '#E6E6FA',
  greenMint: '#B8E6B8',
  textDark: '#5A4A42',
  textMedium: '#8B7D77',
};

// Collect all ingredients from all preparations
function getAllIngredients(recipe: Recipe) {
  const seen = new Set<string>();
  const ingredients: Array<{ id: string; name: string; quantity: number; unit: string }> = [];

  for (const prep of recipe.preparations) {
    for (const ing of prep.ingredients) {
      const key = `${ing.name}-${ing.unit}`;
      if (!seen.has(key)) {
        seen.add(key);
        ingredients.push(ing);
      }
    }
  }

  return ingredients;
}

export function RecipeViewReadOnly({
  recipe,
  colors = defaultColors,
  servings,
  onPremiumFeature,
}: RecipeViewReadOnlyProps) {
  const c = { ...defaultColors, ...colors };
  const allIngredients = getAllIngredients(recipe);

  return (
    <div className="space-y-8">
      {/* All Ingredients */}
      {allIngredients.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: `0 4px 20px ${c.mint}20`,
          }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: c.textDark }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.mint }}>
              <svg className="w-5 h-5" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Ingredientes
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {allIngredients.map((ing, index) => (
              <li
                key={`${ing.id}-${index}`}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: `${c.lavender}30` }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.greenMint }} />
                <span className="font-semibold" style={{ color: c.textDark }}>
                  {formatQuantity(ing.quantity, servings, recipe.servings)}
                </span>
                <span style={{ color: c.textMedium }}>{getUnitLabel(ing.unit)}</span>
                <span style={{ color: c.textDark }}>{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preparations */}
      {recipe.preparations.map((prep) => (
        <div
          key={prep.id}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: `0 4px 20px ${c.pink}20`,
          }}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: c.peach }}
              >
                <svg className="w-6 h-6" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: c.textDark }}>
                  {prep.title}
                </h3>
              </div>
            </div>

            {prep.steps.length > 0 && (
              <button
                type="button"
                onClick={onPremiumFeature}
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                style={{ backgroundColor: c.greenMint, color: c.textDark }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Iniciar
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 pt-0 space-y-6">
            {/* Prep ingredients */}
            {prep.ingredients.length > 0 && (
              <div className="rounded-xl p-4" style={{ backgroundColor: `${c.lavender}30` }}>
                <h4 className="font-semibold mb-3" style={{ color: c.textDark }}>
                  Ingredientes para esta preparación:
                </h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {prep.ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.greenMint }}
                      />
                      <span className="font-medium" style={{ color: c.textDark }}>
                        {formatQuantity(ing.quantity, servings, recipe.servings)}
                      </span>
                      <span style={{ color: c.textMedium }}>{getUnitLabel(ing.unit)}</span>
                      <span style={{ color: c.textDark }}>{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* All steps */}
            <ol className="space-y-4">
              {prep.steps.map((step, stepIndex) => (
                <li key={step.id} className="flex gap-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: c.peach, color: c.textDark }}
                  >
                    {stepIndex + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div
                      className="prose prose-sm max-w-none"
                      style={{ color: c.textDark }}
                      dangerouslySetInnerHTML={{ __html: step.instruction }}
                    />
                    {step.timerSeconds && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: c.textMedium }}>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12,6 12,12 16,14" />
                        </svg>
                        <span>
                          {Math.floor(step.timerSeconds / 60) > 0 && `${Math.floor(step.timerSeconds / 60)} min `}
                          {step.timerSeconds % 60 > 0 && `${step.timerSeconds % 60} seg`}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
}
