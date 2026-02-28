import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Turnstile } from '@/components/auth/turnstile';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Loader2, Tag, X, Check } from 'lucide-react';

interface CheckoutFormProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
  };
}

interface ActiveOffer {
  offerId: string;
  offerName: string;
  offerDescription: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discount: number;
  finalAmount: number;
}

interface AppliedCoupon {
  couponId: string;
  couponCode: string;
  couponName: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discount: number;
  finalAmount: number;
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Offer state
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(true);

  // Check for active offers on mount
  useEffect(() => {
    const fetchActiveOffer = async () => {
      try {
        const response = await fetch('/api/offers/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            amount: product.price,
          }),
        });

        if (response.ok) {
          const data = await response.json() as { hasOffer: boolean } & ActiveOffer;
          if (data.hasOffer) {
            setActiveOffer({
              offerId: data.offerId,
              offerName: data.offerName,
              offerDescription: data.offerDescription,
              discountType: data.discountType,
              discountValue: data.discountValue,
              discount: data.discount,
              finalAmount: data.finalAmount,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching active offer:', err);
      } finally {
        setIsLoadingOffer(false);
      }
    };

    fetchActiveOffer();
  }, [product.id, product.price]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponError('');
    setIsValidatingCoupon(true);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          productId: product.id,
          email: email || 'temp@example.com', // Use temp email if not provided yet
          amount: product.price,
        }),
      });

      const data = await response.json() as {
        valid: boolean;
        error?: string;
        couponId?: string;
        couponCode?: string;
        couponName?: string;
        discountType?: 'percentage' | 'fixed';
        discountValue?: number;
        discount?: number;
        finalAmount?: number;
      };

      if (!data.valid) {
        setCouponError(data.error || 'Cupón inválido');
        return;
      }

      setAppliedCoupon({
        couponId: data.couponId!,
        couponCode: data.couponCode!,
        couponName: data.couponName!,
        discountType: data.discountType!,
        discountValue: data.discountValue!,
        discount: data.discount!,
        finalAmount: data.finalAmount!,
      });
      setCouponCode('');
    } catch (err) {
      setCouponError('Error al validar cupón');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Determine final price and discount
  const getDiscount = () => {
    if (appliedCoupon) {
      return {
        type: 'coupon' as const,
        name: appliedCoupon.couponCode,
        discount: appliedCoupon.discount,
        finalAmount: appliedCoupon.finalAmount,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
      };
    }
    if (activeOffer) {
      return {
        type: 'offer' as const,
        name: activeOffer.offerName,
        discount: activeOffer.discount,
        finalAmount: activeOffer.finalAmount,
        discountType: activeOffer.discountType,
        discountValue: activeOffer.discountValue,
      };
    }
    return null;
  };

  const discount = getDiscount();
  const finalAmount = discount ? discount.finalAmount : product.price;

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

      // Re-validate coupon with actual email if coupon is applied
      if (appliedCoupon) {
        const validateResponse = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: appliedCoupon.couponCode,
            productId: product.id,
            email,
            amount: product.price,
          }),
        });

        const validateData = await validateResponse.json() as { valid: boolean; error?: string };
        if (!validateData.valid) {
          setError(validateData.error || 'El cupón ya no es válido');
          setAppliedCoupon(null);
          setIsLoading(false);
          return;
        }
      }

      // Create payment preference
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerEmail: email,
          turnstileToken,
          couponId: appliedCoupon?.couponId,
          offerId: !appliedCoupon ? activeOffer?.offerId : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Error al crear la preferencia de pago');
      }

      const { initPoint } = await response.json() as { initPoint: string };

      // Redirect to Mercado Pago checkout
      window.location.href = initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setIsLoading(false);
    }
  };

  const formatDiscountLabel = (discountType: 'percentage' | 'fixed', discountValue: number) => {
    if (discountType === 'percentage') {
      return `${discountValue}% OFF`;
    }
    return `${formatCurrency(discountValue / 100, product.currency)} OFF`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Active offer banner */}
      {activeOffer && !appliedCoupon && !isLoadingOffer && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Tag className="h-5 w-5" />
            <span className="font-semibold">{activeOffer.offerName}</span>
            <span className="ml-auto font-bold">
              {formatDiscountLabel(activeOffer.discountType, activeOffer.discountValue)}
            </span>
          </div>
          {activeOffer.offerDescription && (
            <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
              {activeOffer.offerDescription}
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg bg-muted p-6 space-y-4">
        <h3 className="font-semibold text-lg">Resumen de compra</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Producto:</span>
            <span className="font-medium">{product.name}</span>
          </div>

          {discount && (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>Precio:</span>
                <span className="line-through">
                  {formatCurrency(product.price / 100, product.currency)}
                </span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {discount.type === 'coupon' ? 'Cupón' : 'Oferta'}: {discount.name}
                </span>
                <span>-{formatCurrency(discount.discount / 100, product.currency)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between text-xl font-bold pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(finalAmount / 100, product.currency)}</span>
          </div>
        </div>
      </div>

      {/* Coupon section */}
      <div className="space-y-2">
        <Label>Cupón de descuento</Label>
        {appliedCoupon ? (
          <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {appliedCoupon.couponCode} aplicado
            </span>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="ml-auto p-1 hover:bg-green-500/20 rounded"
            >
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Ingresa tu código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={isValidatingCoupon || isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || isValidatingCoupon || isLoading}
            >
              {isValidatingCoupon ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Aplicar'
              )}
            </Button>
          </div>
        )}
        {couponError && (
          <p className="text-sm text-destructive">{couponError}</p>
        )}
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

      <div className="rounded-md bg-muted p-4 text-sm space-y-2">
        <p className="font-medium">
          ¿Qué sucede después del pago?
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
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
