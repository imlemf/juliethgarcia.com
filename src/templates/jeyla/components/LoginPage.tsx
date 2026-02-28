import { useState, useRef, useEffect } from 'react';
import type { LoginPageProps } from '../../types';
import { Turnstile } from '@/components/auth/turnstile';
import type { TurnstileRef } from '@/components/auth/turnstile';
import { loginSchema } from '@/lib/validations/auth';
import {
  StyledInput,
  StyledButton,
  StyledLabel,
  StyledError,
  FormIcons,
  type StyledFormColors,
} from './ui/styled-form';

export function LoginPage({ config }: LoginPageProps) {
  const turnstileRef = useRef<TurnstileRef>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');

    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  // Pastel colors from config
  const colors: StyledFormColors = {
    pink: (config.pastelPink as string) || '#FFD6E8',
    peach: (config.pastelPeach as string) || '#FFDAB9',
    mint: (config.pastelMint as string) || '#C7EAE4',
    greenMint: (config.pastelGreenMint as string) || '#B8E6B8',
    textDark: (config.pastelTextDark as string) || '#5A4A42',
    textMedium: (config.pastelTextMedium as string) || '#8B7D77',
  };

  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const validationResult = loginSchema.safeParse({
        email,
        password,
        turnstileToken,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        setError(firstError.message);
        setIsLoading(false);
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
        setTurnstileToken('');
        turnstileRef.current?.reset();
        return;
      }

      window.location.href = '/';
    } catch (err) {
      setError('Ocurrió un error durante el inicio de sesión');
      setIsLoading(false);
      setTurnstileToken('');
      turnstileRef.current?.reset();
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 pt-24 pb-8"
      style={{
        background: `linear-gradient(135deg, ${colors.pink} 0%, ${colors.peach} 50%, ${pastelLavender} 100%)`
      }}
    >
      {/* Decorative elements */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-50 blur-3xl"
        style={{ backgroundColor: colors.pink }}
      />
      <div
        className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: colors.mint }}
      />
      <div
        className="absolute -bottom-32 left-1/4 w-72 h-72 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: pastelLavender }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-[2rem] p-8 backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: `0 25px 50px -12px ${colors.pink}40`
          }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: colors.textDark }}
            >
              Bienvenido de vuelta
            </h1>
            <p style={{ color: colors.textMedium }}>
              Inicia sesión para acceder a tus productos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <StyledLabel colors={colors}>Email</StyledLabel>
              <StyledInput
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                colors={colors}
                icon={FormIcons.email}
              />
            </div>

            <div>
              <StyledLabel colors={colors}>Contraseña</StyledLabel>
              <StyledInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                colors={colors}
                icon={FormIcons.password}
              />
            </div>

            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                onVerify={setTurnstileToken}
                onError={() => setError('Error en verificación anti-bot')}
                onExpire={() => setTurnstileToken('')}
                theme="light"
              />
            </div>

            {error && <StyledError message={error} />}

            <StyledButton
              type="submit"
              disabled={isLoading || !turnstileToken}
              isLoading={isLoading}
              loadingText="Iniciando sesión..."
              colors={colors}
            >
              Iniciar sesión
            </StyledButton>

            <p className="text-center text-sm" style={{ color: colors.textMedium }}>
              ¿No tienes cuenta?{' '}
              <a
                href="/register"
                className="font-medium hover:underline"
                style={{ color: colors.textDark }}
              >
                Regístrate
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
