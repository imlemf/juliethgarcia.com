
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SOCIAL_TEMPLATES, type SocialPlatform } from '@/lib/validations/site-links';
import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';

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
      const IconComponent = (SimpleIcons as any)[iconName] as React.ComponentType<{ size?: number; className?: string }>;
      if (IconComponent) {
        return <IconComponent size={sizeNum} />;
      }
    }

    if (iconType === 'lucide') {
      const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }>;
      if (IconComponent) {
        return <IconComponent className={sizeClass || "h-8 w-8"} />;
      }
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="icon">Ícono (emoji o nombre de Lucide) *</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🔗 o Link"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Usa un emoji (ej: 🌟) o el nombre de un ícono de Lucide (ej: Star)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iconType">Tipo de ícono</Label>
              <Select
                value={formData.iconType}
                onValueChange={(value) =>
                  setFormData({ ...formData, iconType: value as 'emoji' | 'lucide' | 'simple-icons' })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emoji">Emoji</SelectItem>
                  <SelectItem value="lucide">Lucide Icon</SelectItem>
                  <SelectItem value="simple-icons">Marca (Simple Icons)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
