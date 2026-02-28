import type { LinksPageProps } from '../../types';
import { DynamicIcon } from './DynamicIcon';

export function LinksPage({ config, links, siteName = 'Jeyla' }: LinksPageProps) {
  // Pastel colors from config
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';
  const logoUrl = (config.logoUrl as string) || null;
  const bio = (config.linksBio as string) || '';

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${pastelPink} 0%, ${pastelPeach} 50%, ${pastelLavender} 100%)`
      }}
    >
      {/* Decorative elements */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-50 blur-3xl"
        style={{ backgroundColor: pastelPink }}
      />
      <div
        className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: pastelMint }}
      />
      <div
        className="absolute -bottom-32 left-1/4 w-72 h-72 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: pastelLavender }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-30 blur-2xl hidden md:block"
        style={{ backgroundColor: pastelPeach }}
      />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-lg">
          {/* Profile Card */}
          <div
            className="rounded-[2rem] p-8 mb-8 text-center backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              boxShadow: `0 25px 50px -12px ${pastelPink}40`
            }}
          >
            {/* Avatar/Logo */}
            <div className="relative inline-block mb-6">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${pastelMint} 0%, ${pastelGreenMint} 100%)`,
                  boxShadow: `0 8px 24px ${pastelMint}60`
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-4xl font-bold"
                    style={{ color: pastelTextDark }}
                  >
                    {siteName.charAt(0)}
                  </span>
                )}
              </div>
              {/* Decorative ring */}
              <div
                className="absolute -inset-2 rounded-full opacity-60"
                style={{
                  border: `3px dashed ${pastelPink}`,
                  animation: 'spin 20s linear infinite'
                }}
              />
            </div>

            <h1
              className={`text-3xl font-bold${bio ? ' mb-2' : ''}`}
              style={{ color: pastelTextDark }}
            >
              {siteName}
            </h1>
            {bio && (
              <p
                className="text-base"
                style={{ color: pastelTextMedium }}
              >
                {bio}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-4">
            {links.map((link, index) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 w-full p-5 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: pastelTextDark,
                  boxShadow: `0 4px 20px ${pastelPink}25`,
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Icon container */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: `linear-gradient(135deg, ${pastelPink}80 0%, ${pastelPeach}80 100%)`
                  }}
                >
                  <DynamicIcon
                    icon={link.icon}
                    iconType={link.iconType}
                    size={22}
                    color={pastelTextDark}
                  />
                </div>

                {/* Text */}
                <span className="flex-1 text-left group-hover:translate-x-1 transition-transform duration-300">
                  {link.title}
                </span>

                {/* Arrow */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                  style={{ color: pastelTextMedium }}
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>

          {links.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: pastelTextMedium
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 opacity-50"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <p>No hay enlaces disponibles.</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                color: pastelTextDark,
                boxShadow: `0 4px 15px ${pastelPink}20`
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Visitar sitio web
            </a>
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
