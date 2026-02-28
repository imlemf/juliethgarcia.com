import { useState, useRef, useEffect } from 'react';
import type { RegisterPageProps } from '../../types';
import { Turnstile } from '@/components/auth/turnstile';
import type { TurnstileRef } from '@/components/auth/turnstile';
import { registerSchema } from '@/lib/validations/auth';
import {
  StyledInput,
  StyledButton,
  StyledLabel,
  StyledError,
  FormIcons,
  type StyledFormColors,
} from './ui/styled-form';

export function RegisterPage({ config }: RegisterPageProps) {
  const turnstileRef = useRef<TurnstileRef>(null);
  const [email, setEmail] = useState('');
  const [purchaseCode, setPurchaseCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const pcode = params.get('pcode');

    if (emailParam) {
      setEmail(emailParam);
    }
    if (pcode) {
      setPurchaseCode(pcode.toUpperCase());
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

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
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
        setTurnstileToken('');
        turnstileRef.current?.reset();
        return;
      }

      window.location.href = '/';
    } catch (err) {
      setError('Ocurrió un error durante el registro');
      setIsLoading(false);
      setTurnstileToken('');
      turnstileRef.current?.reset();
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 pt-24 pb-8"
      style={{
        background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.peach} 50%, ${pastelLavender} 100%)`
      }}
    >
      {/* Decorative elements */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-50 blur-3xl"
        style={{ backgroundColor: colors.mint }}
      />
      <div
        className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: colors.pink }}
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
            boxShadow: `0 25px 50px -12px ${colors.mint}40`
          }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: colors.textDark }}
            >
              Crear cuenta
            </h1>
            <p style={{ color: colors.textMedium }}>
              Regístrate con tu código de compra
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
              <p className="text-xs mt-1" style={{ color: colors.textMedium }}>
                Debe coincidir con el email de tu compra
              </p>
            </div>

            <div>
              <StyledLabel colors={colors}>Código de compra</StyledLabel>
              <StyledInput
                type="text"
                placeholder="ABC123XYZ456"
                value={purchaseCode}
                onChange={(e) => setPurchaseCode(e.target.value.toUpperCase())}
                required
                disabled={isLoading}
                colors={colors}
                icon={FormIcons.code}
              />
              <p className="text-xs mt-1" style={{ color: colors.textMedium }}>
                Lo recibiste en el email de confirmación
              </p>
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
              <p className="text-xs mt-1" style={{ color: colors.textMedium }}>
                Mínimo 8 caracteres
              </p>
            </div>

            <div>
              <StyledLabel colors={colors}>Confirmar contraseña</StyledLabel>
              <StyledInput
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                colors={colors}
                icon={FormIcons.check}
              />
            </div>

            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                onVerify={setTurnstileToken}
                onError={() => setError('Error en verificación anti-bot')}
                onExpire={() => setTurnstileToken('')}
              />
            </div>

            {error && <StyledError message={error} />}

            <StyledButton
              type="submit"
              disabled={isLoading || !turnstileToken}
              isLoading={isLoading}
              loadingText="Creando cuenta..."
              colors={colors}
              variant="secondary"
            >
              Crear cuenta
            </StyledButton>

            <p className="text-center text-sm" style={{ color: colors.textMedium }}>
              ¿Ya tienes cuenta?{' '}
              <a
                href="/login"
                className="font-medium hover:underline"
                style={{ color: colors.textDark }}
              >
                Inicia sesión
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
