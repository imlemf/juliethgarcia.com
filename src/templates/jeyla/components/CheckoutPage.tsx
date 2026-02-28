import { useState, useRef } from 'react';
import type { CheckoutPageProps } from '../../types';
import { Turnstile, type TurnstileRef } from '@/components/auth/turnstile';

interface AppliedCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  finalPrice: number;
}

export function CheckoutPage({ config, product, isAuthenticated, isPremium }: CheckoutPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Email state (for non-authenticated users)
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Turnstile state
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Pastel colors from config
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  // Format price
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate coupon
  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !product) return;

    // Validate email if not authenticated
    if (!isAuthenticated) {
      if (!email.trim()) {
        setEmailError('El email es requerido');
        return;
      }
      if (!isValidEmail(email.trim())) {
        setEmailError('Email inválido');
        return;
      }
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setEmailError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          productId: product.id,
          ...((!isAuthenticated && email.trim()) && { email: email.trim() }),
        }),
      });

      const data = await response.json();

      if (!data.valid) {
        throw new Error(data.error || 'Código inválido');
      }

      setAppliedCoupon({
        id: data.couponId,
        code: data.couponCode || couponCode.trim(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        finalPrice: data.finalAmount,
      });
    } catch (err: any) {
      setCouponError(err.message || 'Código inválido');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleCheckout = async () => {
    if (!product) return;

    // Validate email if not authenticated
    if (!isAuthenticated) {
      if (!email.trim()) {
        setEmailError('El email es requerido');
        return;
      }
      if (!isValidEmail(email.trim())) {
        setEmailError('Email inválido');
        return;
      }
    }

    // Require turnstile token
    if (!turnstileToken) {
      setError('Por favor completa la verificación de seguridad');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEmailError(null);

    try {
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          buyerEmail: isAuthenticated ? undefined : email.trim(),
          turnstileToken,
          couponId: appliedCoupon?.id || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el checkout');
      }

      // Redirect to payment URL
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      // Reset turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8F5' }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${pastelPeach}60` }}
          >
            <svg className="w-10 h-10" fill="none" stroke={pastelTextMedium} viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: pastelTextDark }}>
            Producto no encontrado
          </h1>
          <p className="mb-8" style={{ color: pastelTextMedium }}>
            El producto que buscas no existe o no está disponible.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
            style={{ backgroundColor: pastelMint, color: pastelTextDark }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  // User already has premium
  if (isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8F5' }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${pastelGreenMint}60` }}
          >
            <svg className="w-10 h-10" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={1.5}>
              <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: pastelTextDark }}>
            Ya tienes acceso Premium
          </h1>
          <p className="mb-8" style={{ color: pastelTextMedium }}>
            Ya tienes acceso a todo el contenido premium. ¡Disfrútalo!
          </p>
          <a
            href="/recipes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
            style={{ backgroundColor: pastelGreenMint, color: pastelTextDark }}
          >
            Ver recetas premium
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F5' }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-24 pb-24"
        style={{
          background: `linear-gradient(135deg, ${pastelMint}60 0%, ${pastelGreenMint}40 50%, ${pastelLavender}60 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-50 blur-3xl"
          style={{ backgroundColor: pastelPink }}
        />
        <div
          className="absolute top-1/2 -left-20 w-48 h-48 rounded-full opacity-40 blur-3xl"
          style={{ backgroundColor: pastelMint }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: pastelTextDark }}
            >
              Comienza hoy
            </h1>
            <p
              className="text-lg"
              style={{ color: pastelTextMedium }}
            >
              Estás a unos pasos de comenzar a cambiar tu cuerpo y tu vida
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute -bottom-px left-0 right-0 z-10">
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
            style={{ minHeight: '80px' }}
          >
            <path
              d="M0 40C240 80 480 100 720 90C960 80 1200 50 1440 40V120H0V40Z"
              style={{ fill: '#FFF8F5' }}
            />
          </svg>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-12 px-4 relative" style={{ backgroundColor: '#FFF8F5' }}>
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left column - Product and Benefits */}
            <div className="lg:col-span-3 space-y-6">
            {/* Product Card */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: `0 25px 50px -12px ${pastelPink}30`,
              }}
            >
              {product.imageUrl && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ color: pastelTextDark }}
                >
                  {product.name}
                </h2>
                <p
                  className="leading-relaxed"
                  style={{ color: pastelTextMedium }}
                >
                  {product.description}
                </p>
              </div>
            </div>

            {/* Benefits Card */}
            <div
              className="rounded-3xl p-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: `0 25px 50px -12px ${pastelMint}20`,
              }}
            >
              <h3
                className="text-lg font-bold mb-4 flex items-center gap-2"
                style={{ color: pastelTextDark }}
              >
                <svg className="w-5 h-5" fill="none" stroke={pastelGreenMint} viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Gana acceso premium
              </h3>
              <div className="space-y-3">
                {[
                  'Acceso a todas las recetas premium',
                  'Acceso a artículos premium',
                  'Ingredientes y preparación completa',
                  'Modo de preparación paso a paso',
                  'Temporizadores inteligentes',
                  'Ajustar porciones',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${pastelGreenMint}60` }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm" style={{ color: pastelTextMedium }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Right column - Payment Card */}
            <div className="lg:col-span-2 h-fit lg:sticky lg:top-8">
            <div
              className="rounded-3xl p-6 lg:p-8"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: `0 25px 50px -12px ${pastelMint}30`,
              }}
            >
              <h3
                className="text-xl font-bold mb-6"
                style={{ color: pastelTextDark }}
              >
                Resumen de compra
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span style={{ color: pastelTextMedium }}>{product.name}</span>
                  <span className="font-semibold" style={{ color: pastelTextDark }}>
                    {formatPrice(product.price, product.currency)}
                  </span>
                </div>

                {/* Applied coupon */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2" style={{ color: pastelTextMedium }}>
                      <svg className="w-4 h-4" fill="none" stroke={pastelGreenMint} viewBox="0 0 24 24" strokeWidth={2}>
                        <path d="M7 7h10v10H7z" />
                        <path d="M7 7L5.5 5.5A2.12 2.12 0 0 0 4 5c-1.1 0-2 .9-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.5" />
                        <path d="M14 7l3.5-3.5a2.12 2.12 0 0 1 1.5-.5c1.1 0 2 .9 2 2v10a2 2 0 0 1-2 2h-1.5" />
                      </svg>
                      Descuento ({appliedCoupon.code})
                    </span>
                    <span style={{ color: pastelGreenMint }}>
                      -{appliedCoupon.discountType === 'percentage'
                        ? `${appliedCoupon.discountValue}%`
                        : formatPrice(appliedCoupon.discountValue, product.currency)}
                    </span>
                  </div>
                )}

                <div
                  className="border-t pt-4"
                  style={{ borderColor: `${pastelMint}60` }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold" style={{ color: pastelTextDark }}>Total</span>
                    <div className="text-right">
                      {appliedCoupon && (
                        <span className="block text-sm line-through" style={{ color: pastelTextMedium }}>
                          {formatPrice(product.price, product.currency)}
                        </span>
                      )}
                      <span
                        className="text-2xl font-bold"
                        style={{ color: pastelTextDark }}
                      >
                        {formatPrice(appliedCoupon?.finalPrice ?? product.price, product.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email input (for non-authenticated users) */}
              {!isAuthenticated && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: pastelTextDark }}>
                    Tu email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      backgroundColor: `${pastelLavender}30`,
                      color: pastelTextDark,
                      border: emailError ? `2px solid ${pastelPink}` : '2px solid transparent',
                    }}
                  />
                  {emailError && (
                    <p className="mt-2 text-sm" style={{ color: '#e57373' }}>
                      {emailError}
                    </p>
                  )}
                </div>
              )}

              {/* Coupon input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: pastelTextDark }}>
                  ¿Tienes un código de descuento?
                </label>
                {appliedCoupon ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: `${pastelGreenMint}30` }}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke={pastelGreenMint} viewBox="0 0 24 24" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="font-medium" style={{ color: pastelTextDark }}>
                        {appliedCoupon.code}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm hover:underline"
                      style={{ color: pastelTextMedium }}
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CODIGO"
                      className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        backgroundColor: `${pastelLavender}30`,
                        color: pastelTextDark,
                        border: couponError ? `2px solid ${pastelPink}` : '2px solid transparent',
                      }}
                    />
                    <button
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                      style={{ backgroundColor: pastelMint, color: pastelTextDark }}
                    >
                      {isValidatingCoupon ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        'Aplicar'
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-2 text-sm" style={{ color: '#e57373' }}>
                    {couponError}
                  </p>
                )}
              </div>

              {/* Turnstile */}
              <div className="mb-6 flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  theme="light"
                />
              </div>

              {error && (
                <div
                  className="mb-4 p-4 rounded-xl text-sm"
                  style={{
                    backgroundColor: `${pastelPink}40`,
                    color: pastelTextDark,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isLoading || !turnstileToken}
                className="w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: pastelGreenMint,
                  color: pastelTextDark,
                  boxShadow: `0 4px 15px ${pastelGreenMint}50`,
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Comprar ahora
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs" style={{ color: pastelTextMedium }}>
                Pago seguro procesado por Mercado Pago
              </p>

              {!isAuthenticated && (
                <div
                  className="mt-6 p-4 rounded-xl text-center"
                  style={{ backgroundColor: `${pastelLavender}40` }}
                >
                  <p className="text-sm mb-2" style={{ color: pastelTextMedium }}>
                    ¿Ya tienes una cuenta?
                  </p>
                  <a
                    href="/login"
                    className="text-sm font-medium hover:underline"
                    style={{ color: pastelTextDark }}
                  >
                    Inicia sesión antes de comprar
                  </a>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ backgroundColor: `${pastelLavender}60`, color: pastelTextDark }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
