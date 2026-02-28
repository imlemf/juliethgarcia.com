import { useEffect, useRef } from 'react';

interface RecipeColors {
  pink: string;
  peach: string;
  mint: string;
  lavender: string;
  greenMint: string;
  textDark: string;
  textMedium: string;
}

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutUrl?: string;
  colors?: RecipeColors;
}

const defaultColors: RecipeColors = {
  pink: '#FFD6E8',
  peach: '#FFDAB9',
  mint: '#C7EAE4',
  lavender: '#E6E6FA',
  greenMint: '#B8E6B8',
  textDark: '#5A4A42',
  textMedium: '#8B7D77',
};

export function PremiumDialog({
  open,
  onOpenChange,
  checkoutUrl,
  colors = defaultColors,
}: PremiumDialogProps) {
  const c = { ...defaultColors, ...colors };
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleBuy = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
    onOpenChange(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-dialog-title"
      aria-describedby="premium-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity cursor-pointer"
        style={{ backgroundColor: 'rgba(90, 74, 66, 0.5)', backdropFilter: 'blur(8px)' }}
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#FFF8F5',
          boxShadow: `0 25px 50px -12px ${c.pink}50`,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-50 blur-2xl"
          style={{ backgroundColor: c.peach }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-40 blur-xl"
          style={{ backgroundColor: c.pink }}
        />

        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: c.peach }}
            >
              <svg className="w-8 h-8" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            id="premium-dialog-title"
            className="text-xl font-bold mb-2"
            style={{ color: c.textDark }}
          >
            Función Premium
          </h2>

          {/* Description */}
          <p
            id="premium-dialog-description"
            className="mb-6 leading-relaxed"
            style={{ color: c.textMedium }}
          >
            Esta función está disponible para usuarios premium.
            ¡Obtén acceso completo comprando el libro de recetas!
          </p>

          {/* Features list */}
          <div
            className="rounded-xl p-4 mb-6 text-left"
            style={{ backgroundColor: `${c.lavender}30` }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: c.textDark }}>
              Con Premium obtienes:
            </p>
            <ul className="space-y-2">
              {[
                'Ajustar porciones de recetas',
                'Modo de preparación paso a paso',
                'Temporizadores inteligentes',
                'Guardar tu progreso',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm" style={{ color: c.textMedium }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={c.greenMint} viewBox="0 0 24 24" strokeWidth={2}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {checkoutUrl && (
              <button
                type="button"
                onClick={handleBuy}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: c.greenMint,
                  color: c.textDark,
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Obtener acceso premium
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: `${c.lavender}50`,
                color: c.textMedium,
              }}
            >
              Quizás después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
