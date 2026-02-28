import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SimpleEditor } from '@/components/ui/simple-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, Trash2, ChevronDown, GripVertical, Clock, Upload, X } from 'lucide-react';
import {
  generateRecipeSlug,
  MEASUREMENT_UNITS,
  DIFFICULTY_LEVELS,
  formatTimer,
  parseTimerInput,
} from '@/lib/validations/recipe';

// Static object to avoid re-creating on every render
const UNIT_LABELS = Object.fromEntries(MEASUREMENT_UNITS.map(u => [u.value, u.label]));

interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  calories?: number | null;
  order: number;
}

interface Step {
  id?: string;
  instruction: string;
  order: number;
  timerSeconds: number | null;
}

interface Preparation {
  id?: string;
  title: string;
  order: number;
  steps: Step[];
  ingredients: Ingredient[];
}

interface Category {
  id: string;
  name: string;
}

interface RecipeFormProps {
  recipeId?: string;
}

export function RecipeForm({ recipeId }: RecipeFormProps) {
  const isEditing = !!recipeId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Basic info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [servings, setServings] = useState(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [categoryId, setCategoryId] = useState<string>('');
  const [isPublished, setIsPublished] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Nested data
  const [preparations, setPreparations] = useState<Preparation[]>([
    { title: 'Preparación', order: 0, steps: [{ instruction: '', order: 0, timerSeconds: null }], ingredients: [] },
  ]);

  // Track which ingredient indices are referenced in step descriptions
  // Key: "prepIndex", Value: Set of ingredient indices
  const [referencedIngredients, setReferencedIngredients] = useState<Record<string, Set<number>>>({});

  // Calories calculated from ingredients
  const calculatedCalories = preparations.reduce((total, prep) => {
    return total + prep.ingredients.reduce((prepTotal, ing) => {
      return prepTotal + (ing.calories || 0);
    }, 0);
  }, 0);
  const caloriesPerServing = servings > 0 ? Math.round(calculatedCalories / servings) : 0;

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchRecipe();
    }
  }, [recipeId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/recipe-categories');
      if (res.ok) {
        const data = await res.json() as { categories: Category[] };
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchRecipe = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (!res.ok) throw new Error('Error al cargar receta');
      const data = await res.json() as { recipe: any };
      const r = data.recipe;

      setName(r.name);
      setSlug(r.slug);
      setDescription(r.description || '');
      setImageUrl(r.imageUrl || '');
      setImagePreview(r.imageUrl || null);
      setEstimatedTime(r.estimatedTime);
      setServings(r.servings);
      setDifficulty(r.difficulty);
      setCategoryId(r.categoryId || '');
      setIsPublished(r.isPublished);
      setIsPremium(r.isPremium || false);

      // Map preparations with ingredients converted from x100
      if (r.preparations && r.preparations.length > 0) {
        setPreparations(
          r.preparations.map((p: any) => ({
            id: p.id,
            title: p.title,
            order: p.order,
            steps: p.steps.map((s: any) => ({
              id: s.id,
              instruction: s.instruction,
              order: s.order,
              timerSeconds: s.timerSeconds,
            })),
            ingredients: (p.ingredients || []).map((i: any) => ({
              id: i.id,
              name: i.name,
              quantity: i.quantity / 100, // Convert back from stored format
              unit: i.unit,
              calories: i.calories,
              order: i.order,
            })),
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsFetching(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing || !slug) {
      setSlug(generateRecipeSlug(value));
    }
  };

  // Preparation handlers
  const addPreparation = () => {
    setPreparations([
      ...preparations,
      {
        title: `Preparación ${preparations.length + 1}`,
        order: preparations.length,
        steps: [{ instruction: '', order: 0, timerSeconds: null }],
        ingredients: [],
      },
    ]);
  };

  const removePreparation = (index: number) => {
    if (preparations.length > 1) {
      setPreparations(preparations.filter((_, i) => i !== index));
    }
  };

  const updatePreparation = (index: number, field: keyof Preparation, value: any) => {
    const updated = [...preparations];
    (updated[index] as any)[field] = value;
    setPreparations(updated);
  };

  // Step handlers
  const addStep = (prepIndex: number) => {
    const updated = [...preparations];
    updated[prepIndex].steps.push({
      instruction: '',
      order: updated[prepIndex].steps.length,
      timerSeconds: null,
    });
    setPreparations(updated);
  };

  const removeStep = (prepIndex: number, stepIndex: number) => {
    const updated = [...preparations];
    if (updated[prepIndex].steps.length > 1) {
      updated[prepIndex].steps = updated[prepIndex].steps.filter((_, i) => i !== stepIndex);
      setPreparations(updated);
    }
  };

  const updateStep = (prepIndex: number, stepIndex: number, field: keyof Step, value: any) => {
    const updated = [...preparations];
    (updated[prepIndex].steps[stepIndex] as any)[field] = value;
    setPreparations(updated);
  };

  // Ingredient handlers
  const addIngredient = (prepIndex: number) => {
    const prep = preparations[prepIndex];
    const hasIncomplete = prep.ingredients.some(
      ing => !ing.name?.trim() || ing.calories === null || ing.calories === undefined
    );
    if (hasIncomplete) {
      setError('Completa todos los ingredientes antes de agregar otro');
      return;
    }
    setError('');
    setPreparations(prev => prev.map((prep, pi) =>
      pi !== prepIndex ? prep : {
        ...prep,
        ingredients: [
          ...prep.ingredients,
          { name: '', quantity: 1, unit: 'unit', calories: null, order: prep.ingredients.length }
        ]
      }
    ));
  };

  const isIngredientReferenced = (prepIndex: number, ingIndex: number): boolean => {
    const key = `${prepIndex}`;
    return referencedIngredients[key]?.has(ingIndex) ?? false;
  };

  const removeIngredient = (prepIndex: number, ingIndex: number) => {
    if (isIngredientReferenced(prepIndex, ingIndex)) {
      if (!confirm('Este ingrediente está referenciado en la descripción de un paso. ¿Eliminarlo de todas formas?')) {
        return;
      }
    }

    setPreparations(prev => prev.map((prep, pi) =>
      pi !== prepIndex ? prep : {
        ...prep,
        ingredients: prep.ingredients.filter((_, i) => i !== ingIndex)
      }
    ));
  };

  const updateIngredient = (
    prepIndex: number,
    ingIndex: number,
    field: keyof Ingredient,
    value: any
  ) => {
    setPreparations(prev => prev.map((prep, pi) =>
      pi !== prepIndex ? prep : {
        ...prep,
        ingredients: prep.ingredients.map((ing, ii) =>
          ii !== ingIndex ? ing : { ...ing, [field]: value }
        )
      }
    ));
  };

  // Image handlers
  const ACCEPTED_IMAGE_TYPES = ['image/webp', 'image/jpeg'];
  const MAX_IMAGE_SIZE = 512 * 1024; // 512KB

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG o WebP');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('La imagen no puede superar 512KB');
      return;
    }

    setError('');
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (isEditing && imageUrl) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress((ev.loaded / ev.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data.imageUrl);
          } else {
            reject(new Error(data.error || 'Error al subir imagen'));
          }
        } catch {
          reject(new Error('Error al procesar respuesta'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Error de red')));
      xhr.open('POST', '/api/recipes/upload-image');
      xhr.send(formData);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setUploadProgress(0);

    // Validate
    if (preparations.length === 0) {
      setError('Debe haber al menos una preparación');
      setIsLoading(false);
      return;
    }

    for (const prep of preparations) {
      if (!prep.title.trim()) {
        setError('Todas las preparaciones deben tener un título');
        setIsLoading(false);
        return;
      }
      if (prep.steps.length === 0) {
        setError('Cada preparación debe tener al menos un paso');
        setIsLoading(false);
        return;
      }
      for (const step of prep.steps) {
        // Check if HTML content is effectively empty (strip tags and check)
        const textContent = step.instruction.replace(/<[^>]*>/g, '').trim();
        if (!textContent) {
          setError('Todos los pasos deben tener una instrucción');
          setIsLoading(false);
          return;
        }
      }
      for (const ing of prep.ingredients) {
        if (!ing.name?.trim()) {
          setError('Todos los ingredientes deben tener un nombre');
          setIsLoading(false);
          return;
        }
        if (ing.calories === null || ing.calories === undefined) {
          setError(`El ingrediente "${ing.name}" debe tener calorías definidas`);
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      // Upload image if selected
      let finalImageUrl = imageUrl;
      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const url = isEditing ? `/api/recipes/${recipeId}` : '/api/recipes';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description: description || null,
          imageUrl: finalImageUrl || null,
          estimatedTime,
          calories: caloriesPerServing || null,
          servings,
          difficulty,
          categoryId: categoryId || null,
          isPublished,
          isPremium,
          preparations: preparations.map((p, pi) => ({
            title: p.title,
            order: pi,
            steps: p.steps.map((s, si) => ({
              instruction: s.instruction,
              order: si,
              timerSeconds: s.timerSeconds,
            })),
            ingredients: p.ingredients.map((ing, ii) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              calories: ing.calories || null,
              order: ii,
            })),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string; details?: any[] };
        throw new Error(data.error || 'Error al guardar');
      }

      window.location.href = '/admin/recipes';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="preparations">Preparaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-4">
              {/* Basic info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Pasta con pollo al pesto"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="pasta-con-pollo-al-pesto"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL: /recipes/{slug || 'pasta-con-pollo-al-pesto'}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Descripción</Label>
                <SimpleEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Una deliciosa receta de pasta..."
                  minHeight="120px"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="image">Imagen</Label>
                {imagePreview ? (
                  <div className="relative w-40 h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full rounded object-cover border"
                    />
                    {selectedImage && (
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/webp,image/jpeg,.webp,.jpg,.jpeg"
                    onChange={handleImageSelect}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG o WebP. Máximo 512KB.
                </p>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Tiempo estimado *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={Math.floor(estimatedTime / 60)}
                      onChange={(e) => {
                        const hours = Math.min(23, parseInt(e.target.value) || 0);
                        setEstimatedTime(hours * 60 + (estimatedTime % 60));
                        e.target.value = String(hours);
                      }}
                      min={0}
                      max={23}
                      className="w-16"
                    />
                    <span className="text-sm text-muted-foreground">h</span>
                    <Input
                      type="number"
                      value={estimatedTime % 60}
                      onChange={(e) => {
                        const mins = Math.min(59, parseInt(e.target.value) || 0);
                        setEstimatedTime(Math.floor(estimatedTime / 60) * 60 + mins);
                        e.target.value = String(mins);
                      }}
                      min={0}
                      max={59}
                      className="w-16"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="servings">Comensales *</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="calories">Calorías (por comensal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={caloriesPerServing || ''}
                    readOnly
                    disabled
                    placeholder="0"
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calculado automáticamente desde los ingredientes
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preparations" className="space-y-6 mt-4">
              {/* Preparations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Preparaciones</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addPreparation}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar preparación
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {preparations.map((prep, prepIndex) => (
                    <Collapsible key={prepIndex} defaultOpen={prepIndex === 0}>
                      <div className="border rounded-lg">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{prep.title || `Preparación ${prepIndex + 1}`}</span>
                              <span className="text-xs text-muted-foreground">
                                ({prep.steps.length} pasos)
                              </span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 space-y-4 border-t">
                            <div className="flex items-end gap-2">
                              <div className="flex-1 space-y-2">
                                <Label>Título de la preparación</Label>
                                <Input
                                  value={prep.title}
                                  onChange={(e) => updatePreparation(prepIndex, 'title', e.target.value)}
                                  placeholder="Para la salsa"
                                />
                              </div>
                              {preparations.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => removePreparation(prepIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {/* Ingredients for this preparation */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label>Ingredientes</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addIngredient(prepIndex)}
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Ingrediente
                                </Button>
                              </div>

                              {prep.ingredients.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">
                                  Esta preparación no tiene ingredientes
                                </p>
                              )}

                              {prep.ingredients.map((ing, ingIndex) => (
                                <div key={`${prepIndex}-${ingIndex}-${ing.id || ingIndex}`} className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    defaultValue={ing.quantity}
                                    onBlur={(e) =>
                                      updateIngredient(prepIndex, ingIndex, 'quantity', parseFloat(e.target.value) || 0)
                                    }
                                    className="w-20"
                                    min={0}
                                    step={0.1}
                                  />
                                  <Select
                                    value={ing.unit}
                                    onValueChange={(v) => updateIngredient(prepIndex, ingIndex, 'unit', v)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {MEASUREMENT_UNITS.map((u) => (
                                        <SelectItem key={u.value} value={u.value}>
                                          {u.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    defaultValue={ing.name}
                                    onBlur={(e) =>
                                      updateIngredient(prepIndex, ingIndex, 'name', e.target.value)
                                    }
                                    placeholder="Nombre del ingrediente *"
                                    className={`flex-1 ${!ing.name?.trim() ? 'border-destructive' : ''}`}
                                    required
                                  />
                                  <Input
                                    type="number"
                                    defaultValue={ing.calories ?? ''}
                                    onBlur={(e) =>
                                      updateIngredient(prepIndex, ingIndex, 'calories', e.target.value ? parseInt(e.target.value) : null)
                                    }
                                    placeholder="kcal *"
                                    className={`w-20 ${ing.calories === null || ing.calories === undefined ? 'border-destructive' : ''}`}
                                    min={0}
                                    required
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive h-8 w-8"
                                    onClick={() => removeIngredient(prepIndex, ingIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            {/* Steps */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label>Pasos</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addStep(prepIndex)}
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Paso
                                </Button>
                              </div>

                              {prep.steps.map((step, stepIndex) => (
                                <div key={stepIndex} className="border rounded p-3 space-y-3 bg-muted/30">
                                  {/* Step header with number and delete */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                                      {stepIndex + 1}
                                    </span>
                                    {prep.steps.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive h-6 w-6"
                                        onClick={() => removeStep(prepIndex, stepIndex)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>

                                  {/* Description editor */}
                                  <div className="space-y-2">
                                    <Label className="text-xs">Descripción del paso</Label>
                                    <SimpleEditor
                                      content={step.instruction}
                                      onChange={(value) => updateStep(prepIndex, stepIndex, 'instruction', value)}
                                      placeholder="Describe el paso..."
                                      minHeight="120px"
                                      ingredients={prep.ingredients}
                                      unitLabels={UNIT_LABELS}
                                      onReferencedIndices={(indices) => {
                                        setReferencedIngredients(prev => {
                                          const key = `${prepIndex}`;
                                          const existing = prev[key] || new Set<number>();
                                          const merged = new Set([...existing, ...indices]);
                                          return { ...prev, [key]: merged };
                                        });
                                      }}
                                    />
                                  </div>

                                  {/* Timer */}
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Timer:</span>
                                    <Input
                                      type="number"
                                      value={Math.floor((step.timerSeconds || 0) / 60)}
                                      onChange={(e) => {
                                        const mins = Math.min(59, parseInt(e.target.value) || 0);
                                        const secs = (step.timerSeconds || 0) % 60;
                                        const total = mins * 60 + secs;
                                        updateStep(prepIndex, stepIndex, 'timerSeconds', total > 0 ? total : null);
                                        e.target.value = String(mins);
                                      }}
                                      min={0}
                                      max={59}
                                      className="w-14"
                                    />
                                    <span className="text-xs text-muted-foreground">min</span>
                                    <Input
                                      type="number"
                                      value={(step.timerSeconds || 0) % 60}
                                      onChange={(e) => {
                                        const mins = Math.floor((step.timerSeconds || 0) / 60);
                                        const secs = Math.min(59, parseInt(e.target.value) || 0);
                                        const total = mins * 60 + secs;
                                        updateStep(prepIndex, stepIndex, 'timerSeconds', total > 0 ? total : null);
                                        e.target.value = String(secs);
                                      }}
                                      min={0}
                                      max={59}
                                      className="w-14"
                                    />
                                    <span className="text-xs text-muted-foreground">seg</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Publicar</Label>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPremium">Premium</Label>
                  <p className="text-xs text-muted-foreground">
                    Solo para suscriptores
                  </p>
                </div>
                <Switch
                  id="isPremium"
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="categoryId">Categoría</Label>
                <Select
                  value={categoryId || '__none__'}
                  onValueChange={(value) => setCategoryId(value === '__none__' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin categoría</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? uploadProgress > 0 && uploadProgress < 100
                  ? 'Subiendo imagen...'
                  : 'Guardando...'
                : isEditing
                ? 'Actualizar'
                : 'Crear receta'}
            </Button>
            <a href="/admin/recipes">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
