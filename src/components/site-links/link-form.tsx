
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail } from 'lucide-react';
import { SOCIAL_TEMPLATES, type SocialPlatform } from '@/lib/validations/site-links';

const SIMPLE_ICON_PATHS: Record<string, string> = {
  SiInstagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  SiWhatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  SiX: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  SiYoutube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  SiFacebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  SiTiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
};

interface LinkFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    title: string;
    url: string;
    icon: string;
    iconType: 'emoji' | 'lucide' | 'simple-icons';
    linkType: 'social' | 'custom';
    isActive: boolean;
  };
}

export function LinkForm({ mode, initialData }: LinkFormProps) {
  const [activeTab, setActiveTab] = useState<'social' | 'custom'>(
    initialData?.linkType || 'social'
  );
  const [selectedSocial, setSelectedSocial] = useState<SocialPlatform | null>(null);
  const [socialInput, setSocialInput] = useState('');
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
    icon: initialData?.icon || '',
    iconType: (initialData?.iconType || 'emoji') as 'emoji' | 'lucide' | 'simple-icons',
    linkType: (initialData?.linkType || 'custom') as 'social' | 'custom',
    isActive: initialData?.isActive ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialSelect = (platform: SocialPlatform) => {
    const template = SOCIAL_TEMPLATES[platform];
    setSelectedSocial(platform);
    setSocialInput('');
    setFormData({
      ...formData,
      title: template.name,
      url: '',
      icon: template.icon,
      iconType: template.iconType,
      linkType: 'social',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Build URL for social links
      let finalUrl = formData.url;
      if (formData.linkType === 'social' && selectedSocial) {
        if (!socialInput.trim()) {
          setError('Por favor completa el campo requerido');
          setIsLoading(false);
          return;
        }
        const template = SOCIAL_TEMPLATES[selectedSocial];
        finalUrl = template.urlPrefix + socialInput.trim();
      }

      if (!formData.title || !finalUrl || !formData.icon) {
        setError('Por favor completa todos los campos requeridos');
        setIsLoading(false);
        return;
      }

      const url = mode === 'create' ? '/api/site-links' : `/api/site-links/${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, url: finalUrl }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Error al guardar el enlace');
      }

      window.location.href = '/admin/links';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el enlace');
      setIsLoading(false);
    }
  };

  const renderIcon = (iconName: string, iconType: 'emoji' | 'lucide' | 'simple-icons', sizeClass?: string) => {
    if (iconType === 'emoji') {
      return <span className="text-3xl">{iconName}</span>;
    }

    const sizeNum = sizeClass?.includes('6') ? 24 : 32;

    if (iconType === 'simple-icons') {
      const path = SIMPLE_ICON_PATHS[iconName];
      if (path) {
        return (
          <svg width={sizeNum} height={sizeNum} viewBox="0 0 24 24" fill="currentColor">
            <path d={path} />
          </svg>
        );
      }
    }

    if (iconType === 'lucide' && iconName === 'Mail') {
      return <Mail className={sizeClass || "h-8 w-8"} />;
    }

    return <span className="text-3xl">🔗</span>;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'social' | 'custom')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="social">Redes Sociales</TabsTrigger>
          <TabsTrigger value="custom">Personalizado</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(SOCIAL_TEMPLATES) as SocialPlatform[]).map((platform) => {
              const template = SOCIAL_TEMPLATES[platform];

              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handleSocialSelect(platform)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                    selectedSocial === platform
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {renderIcon(template.icon, template.iconType, "h-6 w-6")}
                  <span className="font-medium text-sm">{template.name}</span>
                </button>
              );
            })}
          </div>

          {selectedSocial && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="socialInput">
                  {SOCIAL_TEMPLATES[selectedSocial].name} *
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>{SOCIAL_TEMPLATES[selectedSocial].urlPrefix}</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="socialInput"
                    value={socialInput}
                    onChange={(e) => setSocialInput(e.target.value)}
                    placeholder={SOCIAL_TEMPLATES[selectedSocial].inputPlaceholder}
                    required
                    disabled={isLoading}
                  />
                </InputGroup>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del enlace *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value, linkType: 'custom' })
              }
              placeholder="Mi Enlace Personalizado"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://ejemplo.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícono (emoji) *</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value, iconType: 'emoji' })}
              placeholder="🔗"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Usa un emoji (ej: 🌟, 📧, 🎵)
            </p>
          </div>

          {formData.icon && (
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <span className="text-sm font-medium">Vista previa:</span>
              {renderIcon(formData.icon, formData.iconType)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          disabled={isLoading}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Enlace activo (visible en la página pública)
        </Label>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading || (activeTab === 'social' && (!selectedSocial || !socialInput.trim()))}
          className="flex-1"
        >
          {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear enlace' : 'Guardar cambios'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => (window.location.href = '/admin/links')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
