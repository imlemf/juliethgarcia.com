import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Loader2, BadgeCheck } from 'lucide-react';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id: string;
    name: string | null;
    email: string;
    role: 'user' | 'admin';
    isActive: boolean;
    premiumUntil?: Date | string | null;
  };
}

export function UserForm({ mode, initialData }: UserFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>(initialData?.role || 'user');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Premium state
  const initialPremiumDate = initialData?.premiumUntil
    ? (typeof initialData.premiumUntil === 'string'
        ? new Date(initialData.premiumUntil)
        : initialData.premiumUntil)
    : null;
  const [hasPremium, setHasPremium] = useState(!!initialPremiumDate && initialPremiumDate > new Date());
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(initialPremiumDate);

  // Check if premium is currently active
  const isPremiumActive = premiumUntil && premiumUntil > new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = mode === 'create' ? '/api/admin/users' : `/api/admin/users/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const body: Record<string, unknown> = {
        name,
        email,
        role,
        isActive,
      };

      // Only include password if provided (required for create, optional for edit)
      if (password || mode === 'create') {
        body.password = password;
      }

      // Include premium status (only for edit mode)
      if (mode === 'edit') {
        body.premiumUntil = hasPremium && premiumUntil ? premiumUntil.toISOString() : null;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar usuario');
      }

      // Redirect to users list
      window.location.href = '/admin/users';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del usuario"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Contraseña {mode === 'edit' && <span className="text-muted-foreground">(dejar vacío para mantener)</span>}
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'create' ? 'Mínimo 8 caracteres' : '••••••••'}
          required={mode === 'create'}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select value={role} onValueChange={(v) => setRole(v as 'user' | 'admin')} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Estado</Label>
          <p className="text-sm text-muted-foreground">
            {isActive ? 'Usuario activo' : 'Usuario inactivo'}
          </p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={isLoading}
        />
      </div>

      {/* Premium Subscription Control - Only show in edit mode */}
      {mode === 'edit' && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Suscripción Premium</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hasPremium">Premium activo</Label>
              <p className="text-sm text-muted-foreground">
                {hasPremium
                  ? isPremiumActive
                    ? 'El usuario tiene acceso premium'
                    : 'Premium expirado'
                  : 'Sin acceso premium'}
              </p>
            </div>
            <Switch
              id="hasPremium"
              checked={hasPremium}
              onCheckedChange={(checked) => {
                setHasPremium(checked);
                if (checked && !premiumUntil) {
                  // Default to 3 months from now when enabling
                  const defaultDate = new Date();
                  defaultDate.setMonth(defaultDate.getMonth() + 3);
                  setPremiumUntil(defaultDate);
                }
              }}
              disabled={isLoading}
            />
          </div>

          {hasPremium && (
            <div className="space-y-2">
              <Label>Fecha de expiración</Label>
              <DateTimePicker
                value={premiumUntil}
                onChange={setPremiumUntil}
                placeholder="Seleccionar fecha de expiración"
                disabled={isLoading}
              />
              {premiumUntil && (
                <p className="text-xs text-muted-foreground">
                  {premiumUntil > new Date()
                    ? `Premium activo hasta ${premiumUntil.toLocaleDateString('es-CO', { dateStyle: 'long' })}`
                    : `Premium expiró el ${premiumUntil.toLocaleDateString('es-CO', { dateStyle: 'long' })}`}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(premiumUntil || new Date());
                    newDate.setMonth(newDate.getMonth() + 1);
                    setPremiumUntil(newDate);
                  }}
                  disabled={isLoading}
                >
                  +1 mes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(premiumUntil || new Date());
                    newDate.setMonth(newDate.getMonth() + 3);
                    setPremiumUntil(newDate);
                  }}
                  disabled={isLoading}
                >
                  +3 meses
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(premiumUntil || new Date());
                    newDate.setFullYear(newDate.getFullYear() + 1);
                    setPremiumUntil(newDate);
                  }}
                  disabled={isLoading}
                >
                  +1 año
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear usuario'
          ) : (
            'Guardar cambios'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.location.href = '/admin/users'} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
