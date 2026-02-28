import type { Ingredient } from './types';

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

export const DIFFICULTY_LABELS = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
} as const;

/**
 * Format time in minutes to human readable string
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Format seconds to MM:SS
 */
export function formatTimerSeconds(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}

/**
 * Format quantity adjusted for servings
 */
export function formatQuantity(quantity: number, targetServings: number, baseServings: number): string {
  // quantity is stored as x100
  const baseQty = quantity / 100;
  const adjusted = (baseQty * targetServings) / baseServings;

  if (adjusted === Math.floor(adjusted)) {
    return String(adjusted);
  }
  return adjusted.toFixed(1).replace(/\.0$/, '');
}

/**
 * Get unit label from unit value
 */
export function getUnitLabel(unit: string): string {
  const found = MEASUREMENT_UNITS.find((u) => u.value === unit);
  return found ? found.label : unit;
}

/**
 * Format ingredient reference text
 */
export function formatIngredientRefText(qty: number, unit: string, name: string): string {
  const fmtQty = qty === Math.floor(qty) ? String(qty) : qty.toFixed(1).replace(/\.0$/, '');
  const isPlural = qty > 1;

  if (unit === 'unit') {
    return `${fmtQty} ${name}`;
  }

  let unitLabel = getUnitLabel(unit);
  if (!isPlural) {
    unitLabel = unitLabel.replace(/\(s\)$/, '').replace(/\(es\)$/, '').replace(/s$/, '');
  } else {
    unitLabel = unitLabel.replace(/\(s\)$/, 's').replace(/\(es\)$/, 'es');
  }

  return `${fmtQty} ${unitLabel} de ${name}`;
}

/**
 * Process instruction HTML to replace ingredient references with adjusted quantities
 */
export function processInstructionHTML(
  html: string,
  prepIngredients: Ingredient[],
  targetServings: number,
  baseServings: number
): string {
  return html.replace(
    /<span([^>]*data-ingredient-ref[^>]*)>[^<]*<\/span>/g,
    (_match, attrs) => {
      const indexMatch = attrs.match(/data-ingredient-ref="(\d+)"/);
      const qtyMatch = attrs.match(/data-qty="([^"]*)"/);
      const unitMatch = attrs.match(/data-unit="([^"]*)"/);
      const nameMatch = attrs.match(/data-name="([^"]*)"/);
      const fractionMatch = attrs.match(/data-fraction="([^"]*)"/);

      if (!indexMatch) return _match;

      const idx = parseInt(indexMatch[1], 10);
      const baseQty = qtyMatch ? parseFloat(qtyMatch[1]) : 0;
      const unit = unitMatch ? unitMatch[1] : 'unit';
      const name = nameMatch ? nameMatch[1] : '';
      const fraction = fractionMatch ? parseFloat(fractionMatch[1]) : 1;

      const ing = prepIngredients[idx];
      const actualQty = ing ? ing.quantity / 100 : baseQty;
      const actualUnit = ing ? ing.unit : unit;
      const actualName = ing ? ing.name : name;

      const adjusted = (actualQty * fraction * targetServings) / baseServings;
      const text = formatIngredientRefText(adjusted, actualUnit, actualName);

      return `<span class="ingredient-ref">${text}</span>`;
    }
  );
}
