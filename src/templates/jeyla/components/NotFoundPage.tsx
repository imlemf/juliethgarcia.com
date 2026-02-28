import type { TemplateConfig } from '../../types';

export function NotFoundPage({ config }: { config: TemplateConfig }) {
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelCream = (config.pastelCream as string) || '#FFF8E7';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center" style={{ backgroundColor: '#FFF8F5' }}>
      <div className="container mx-auto max-w-lg text-center">
        <div
          className="rounded-3xl p-10 md:p-14"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: `0 25px 50px -12px ${pastelPink}30`,
          }}
        >
          {/* Decorative 404 */}
          <div className="relative mb-8">
            <p
              className="text-[120px] md:text-[150px] font-bold leading-none select-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: `3px ${pastelPeach}`,
              }}
            >
              404
            </p>
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${pastelLavender}50` }}
              >
                <svg className="w-10 h-10" fill="none" stroke={pastelTextMedium} viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: pastelTextDark }}>
            Pagina no encontrada
          </h1>
          <p className="mb-10 text-base" style={{ color: pastelTextMedium }}>
            Lo sentimos, la pagina que buscas no existe o fue movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ backgroundColor: pastelGreenMint, color: pastelTextDark }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Ir al inicio
            </a>
            <a
              href="/recipes"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ backgroundColor: `${pastelLavender}60`, color: pastelTextDark }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Ver recetas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
