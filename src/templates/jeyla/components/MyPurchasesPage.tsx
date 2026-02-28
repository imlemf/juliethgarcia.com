import type { MyPurchasesPageProps } from '../../types';

export function MyPurchasesPage({ config, isAuthenticated, purchases }: MyPurchasesPageProps) {
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelCream = (config.pastelCream as string) || '#FFF8E7';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const getDownloadInfo = (purchase: MyPurchasesPageProps['purchases'][0]) => {
    const link = purchase.downloadLinks[0];
    if (!link) return null;

    const expired = isExpired(link.expiresAt);
    // Authenticated users have unlimited downloads
    const canDownload = !expired;

    return { ...link, expired, canDownload };
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: '#FFF8F5' }}>
        <div className="container mx-auto max-w-2xl text-center">
          <div
            className="rounded-3xl p-12"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: `0 25px 50px -12px ${pastelPink}40`,
            }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${pastelLavender}60` }}
            >
              <svg className="w-8 h-8" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: pastelTextDark }}>
              Inicia sesion para ver tus compras
            </h1>
            <p className="mb-8" style={{ color: pastelTextMedium }}>
              Necesitas una cuenta para acceder a tu historial de compras y descargas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{ backgroundColor: pastelGreenMint, color: pastelTextDark }}
              >
                Iniciar sesion
              </a>
              <a
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{ backgroundColor: `${pastelLavender}60`, color: pastelTextDark }}
              >
                Crear cuenta
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No purchases
  if (purchases.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: '#FFF8F5' }}>
        <div className="container mx-auto max-w-2xl text-center">
          <div
            className="rounded-3xl p-12"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: `0 25px 50px -12px ${pastelMint}40`,
            }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${pastelCream}` }}
            >
              <svg className="w-8 h-8" fill="none" stroke={pastelTextMedium} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: pastelTextDark }}>
              Aun no tienes compras
            </h1>
            <p className="mb-8" style={{ color: pastelTextMedium }}>
              Cuando compres un producto digital, aparecera aqui para que puedas descargarlo.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ backgroundColor: pastelGreenMint, color: pastelTextDark }}
            >
              Explorar productos
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Has purchases
  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: '#FFF8F5' }}>
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: pastelTextDark }}>
            Mis Compras
          </h1>
          <p style={{ color: pastelTextMedium }}>
            {purchases.length} {purchases.length === 1 ? 'producto comprado' : 'productos comprados'}
          </p>
        </div>

        {/* Purchase List */}
        <div className="space-y-5">
          {purchases.map((purchase) => {
            const dlInfo = getDownloadInfo(purchase);

            return (
              <div
                key={purchase.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: `0 8px 30px ${pastelPink}20`,
                }}
              >
                <div className="p-6">
                  {/* Product info */}
                  <div className="flex gap-5">
                    {/* Image */}
                    {purchase.productImageUrl ? (
                      <div className="flex-shrink-0">
                        <img
                          src={purchase.productImageUrl}
                          alt={purchase.productName}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${pastelCream}` }}
                      >
                        <svg className="w-8 h-8" fill="none" stroke={pastelTextMedium} viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold truncate" style={{ color: pastelTextDark }}>
                        {purchase.productName}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: pastelTextMedium }}>
                        {formatDate(purchase.createdAt)}
                      </p>
                      <p className="text-lg font-bold mt-1" style={{ color: pastelTextDark }}>
                        {formatPrice(purchase.amount, purchase.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Download section */}
                  {dlInfo && (
                    <div
                      className="mt-5 rounded-xl p-4"
                      style={{ backgroundColor: dlInfo.canDownload ? `${pastelGreenMint}15` : `${pastelLavender}30` }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Download info */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3 text-sm">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: dlInfo.canDownload ? `${pastelGreenMint}40` : `${pastelPink}40`,
                                color: pastelTextDark,
                              }}
                            >
                              {dlInfo.canDownload ? 'Disponible' : 'Expirado'}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: pastelTextMedium }}>
                            {dlInfo.downloadCount} {dlInfo.downloadCount === 1 ? 'descarga' : 'descargas'}
                            {' · '}
                            {dlInfo.expired
                              ? `Expiro el ${formatDate(dlInfo.expiresAt)}`
                              : `Valido hasta ${formatDate(dlInfo.expiresAt)}`}
                          </p>
                        </div>

                        {/* Download button */}
                        {dlInfo.canDownload ? (
                          <a
                            href={`/downloads/${dlInfo.token}`}
                            data-astro-prefetch="false"
                            data-astro-reload
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105 flex-shrink-0"
                            style={{ backgroundColor: pastelGreenMint, color: pastelTextDark }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Descargar
                          </a>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm opacity-50 flex-shrink-0"
                            style={{ backgroundColor: `${pastelLavender}60`, color: pastelTextMedium }}
                          >
                            No disponible
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Purchase code */}
                  <div
                    className="mt-4 flex items-center justify-between rounded-lg px-4 py-2.5"
                    style={{ backgroundColor: `${pastelCream}` }}
                  >
                    <span className="text-xs" style={{ color: pastelTextMedium }}>
                      Codigo de compra
                    </span>
                    <span
                      className="text-sm font-mono font-bold tracking-wider"
                      style={{ color: pastelTextDark }}
                    >
                      {purchase.purchaseCode}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
