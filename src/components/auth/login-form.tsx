import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Turnstile } from './turnstile';
import type { TurnstileRef } from './turnstile';
import { loginSchema } from '@/lib/validations/auth';
import { z } from 'zod';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const turnstileRef = useRef<TurnstileRef>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate input with Zod
      const validationResult = loginSchema.safeParse({
        email,
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

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Email o contraseña inválidos');
        setIsLoading(false);
        // Reset Turnstile on authentication error
        setTurnstileToken('');
        turnstileRef.current?.reset();
        return;
      }

      // Redirect on success
      window.location.href = redirectTo;
    } catch (err) {
      setError('Ocurrió un error durante el inicio de sesión');
      setIsLoading(false);
      // Reset Turnstile on unexpected error
      setTurnstileToken('');
      turnstileRef.current?.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
