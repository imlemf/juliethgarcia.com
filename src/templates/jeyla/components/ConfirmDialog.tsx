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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'warning' | 'danger';
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

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'default',
  colors = defaultColors,
}: ConfirmDialogProps) {
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

  const getIconAndColor = () => {
    switch (variant) {
      case 'warning':
        return {
          color: c.peach,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          ),
        };
      case 'danger':
        return {
          color: c.pink,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        };
      default:
        return {
          color: c.lavender,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        };
    }
  };

  const { color: iconBgColor, icon } = getIconAndColor();

  const handleConfirm = () => {
    onConfirm();
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
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(90, 74, 66, 0.4)', backdropFilter: 'blur(4px)' }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#FFF8F5',
          boxShadow: `0 25px 50px -12px ${c.pink}40`,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-40 blur-2xl"
          style={{ backgroundColor: iconBgColor }}
        />
        <div
          className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-30 blur-xl"
          style={{ backgroundColor: c.mint }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: iconBgColor }}
            >
              {icon}
            </div>
          </div>

          {/* Title */}
          <h2
            id="dialog-title"
            className="text-xl font-bold text-center mb-2"
            style={{ color: c.textDark }}
          >
            {title}
          </h2>

          {/* Description */}
          <p
            id="dialog-description"
            className="text-center mb-6 leading-relaxed"
            style={{ color: c.textMedium }}
          >
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: `${c.lavender}60`,
                color: c.textDark,
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: variant === 'danger' ? c.pink : c.greenMint,
                color: c.textDark,
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
