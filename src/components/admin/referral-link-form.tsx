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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface ReferralLinkFormProps {
  linkId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  slug: string;
  description: string;
  destinationUrl: string;
  image: string;
  categoryId: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  isActive: boolean;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function buildPreviewUrl(baseUrl: string, utm: Partial<FormData>): string {
  try {
    const url = new URL(baseUrl);
    if (utm.utmSource) url.searchParams.set('utm_source', utm.utmSource);
    if (utm.utmMedium) url.searchParams.set('utm_medium', utm.utmMedium);
    if (utm.utmCampaign) url.searchParams.set('utm_campaign', utm.utmCampaign);
    if (utm.utmTerm) url.searchParams.set('utm_term', utm.utmTerm);
    if (utm.utmContent) url.searchParams.set('utm_content', utm.utmContent);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function ReferralLinkForm({ linkId }: ReferralLinkFormProps) {
  const isEditing = !!linkId;
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    destinationUrl: '',
    image: '',
    categoryId: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    isActive: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [utmOpen, setUtmOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (linkId) {
      fetchLink();
    } else {
      setIsFetching(false);
    }
  }, [linkId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/referral-categories?onlyActive=true');
      const data = await res.json() as { categories: Category[] };
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchLink = async () => {
    try {
      const res = await fetch(`/api/referral-links/${linkId}`);
      if (!res.ok) throw new Error('Link no encontrado');
      const data = await res.json() as { link: FormData & { categoryId: string | null } };
      setFormData({
        title: data.link.title,
        slug: data.link.slug,
        description: data.link.description || '',
        destinationUrl: data.link.destinationUrl,
        image: data.link.image || '',
        categoryId: data.link.categoryId || '',
        utmSource: data.link.utmSource || '',
        utmMedium: data.link.utmMedium || '',
        utmCampaign: data.link.utmCampaign || '',
        utmTerm: data.link.utmTerm || '',
        utmContent: data.link.utmContent || '',
        isActive: data.link.isActive,
      });
      setAutoSlug(false);
      // Open UTM section if any UTM param is set
      if (data.link.utmSource || data.link.utmMedium || data.link.utmCampaign) {
        setUtmOpen(true);
      }
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
      const url = isEditing ? `/api/referral-links/${linkId}` : '/api/referral-links';
      const method = isEditing ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        categoryId: formData.categoryId || null,
        image: formData.image || null,
        utmSource: formData.utmSource || null,
        utmMedium: formData.utmMedium || null,
        utmCampaign: formData.utmCampaign || null,
        utmTerm: formData.utmTerm || null,
        utmContent: formData.utmContent || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string; details?: Array<{ path: string[]; message: string }> };
        let errorMessage = data.error || 'Error al guardar';
        if (data.details && data.details.length > 0) {
          const fieldErrors = data.details.map((d) => `${d.path.join('.')}: ${d.message}`).join(', ');
          errorMessage = `${errorMessage} (${fieldErrors})`;
        }
        throw new Error(errorMessage);
      }

      window.location.href = '/admin/referrals/links';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;
  }

  const previewUrl = formData.destinationUrl ? buildPreviewUrl(formData.destinationUrl, formData) : '';

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
              placeholder="Hosting en Amazon AWS"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="hosting-aws"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL: /r/{formData.slug || 'slug'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationUrl">URL de destino</Label>
            <Input
              id="destinationUrl"
              type="url"
              value={formData.destinationUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, destinationUrl: e.target.value }))}
              placeholder="https://aws.amazon.com/..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Link de afiliado para AWS..."
              rows={3}
            />
          </div>

          {/* UTM Parameters */}
          <Collapsible open={utmOpen} onOpenChange={setUtmOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full justify-between">
                Parámetros UTM
                <ChevronDown className={`h-4 w-4 transition-transform ${utmOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="utmSource">utm_source</Label>
                  <Input
                    id="utmSource"
                    value={formData.utmSource}
                    onChange={(e) => setFormData((prev) => ({ ...prev, utmSource: e.target.value }))}
                    placeholder="miwebsite"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utmMedium">utm_medium</Label>
                  <Input
                    id="utmMedium"
                    value={formData.utmMedium}
                    onChange={(e) => setFormData((prev) => ({ ...prev, utmMedium: e.target.value }))}
                    placeholder="referral"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utmCampaign">utm_campaign</Label>
                  <Input
                    id="utmCampaign"
                    value={formData.utmCampaign}
                    onChange={(e) => setFormData((prev) => ({ ...prev, utmCampaign: e.target.value }))}
                    placeholder="afiliados-2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utmTerm">utm_term (opcional)</Label>
                  <Input
                    id="utmTerm"
                    value={formData.utmTerm}
                    onChange={(e) => setFormData((prev) => ({ ...prev, utmTerm: e.target.value }))}
                    placeholder="hosting"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="utmContent">utm_content (opcional)</Label>
                  <Input
                    id="utmContent"
                    value={formData.utmContent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, utmContent: e.target.value }))}
                    placeholder="banner-header"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Preview URL */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>URL final (preview)</Label>
              <div className="rounded-md bg-muted p-3 text-xs break-all font-mono">
                {previewUrl}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium">Configuración</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Activo</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
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
            <h3 className="font-medium">Imagen (opcional)</h3>

            <div className="space-y-2">
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                URL de la imagen de preview
              </p>
            </div>

            {formData.image && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={formData.image}
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
            <a href="/admin/referrals/links">
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
