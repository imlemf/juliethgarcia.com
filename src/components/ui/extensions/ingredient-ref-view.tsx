import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { formatIngredientText } from './ingredient-ref';

export function IngredientRefView({ node }: NodeViewProps) {
  const { qty, unit, name, fraction = 1 } = node.attrs;
  const text = formatIngredientText(qty, unit, name, fraction);

  return (
    <NodeViewWrapper
      as="span"
      className="ingredient-ref-chip"
    >
      {text}
    </NodeViewWrapper>
  );
}
