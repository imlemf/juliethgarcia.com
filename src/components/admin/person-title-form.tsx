import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePersonSlug } from '@/lib/validations/person';

interface PersonTitleFormProps {
  titleId?: string;
}

export function PersonTitleForm({ titleId }: PersonTitleFormProps) {
  const isEditing = !!titleId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isEditing) {
      fetchTitle();
    }
  }, [titleId]);

  const fetchTitle = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/admin/person-titles/${titleId}`);
      if (!res.ok) throw new Error('Error al cargar título');
      const data = await res.json() as { title: any };
      const t = data.title;
      setName(t.name);
      setSlug(t.slug);
      setOrder(t.order);
      setIsActive(t.isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsFetching(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing || !slug) {
      setSlug(generatePersonSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = isEditing
        ? `/api/admin/person-titles/${titleId}`
        : '/api/admin/person-titles';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          order,
          isActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string; details?: any[] };
        throw new Error(data.error || 'Error al guardar');
      }

      window.location.href = '/admin/people/titles';
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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Chef Ejecutivo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="chef-ejecutivo"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Activo</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
            <a href="/admin/people/titles">
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
