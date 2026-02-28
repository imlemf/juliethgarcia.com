import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateSlug } from '@/lib/validations/blog';

interface BlogCategoryFormProps {
  categoryId?: string;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
}

export function BlogCategoryForm({ categoryId }: BlogCategoryFormProps) {
  const isEditing = !!categoryId;
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/blog-categories/${categoryId}`);
      if (!res.ok) throw new Error('Categoría no encontrada');
      const data = await res.json() as { category: FormData };
      setFormData({
        name: data.category.name,
        slug: data.category.slug,
        description: data.category.description || '',
      });
      setAutoSlug(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsFetching(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSlugChange = (slug: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = isEditing
        ? `/api/blog-categories/${categoryId}`
        : '/api/blog-categories';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al guardar');
      }

      window.location.href = '/admin/blog/categories';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Tecnología"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="tecnologia"
          required
        />
        <p className="text-xs text-muted-foreground">
          URL: /blog/categoria/{formData.slug || 'slug'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Artículos sobre tecnología y desarrollo..."
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear categoría'}
        </Button>
        <a href="/admin/blog/categories">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </a>
      </div>
    </form>
  );
}
