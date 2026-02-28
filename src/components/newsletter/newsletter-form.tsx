import { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Turnstile } from '@/components/auth/turnstile';
import type { TurnstileRef } from '@/components/auth/turnstile';
import {
  StyledInput,
  StyledButton,
  StyledError,
  StyledSuccess,
  FormIcons,
  type StyledFormColors,
} from '@/templates/jeyla/components/ui/styled-form';
import CO from 'country-flag-icons/react/3x2/CO';
import US from 'country-flag-icons/react/3x2/US';
import MX from 'country-flag-icons/react/3x2/MX';

interface NewsletterFormProps {
  className?: string;
  colors?: StyledFormColors;
}

const countryCodes = [
  { code: 'CO', name: 'Colombia', prefix: '+57', Flag: CO },
  { code: 'US', name: 'Estados Unidos', prefix: '+1', Flag: US },
  { code: 'MX', name: 'México', prefix: '+52', Flag: MX },
] as const;

type CountryCode = 'CO' | 'US' | 'MX';

// Default pastel colors
const defaultColors: StyledFormColors = {
  pink: '#FFD6E8',
  peach: '#FFDAB9',
  mint: '#C7EAE4',
  textDark: '#5A4A42',
  textMedium: '#8B7D77',
};

export function NewsletterForm({ className, colors = {} }: NewsletterFormProps) {
  const turnstileRef = useRef<TurnstileRef>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('CO');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const c = { ...defaultColors, ...colors };
  const selectedCountry = countryCodes.find(c => c.code === countryCode)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!turnstileToken) {
        setError('Por favor completa la verificación anti-bot');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          phone,
          countryCode,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al suscribirse');
        setIsLoading(false);
        setTurnstileToken('');
        turnstileRef.current?.reset();
        return;
      }

      setSuccess(data.message);
      setName('');
      setEmail('');
      setPhone('');
      setTurnstileToken('');
      turnstileRef.current?.reset();
    } catch (err) {
      setError('Ocurrió un error. Intenta de nuevo.');
      setTurnstileToken('');
      turnstileRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Name Input */}
        <StyledInput
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          colors={c}
          icon={FormIcons.user}
        />

        {/* Email Input */}
        <StyledInput
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          colors={c}
          icon={FormIcons.email}
        />

        {/* Phone Input with Country Selector */}
        <div
          className="flex items-center gap-0 overflow-hidden"
          style={{
            borderRadius: '16px',
            backgroundColor: 'white',
            boxShadow: `0 2px 8px ${c.pink}30`,
          }}
        >
          <Select value={countryCode} onValueChange={(v) => setCountryCode(v as CountryCode)} disabled={isLoading}>
            <SelectTrigger
              className="border-0 shadow-none h-[52px] w-auto gap-2 px-4 rounded-none bg-transparent hover:bg-gray-50 transition-colors"
              style={{ borderRight: `1px solid ${c.peach}60` }}
            >
              <selectedCountry.Flag className="h-5 w-7 rounded-sm" />
              <span className="text-sm font-medium" style={{ color: c.textDark }}>
                {selectedCountry.prefix}
              </span>
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-3">
                    <country.Flag className="h-4 w-6 rounded-sm" />
                    <span className="font-medium">{country.name}</span>
                    <span className="text-muted-foreground">{country.prefix}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="tel"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            required
            disabled={isLoading}
            className="styled-input flex-1"
            style={{
              height: '52px',
              padding: '0 16px',
              borderRadius: 0,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              color: c.textDark,
              outline: 'none',
            }}
          />
        </div>

        {/* Turnstile */}
        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            onVerify={setTurnstileToken}
            onError={() => setError('Error en verificación anti-bot')}
            onExpire={() => setTurnstileToken('')}
          />
        </div>

        {/* Submit Button */}
        <StyledButton
          type="submit"
          disabled={isLoading || !turnstileToken}
          isLoading={isLoading}
          loadingText="Suscribiendo..."
          colors={c}
        >
          Suscribirme gratis
        </StyledButton>

        {/* Error Message */}
        {error && <StyledError message={error} />}

        {/* Success Message */}
        {success && <StyledSuccess message={success} colors={c} />}
      </div>
    </form>
  );
}
