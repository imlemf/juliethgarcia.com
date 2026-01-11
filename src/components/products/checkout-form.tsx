'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Turnstile } from '@/components/auth/turnstile';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
  };
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!turnstileToken) {
        setError('Por favor completa la verificación anti-bot');
        setIsLoading(false);
        return;
      }

      if (!email) {
        setError('Por favor ingresa tu email');
        setIsLoading(false);
        return;
      }

      // Create payment preference
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerEmail: email,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Error al crear la preferencia de pago');
      }

      const { initPoint, sandboxInitPoint } = await response.json() as { initPoint: string; sandboxInitPoint: string };

      // Redirect to Mercado Pago checkout
      // Use sandbox URL in development
      const checkoutUrl = process.env.NODE_ENV === 'development'
        ? sandboxInitPoint
        : initPoint;

      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-6 space-y-4">
        <h3 className="font-semibold text-lg">Resumen de compra</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Producto:</span>
            <span className="font-medium">{product.name}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{formatCurrency(product.price / 100, product.currency)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Recibirás el código de compra y link de descarga en este email
        </p>
      </div>

      <div className="space-y-2">
        <Label>Verificación anti-bot *</Label>
        <Turnstile
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

      <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 text-sm space-y-2">
        <p className="font-medium text-blue-900 dark:text-blue-100">
          ¿Qué sucede después del pago?
        </p>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
          <li>Recibirás un email con tu código de compra único</li>
          <li>El email incluirá un link de descarga directo (primera descarga gratuita)</li>
          <li>Para descargas adicionales, necesitarás crear una cuenta con tu código</li>
          <li>Si ya tienes cuenta, solo inicia sesión</li>
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || !turnstileToken}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          'Continuar al pago'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Serás redirigido a Mercado Pago para completar el pago de forma segura
      </p>
    </form>
  );
}
