import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { IngredientRef, FRACTION_OPTIONS } from './extensions/ingredient-ref';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  Carrot,
} from 'lucide-react';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  ingredients?: Ingredient[];
  unitLabels?: Record<string, string>;
  onReferencedIndices?: (indices: Set<number>) => void;
}

export const SimpleEditor = memo(function SimpleEditor({
  content,
  onChange,
  placeholder = 'Escribe aquí...',
  minHeight = '100px',
  ingredients,
  unitLabels,
  onReferencedIndices,
}: SimpleEditorProps) {
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<{ ing: Ingredient; index: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      IngredientRef,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(editor.getHTML());
        reportReferencedIndices(editor);
      }, 300);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none p-3 focus:outline-none`,
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Report which ingredient indices are referenced in the editor
  const reportReferencedIndices = useCallback((ed: any) => {
    if (!onReferencedIndices || !ed) return;
    const indices = new Set<number>();
    ed.state.doc.descendants((node: any) => {
      if (node.type.name === 'ingredientRef') {
        indices.add(node.attrs.index);
      }
    });
    onReferencedIndices(indices);
  }, [onReferencedIndices]);

  // Report on mount
  useEffect(() => {
    if (editor) {
      reportReferencedIndices(editor);
    }
  }, [editor, reportReferencedIndices]);

  // Sync ingredient data changes to existing nodes in the editor
  useEffect(() => {
    if (!editor || !ingredients) return;

    const { state } = editor;
    const { tr } = state;
    let modified = false;

    state.doc.descendants((node, pos) => {
      if (node.type.name === 'ingredientRef') {
        const idx = node.attrs.index;
        const ing = ingredients[idx];
        if (ing && (
          node.attrs.qty !== ing.quantity ||
          node.attrs.unit !== ing.unit ||
          node.attrs.name !== ing.name
        )) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            qty: ing.quantity,
            unit: ing.unit,
            name: ing.name,
          });
          modified = true;
        }
      }
    });

    if (modified) {
      editor.view.dispatch(tr);
    }
  }, [editor, ingredients]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  const formatQuantity = (qty: number): string => {
    if (qty === Math.floor(qty)) return String(qty);
    return qty.toFixed(1).replace(/\.0$/, '');
  };

  const getUnitLabel = (unit: string): string => {
    if (unitLabels && unitLabels[unit]) return unitLabels[unit];
    return unit;
  };

  const selectIngredient = (ing: Ingredient, index: number) => {
    setSelectedIngredient({ ing, index });
  };

  const insertIngredientWithFraction = (fraction: number) => {
    if (!selectedIngredient) return;
    const { ing, index } = selectedIngredient;
    editor
      .chain()
      .focus()
      .insertIngredientRef({
        index,
        qty: ing.quantity,
        unit: ing.unit,
        name: ing.name,
        fraction,
      })
      .run();
    setSelectedIngredient(null);
    setIngredientPopoverOpen(false);
  };

  const goBackToIngredients = () => {
    setSelectedIngredient(null);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-1.5 border-b bg-muted/50">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>

        <div className="w-px h-7 bg-border mx-0.5" />

        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        {/* Ingredients popover */}
        {ingredients && ingredients.length > 0 && (
          <>
            <div className="w-px h-7 bg-border mx-0.5" />
            <Popover open={ingredientPopoverOpen} onOpenChange={(open) => {
              setIngredientPopoverOpen(open);
              if (!open) setSelectedIngredient(null);
            }}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Insertar ingrediente"
                >
                  <Carrot className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                {!selectedIngredient ? (
                  <>
                    <div className="p-2 border-b">
                      <p className="text-xs font-medium text-muted-foreground">Seleccionar ingrediente</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                      {ingredients.map((ing, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors"
                          onClick={() => selectIngredient(ing, index)}
                        >
                          <span className="font-medium">{formatQuantity(ing.quantity)}</span>{' '}
                          <span className="text-muted-foreground">{getUnitLabel(ing.unit)}</span>{' '}
                          {ing.name}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 border-b flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={goBackToIngredients}
                      >
                        ← Volver
                      </button>
                      <p className="text-xs font-medium truncate">{selectedIngredient.ing.name}</p>
                    </div>
                    <div className="p-1">
                      <p className="px-2 py-1 text-xs text-muted-foreground">¿Cuánto agregar?</p>
                      {FRACTION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors flex justify-between"
                          onClick={() => insertIngredientWithFraction(opt.value)}
                        >
                          <span>{opt.label}</span>
                          <span className="text-muted-foreground">
                            {formatQuantity(selectedIngredient.ing.quantity * opt.value)} {getUnitLabel(selectedIngredient.ing.unit)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </>
        )}

        <div className="w-px h-7 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.minHeight === nextProps.minHeight &&
    JSON.stringify(prevProps.ingredients) === JSON.stringify(nextProps.ingredients)
  );
});
