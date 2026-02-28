import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { IngredientRefView } from './ingredient-ref-view';

export interface IngredientRefOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const FRACTION_OPTIONS = [
  { value: 1, label: 'Completo' },
  { value: 0.75, label: '3/4' },
  { value: 0.5, label: '1/2' },
  { value: 0.33, label: '1/3' },
] as const;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ingredientRef: {
      insertIngredientRef: (options: {
        index: number;
        qty: number;
        unit: string;
        name: string;
        fraction?: number;
      }) => ReturnType;
    };
  }
}

function formatIngredientText(qty: number, unit: string, name: string, fraction: number = 1, unitLabels?: Record<string, string>): string {
  const actualQty = qty * fraction;
  const fmtQty = actualQty === Math.floor(actualQty) ? String(actualQty) : actualQty.toFixed(2).replace(/\.?0+$/, '');
  const isPlural = actualQty > 1;

  if (unit === 'unit') {
    return `${fmtQty} ${name}`;
  }

  let unitLabel = unitLabels?.[unit] ?? unit;

  if (!isPlural) {
    unitLabel = unitLabel
      .replace(/\(s\)$/, '')
      .replace(/\(es\)$/, '')
      .replace(/s$/, '');
  } else {
    unitLabel = unitLabel
      .replace(/\(s\)$/, 's')
      .replace(/\(es\)$/, 'es');
  }

  return `${fmtQty} ${unitLabel} de ${name}`;
}

export { formatIngredientText };

export const IngredientRef = Node.create<IngredientRefOptions>({
  name: 'ingredientRef',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      index: {
        default: 0,
      },
      qty: {
        default: 0,
      },
      unit: {
        default: 'unit',
      },
      name: {
        default: '',
      },
      fraction: {
        default: 1,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-ingredient-ref]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLElement;
          return {
            index: parseInt(el.getAttribute('data-ingredient-ref') || '0', 10),
            qty: parseFloat(el.getAttribute('data-qty') || '0'),
            unit: el.getAttribute('data-unit') || 'unit',
            name: el.getAttribute('data-name') || '',
            fraction: parseFloat(el.getAttribute('data-fraction') || '1'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { index, qty, unit, name, fraction } = HTMLAttributes;
    const text = formatIngredientText(qty, unit, name, fraction);

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-ingredient-ref': String(index),
        'data-qty': String(qty),
        'data-unit': unit,
        'data-name': name,
        'data-fraction': String(fraction),
        class: 'ingredient-ref',
      }),
      text,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IngredientRefView);
  },

  addCommands() {
    return {
      insertIngredientRef:
        (options) =>
        ({ commands }) => {
          return commands.insertContent([
            {
              type: this.name,
              attrs: options,
            },
            {
              type: 'text',
              text: ' ',
            },
          ]);
        },
    };
  },
});
