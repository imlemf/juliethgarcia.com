import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface TemplateOption {
  key: string;
  type: string;
  label: string;
  description?: string;
  defaultValue: string | number | boolean;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
  };
}

interface TemplateOptionGroup {
  key: string;
  label: string;
  description?: string;
  options: TemplateOption[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  optionGroups: TemplateOptionGroup[];
}

interface Product {
  id: string;
  name: string;
}

interface Blog {
  id: string;
  title: string;
}

interface Recipe {
  id: string;
  name: string;
}

export function TemplateConfigForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [config, setConfig] = useState<Record<string, string | number | boolean>>({});
  const [activeTab, setActiveTab] = useState('');

  // Data for record selectors
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Fetch templates and current config
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch templates
        const templatesRes = await fetch('/api/templates');
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);

        // Fetch current active template setting
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        const activeId = settingsData.values?.['template.active'] || 'jeyla';
        setActiveTemplateId(activeId);

        // Fetch config for active template
        const configRes = await fetch(`/api/templates/${activeId}/config`);
        const configData = await configRes.json();
        setConfig(configData.config || {});

        // Set initial tab
        if (templatesData.templates?.length > 0) {
          const template = templatesData.templates.find((t: Template) => t.id === activeId);
          if (template?.optionGroups?.length > 0) {
            setActiveTab(template.optionGroups[0].key);
          }
        }

        // Fetch data for record selectors
        const [productsRes, blogsRes, recipesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/blogs'),
          fetch('/api/recipes'),
        ]);

        const productsData = await productsRes.json();
        const blogsData = await blogsRes.json();
        const recipesData = await recipesRes.json();

        setProducts(productsData.products || []);
        setBlogs(blogsData.blogs || []);
        setRecipes(recipesData.recipes || []);
      } catch (err) {
        setError('Error cargando configuración');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update config value
  const updateConfig = (key: string, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Save config
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Save template config
      const res = await fetch(`/api/templates/${activeTemplateId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        throw new Error('Error guardando configuración');
      }

      setSuccess('Configuración guardada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error guardando configuración');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Change active template
  const handleTemplateChange = async (newTemplateId: string) => {
    try {
      setIsLoading(true);

      // Update setting
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'template.active': newTemplateId }),
      });

      // Fetch new template config
      const configRes = await fetch(`/api/templates/${newTemplateId}/config`);
      const configData = await configRes.json();

      setActiveTemplateId(newTemplateId);
      setConfig(configData.config || {});

      // Update active tab
      const template = templates.find((t) => t.id === newTemplateId);
      if (template?.optionGroups?.length > 0) {
        setActiveTab(template.optionGroups[0].key);
      }
    } catch (err) {
      setError('Error cambiando plantilla');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current template
  const currentTemplate = templates.find((t) => t.id === activeTemplateId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Plantilla activa</CardTitle>
          <CardDescription>Selecciona el diseño de tu sitio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateChange(template.id)}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  activeTemplateId === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {activeTemplateId === template.id && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Configuration */}
      {currentTemplate && currentTemplate.optionGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de {currentTemplate.name}</CardTitle>
            <CardDescription>Personaliza la apariencia y comportamiento</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                {currentTemplate.optionGroups.map((group) => (
                  <TabsTrigger key={group.key} value={group.key}>
                    {group.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {currentTemplate.optionGroups.map((group) => (
                <TabsContent key={group.key} value={group.key} className="space-y-4">
                  {group.description && (
                    <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
                  )}

                  {group.options.map((option) => (
                    <OptionField
                      key={option.key}
                      option={option}
                      value={config[option.key]}
                      onChange={(value) => updateConfig(option.key, value)}
                      products={products}
                      blogs={blogs}
                      recipes={recipes}
                    />
                  ))}
                </TabsContent>
              ))}
            </Tabs>

            {/* Messages */}
            {error && (
              <div className="flex items-center gap-2 text-destructive mt-4">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-600 mt-4">
                <Check className="h-4 w-4" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Option Field Component
interface OptionFieldProps {
  option: TemplateOption;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
  products: Product[];
  blogs: Blog[];
  recipes: Recipe[];
}

function OptionField({ option, value, onChange, products, blogs, recipes }: OptionFieldProps) {
  const id = `option-${option.key}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{option.label}</Label>
      {option.description && (
        <p className="text-sm text-muted-foreground">{option.description}</p>
      )}

      {option.type === 'string' && (
        <Input
          id={id}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={option.validation?.maxLength}
        />
      )}

      {option.type === 'number' && (
        <Input
          id={id}
          type="number"
          value={(value as number) || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={option.validation?.min}
          max={option.validation?.max}
        />
      )}

      {option.type === 'boolean' && (
        <Switch
          id={id}
          checked={(value as boolean) || false}
          onCheckedChange={onChange}
        />
      )}

      {option.type === 'color' && (
        <Input
          id={id}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0 0% 9%"
        />
      )}

      {option.type === 'select' && option.options && (
        <Select value={(value as string) || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            {option.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {option.type === 'record:products' && (
        <Select value={(value as string) || '__none__'} onValueChange={(v) => onChange(v === '__none__' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un producto..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Ninguno</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {option.type === 'record:blogs' && (
        <Select value={(value as string) || '__none__'} onValueChange={(v) => onChange(v === '__none__' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un blog..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Ninguno</SelectItem>
            {blogs.map((blog) => (
              <SelectItem key={blog.id} value={blog.id}>
                {blog.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {option.type === 'record:recipes' && (
        <Select value={(value as string) || '__none__'} onValueChange={(v) => onChange(v === '__none__' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una receta..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Ninguna</SelectItem>
            {recipes.map((recipe) => (
              <SelectItem key={recipe.id} value={recipe.id}>
                {recipe.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
