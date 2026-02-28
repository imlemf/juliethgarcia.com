import { useState } from 'react';
import type { HeaderProps } from '../../types';

export function Header({ config, siteName = 'Jeyla', user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Pastel colors from config with defaults
  const pastelCream = (config.pastelCream as string) || '#FFF8E7';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';

  // Get user initial
  const userInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

  // Format premium expiration date
  const formatPremiumDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';

    let date: Date;

    // Try to parse the date
    if (typeof dateStr === 'string') {
      date = new Date(dateStr);
    } else if (typeof dateStr === 'number') {
      // If it's a Unix timestamp (seconds), convert to milliseconds
      date = dateStr > 9999999999 ? new Date(dateStr) : new Date(dateStr * 1000);
    } else {
      return '';
    }

    // Validate the date
    if (isNaN(date.getTime()) || date.getFullYear() > 2100 || date.getFullYear() < 2000) {
      return '';
    }

    const now = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    // If same year, show DD/MM, otherwise show MM/YYYY
    if (year === now.getFullYear()) {
      return `${day}/${month}`;
    }
    return `${month}/${year}`;
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="text-xl font-bold transition-colors"
            style={{ color: pastelTextDark }}
          >
            {siteName}
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/recipes"
              className="transition-colors hover:opacity-80"
              style={{ color: pastelTextMedium }}
            >
              Recetas
            </a>
            <a
              href="/blog"
              className="transition-colors hover:opacity-80"
              style={{ color: pastelTextMedium }}
            >
              Blog
            </a>
            <a
              href="/links"
              className="transition-colors hover:opacity-80"
              style={{ color: pastelTextMedium }}
            >
              Redes
            </a>

            {user ? (
              /* User avatar with dropdown */
              <div
                className="relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${pastelPeach} 0%, ${pastelPink} 100%)`,
                    color: pastelTextDark,
                    boxShadow: `0 4px 15px ${pastelPink}50`,
                  }}
                >
                  {userInitial}
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 top-full pt-2"
                  >
                    <div
                      className="py-2 px-1 rounded-xl min-w-[160px]"
                      style={{
                        backgroundColor: 'white',
                        boxShadow: `0 8px 30px ${pastelPink}40`,
                        border: `1px solid ${pastelMint}`,
                      }}
                    >
                    <div className="px-3 py-2 border-b" style={{ borderColor: pastelMint }}>
                      <p className="text-sm font-medium truncate" style={{ color: pastelTextDark }}>
                        {user.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: pastelTextMedium }}>
                        {user.email}
                      </p>
                    </div>
                    <div className="px-3 py-2 border-b" style={{ borderColor: pastelMint }}>
                      {user.isPremium ? (
                        <div className="flex items-center gap-2 text-xs" style={{ color: pastelTextDark }}>
                          <svg className="w-4 h-4" style={{ color: pastelGreenMint }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          <div>
                            <div className="font-semibold">Premium</div>
                            {formatPremiumDate(user.premiumUntil) && (
                              <div style={{ color: pastelTextMedium }}>hasta {formatPremiumDate(user.premiumUntil)}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs" style={{ color: pastelTextDark }}>
                          <svg className="w-4 h-4" style={{ color: pastelTextMedium }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span className="font-semibold">Basic</span>
                        </div>
                      )}
                    </div>
                    <a
                      href="/my-purchases"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                      style={{
                        color: pastelTextDark,
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${pastelMint}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      Mis Compras
                    </a>
                    {user.role === 'admin' && (
                      <a
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                        style={{
                          color: pastelTextDark,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${pastelMint}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        Panel Admin
                      </a>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/auth/logout', { method: 'POST' });
                          if (res.ok) {
                            window.location.href = '/';
                          }
                        } catch (e) {
                          console.error('Logout error:', e);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] w-full"
                      style={{
                        color: pastelTextDark,
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${pastelPink}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login button */
              <a
                href="/login"
                className="px-5 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: pastelGreenMint,
                  color: pastelTextDark,
                }}
              >
                Acceder
              </a>
            )}
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ color: pastelTextDark }}
            aria-label="Menú"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div
            className="md:hidden mt-2 py-4 px-4 rounded-2xl"
            style={{
              backgroundColor: 'white',
              boxShadow: `0 8px 30px ${pastelPink}40`,
              border: `1px solid ${pastelMint}`,
            }}
          >
            <div className="flex flex-col gap-1">
              <a
                href="/recipes"
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: pastelTextDark }}
              >
                Recetas
              </a>
              <a
                href="/blog"
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: pastelTextDark }}
              >
                Blog
              </a>
              <a
                href="/links"
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: pastelTextDark }}
              >
                Redes
              </a>

              {user ? (
                <>
                  <div className="my-2 border-t" style={{ borderColor: pastelMint }} />
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium" style={{ color: pastelTextDark }}>{user.name}</p>
                    <p className="text-xs" style={{ color: pastelTextMedium }}>{user.email}</p>
                  </div>
                  <div className="px-3 py-1">
                    {user.isPremium ? (
                      <div className="flex items-center gap-2 text-xs" style={{ color: pastelTextDark }}>
                        <svg className="w-4 h-4" style={{ color: pastelGreenMint }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                        <span className="font-semibold">Premium</span>
                        {formatPremiumDate(user.premiumUntil) && (
                          <span style={{ color: pastelTextMedium }}>hasta {formatPremiumDate(user.premiumUntil)}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs" style={{ color: pastelTextMedium }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span className="font-semibold">Basic</span>
                      </div>
                    )}
                  </div>
                  <a
                    href="/my-purchases"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: pastelTextDark }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Mis Compras
                  </a>
                  {user.role === 'admin' && (
                    <a
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      style={{ color: pastelTextDark }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      Panel Admin
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/auth/logout', { method: 'POST' });
                        if (res.ok) {
                          window.location.href = '/';
                        }
                      } catch (e) {
                        console.error('Logout error:', e);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left"
                    style={{ color: pastelTextDark }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t" style={{ borderColor: pastelMint }} />
                  <a
                    href="/login"
                    className="mx-3 py-2.5 rounded-full font-medium text-sm text-center transition-all"
                    style={{
                      backgroundColor: pastelGreenMint,
                      color: pastelTextDark,
                      display: 'block',
                    }}
                  >
                    Acceder
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
