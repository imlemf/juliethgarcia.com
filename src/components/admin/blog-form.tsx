import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TiptapEditor } from '@/components/blog/tiptap-editor';
import { generateSlug } from '@/lib/validations/blog';

interface BlogFormProps {
  blogId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  isPublished: boolean;
  isPremium: boolean;
}

export function BlogForm({ blogId }: BlogFormProps) {
  const isEditing = !!blogId;
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    categoryId: '',
    isPublished: false,
    isPremium: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    fetchCategories();
    if (blogId) {
      fetchBlog();
    } else {
      setIsFetching(false);
    }
  }, [blogId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog-categories?onlyActive=true');
      const data = await res.json() as { categories: Category[] };
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogId}`);
      if (!res.ok) throw new Error('Blog no encontrado');
      const data = await res.json() as { blog: FormData & { categoryId: string | null } };
      setFormData({
        title: data.blog.title,
        slug: data.blog.slug,
        excerpt: data.blog.excerpt || '',
        content: data.blog.content,
        coverImage: data.blog.coverImage || '',
        categoryId: data.blog.categoryId || '',
        isPublished: data.blog.isPublished,
        isPremium: data.blog.isPremium || false,
      });
      setAutoSlug(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsFetching(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
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
      const url = isEditing ? `/api/blogs/${blogId}` : '/api/blogs';
      const method = isEditing ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        categoryId: formData.categoryId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al guardar');
      }

      window.location.href = '/admin/blog/posts';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Mi primer blog post"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="mi-primer-blog-post"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL: /blog/{formData.slug || 'slug'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumen (opcional)</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Breve descripción del artículo..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Contenido</Label>
            <TiptapEditor
              content={formData.content}
              onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium">Publicación</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublished">Publicar</Label>
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublished: checked }))
                }
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
                checked={formData.isPremium}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPremium: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <Select
                value={formData.categoryId || '__none__'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value === '__none__' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
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
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium">Imagen de portada</h3>

            <div className="space-y-2">
              <Input
                id="coverImage"
                type="url"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                }
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                URL de la imagen de portada
              </p>
            </div>

            {formData.coverImage && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
            <a href="/admin/blog/posts">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
