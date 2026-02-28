import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Turnstile } from './turnstile';
import type { TurnstileRef } from './turnstile';
import { registerSchema } from '@/lib/validations/auth';
import { z } from 'zod';

interface RegisterFormProps {
  redirectTo?: string;
}

export function RegisterForm({ redirectTo = '/dashboard' }: RegisterFormProps) {
  const turnstileRef = useRef<TurnstileRef>(null);
  const [email, setEmail] = useState('');
  const [purchaseCode, setPurchaseCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setIsLoading(false);
        // Reset Turnstile on validation error
        setTurnstileToken('');
        turnstileRef.current?.reset();
        return;
      }

      // Validate input with Zod
      const validationResult = registerSchema.safeParse({
        email,
        purchaseCode,
        password,
        turnstileToken,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        setError(firstError.message);
        setIsLoading(false);
        // Reset Turnstile on validation error
        setTurnstileToken('');
        turnstileRef.current?.reset();
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purchaseCode, password, turnstileToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Código de compra o email inválido');
        setIsLoading(false);
        // Reset Turnstile on registration error
        setTurnstileToken('');
        turnstileRef.current?.reset();
        return;
      }

      // Redirect on success
      window.location.href = redirectTo;
    } catch (err) {
      setError('Ocurrió un error durante el registro');
      setIsLoading(false);
      // Reset Turnstile on unexpected error
      setTurnstileToken('');
      turnstileRef.current?.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Debe coincidir con el email de tu compra
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseCode">Código de compra</Label>
        <Input
          id="purchaseCode"
          type="text"
          placeholder="ABC123XYZ456"
          value={purchaseCode}
          onChange={(e) => setPurchaseCode(e.target.value.toUpperCase())}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Lo recibiste en el email de confirmación de compra
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Mínimo 8 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Verificación anti-bot</Label>
        <Turnstile
          ref={turnstileRef}
          onVerify={setTurnstileToken}
          onError={() => setError('Error en verificación anti-bot')}
          onExpire={() => setTurnstileToken('')}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !turnstileToken}>
        {isLoading ? 'Registrando...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
