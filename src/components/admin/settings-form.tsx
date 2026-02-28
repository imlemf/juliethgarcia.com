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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Save, Check } from 'lucide-react';

interface SettingOption {
  value: string;
  label: string;
}

interface SettingDefinition {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  group: string;
  label: string;
  description: string;
  defaultValue: string | number | boolean;
  options?: SettingOption[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface SettingsGroup {
  key: string;
  label: string;
  description: string;
  definitions: SettingDefinition[];
}

interface ApiResponse {
  groups: SettingsGroup[];
  values: Record<string, string | number | boolean>;
  definitions: SettingDefinition[];
}

export function SettingsForm() {
  const [groups, setGroups] = useState<SettingsGroup[]>([]);
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Error al cargar configuración');
      const data = (await res.json()) as ApiResponse;
      setGroups(data.groups);
      setValues(data.values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || 'Error al guardar');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const updateValue = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (definition: SettingDefinition) => {
    const { key, type, label, description, options, validation } = definition;
    const value = values[key];

    switch (type) {
      case 'boolean':
        return (
          <div key={key} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor={key}>{label}</Label>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
              id={key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => updateValue(key, checked)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Select
              value={String(value)}
              onValueChange={(v) => updateValue(key, v)}
            >
              <SelectTrigger id={key}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        );

      case 'number':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type="number"
              value={String(value)}
              onChange={(e) => updateValue(key, Number(e.target.value))}
              min={validation?.min}
              max={validation?.max}
            />
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        );

      case 'string':
      default:
        // Use textarea for longer text fields
        const isLongText = validation?.maxLength && validation.maxLength > 100;

        if (isLongText) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Textarea
                id={key}
                value={String(value)}
                onChange={(e) => updateValue(key, e.target.value)}
                maxLength={validation?.maxLength}
                rows={3}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{description}</span>
                {validation?.maxLength && (
                  <span>
                    {String(value).length}/{validation.maxLength}
                  </span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type={validation?.pattern === 'email' ? 'email' : 'text'}
              value={String(value)}
              onChange={(e) => updateValue(key, e.target.value)}
              maxLength={validation?.maxLength}
            />
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        );
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600">
          <Check className="h-4 w-4" />
          Configuración guardada correctamente
        </div>
      )}

      <Tabs defaultValue={groups[0]?.key} className="space-y-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${groups.length}, 1fr)` }}>
          {groups.map((group) => (
            <TabsTrigger key={group.key} value={group.key}>
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((group) => (
          <TabsContent key={group.key} value={group.key}>
            <Card>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {group.definitions.map((def) => renderField(def))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar configuración
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
