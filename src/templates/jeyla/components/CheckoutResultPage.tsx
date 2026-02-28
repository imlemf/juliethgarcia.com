import type { CheckoutResultPageProps } from '../../types';

export function CheckoutResultPage({
  config,
  statusType,
  payment,
  purchaseCode,
  productSlug,
  downloadToken,
  showRegister,
}: CheckoutResultPageProps) {
  // Pastel colors from config
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  const statusConfig = {
    approved: {
      title: '¡Pago exitoso!',
      description: purchaseCode
        ? 'Tu pago ha sido procesado correctamente. Hemos enviado un email con tu código de compra y los detalles de acceso.'
        : 'Tu pago ha sido procesado correctamente. En breve recibirás un email con los detalles de tu compra.',
      bgColor: pastelGreenMint,
      iconBgColor: `${pastelGreenMint}60`,
    },
    pending: {
      title: 'Pago pendiente',
      description: 'Tu pago está siendo procesado. Te notificaremos por email cuando se complete.',
      bgColor: pastelLavender,
      iconBgColor: `${pastelLavender}80`,
    },
    failure: {
      title: 'Pago rechazado',
      description: 'No pudimos procesar tu pago. Por favor intenta nuevamente con otro método de pago.',
      bgColor: pastelPink,
      iconBgColor: `${pastelPink}80`,
    },
    unknown: {
      title: 'Estado desconocido',
      description: 'No pudimos determinar el estado de tu pago. Por favor contacta a soporte.',
      bgColor: pastelLavender,
      iconBgColor: `${pastelLavender}80`,
    },
  };

  const currentStatus = statusConfig[statusType];

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      approved: 'Aprobado',
      pending: 'Pendiente',
      in_process: 'En proceso',
      authorized: 'Autorizado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
      charged_back: 'Contracargo',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: '#FFF8F5' }}>
      <div className="container mx-auto max-w-2xl">
        <div
          className="rounded-3xl p-8 md:p-12"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: `0 25px 50px -12px ${currentStatus.bgColor}40`,
          }}
        >
          <div className="text-center space-y-6">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
              style={{ backgroundColor: currentStatus.iconBgColor }}
            >
              {statusType === 'approved' && (
                <svg className="w-10 h-10" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusType === 'pending' && (
                <svg className="w-10 h-10" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusType === 'failure' && (
                <svg className="w-10 h-10" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusType === 'unknown' && (
                <svg className="w-10 h-10" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: pastelTextDark }}>
                {currentStatus.title}
              </h1>
              <p className="text-base" style={{ color: pastelTextMedium }}>
                {currentStatus.description}
              </p>
            </div>

            {/* Payment Details */}
            {payment && (
              <div
                className="rounded-2xl p-6 text-left"
                style={{ backgroundColor: `${pastelLavender}30` }}
              >
                <h3 className="font-semibold mb-4" style={{ color: pastelTextDark }}>
                  Detalles de la transacción
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt style={{ color: pastelTextMedium }}>ID de pago:</dt>
                    <dd className="font-mono" style={{ color: pastelTextDark }}>{payment.id}</dd>
                  </div>

                  {payment.transactionAmount > 0 && (
                    <div className="flex justify-between">
                      <dt style={{ color: pastelTextMedium }}>Monto:</dt>
                      <dd className="font-semibold" style={{ color: pastelTextDark }}>
                        {formatPrice(payment.transactionAmount, payment.currencyId)}
                      </dd>
                    </div>
                  )}

                  {payment.paymentMethodId && (
                    <div className="flex justify-between">
                      <dt style={{ color: pastelTextMedium }}>Método:</dt>
                      <dd className="capitalize" style={{ color: pastelTextDark }}>{payment.paymentMethodId}</dd>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <dt style={{ color: pastelTextMedium }}>Estado:</dt>
                    <dd style={{ color: pastelTextDark }}>{translateStatus(payment.status)}</dd>
                  </div>

                  {purchaseCode && (
                    <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: `${pastelMint}60` }}>
                      <dt className="font-medium" style={{ color: pastelTextDark }}>Código de compra:</dt>
                      <dd
                        className="font-mono font-bold px-3 py-1 rounded-lg"
                        style={{ backgroundColor: `${pastelGreenMint}40`, color: pastelTextDark }}
                      >
                        {purchaseCode}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Email notification for approved */}
            {statusType === 'approved' && payment?.payerEmail && (
              <div
                className="rounded-xl p-4 text-sm"
                style={{ backgroundColor: `${pastelGreenMint}30` }}
              >
                <p style={{ color: pastelTextMedium }}>
                  Revisa tu email <strong style={{ color: pastelTextDark }}>{payment.payerEmail}</strong> para obtener los detalles de acceso.
                </p>
              </div>
            )}

            {/* Register CTA */}
            {statusType === 'approved' && showRegister && payment?.payerEmail && (
              <div
                className="rounded-xl p-5 text-sm"
                style={{ backgroundColor: `${pastelLavender}25` }}
              >
                <p className="mb-3" style={{ color: pastelTextMedium }}>
                  Crea una cuenta para acceder a tus recetas premium y gestionar tus descargas.
                </p>
                <a
                  href={`/register?email=${encodeURIComponent(payment.payerEmail)}${purchaseCode ? `&pcode=${encodeURIComponent(purchaseCode)}` : ''}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: pastelMint, color: pastelTextDark }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  Crear cuenta con {payment.payerEmail}
                </a>
              </div>
            )}

            {/* Download Button */}
            {statusType === 'approved' && downloadToken && (
              <a
                href={`/downloads/${downloadToken}`}
                data-astro-prefetch="false"
                data-astro-reload
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: pastelGreenMint,
                  color: pastelTextDark,
                  boxShadow: `0 8px 25px ${pastelGreenMint}50`,
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar ahora
              </a>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {statusType === 'approved' && (
                <a
                  href="/recipes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: `${pastelGreenMint}50`, color: pastelTextDark }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Ver recetas
                </a>
              )}
              {statusType === 'failure' && productSlug && (
                <a
                  href={`/checkout/${productSlug}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: pastelMint, color: pastelTextDark }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Intentar nuevamente
                </a>
              )}
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{ backgroundColor: `${pastelLavender}60`, color: pastelTextDark }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
