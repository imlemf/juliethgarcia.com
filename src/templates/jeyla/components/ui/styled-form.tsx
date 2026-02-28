import React, { forwardRef } from 'react';

// Default pastel colors (can be overridden via props)
const defaultColors = {
  pink: '#FFD6E8',
  peach: '#FFDAB9',
  mint: '#C7EAE4',
  greenMint: '#B8E6B8',
  textDark: '#5A4A42',
  textMedium: '#8B7D77',
};

export interface StyledFormColors {
  pink?: string;
  peach?: string;
  mint?: string;
  greenMint?: string;
  textDark?: string;
  textMedium?: string;
}

// ==================== STYLED INPUT ====================

export interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  colors?: StyledFormColors;
  icon?: React.ReactNode;
}

export const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ colors = {}, icon, className = '', style, ...props }, ref) => {
    const c = { ...defaultColors, ...colors };

    const inputStyles: React.CSSProperties = {
      width: '100%',
      height: '52px',
      padding: icon ? '0 16px 0 48px' : '0 16px',
      borderRadius: '16px',
      border: '2px solid transparent',
      backgroundColor: 'white',
      fontSize: '16px',
      color: c.textDark,
      outline: 'none',
      transition: 'all 0.2s ease',
      boxShadow: `0 2px 8px ${c.pink}30`,
      ...style,
    };

    const focusStyles = `
      .styled-input:focus {
        border-color: ${c.pink};
        box-shadow: 0 4px 12px ${c.pink}40;
      }
      .styled-input::placeholder {
        color: #A89B95;
      }
      .styled-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `;

    if (icon) {
      return (
        <div className="relative">
          <style>{focusStyles}</style>
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: c.textDark }}
          >
            {icon}
          </div>
          <input
            ref={ref}
            className={`styled-input ${className}`}
            style={inputStyles}
            {...props}
          />
        </div>
      );
    }

    return (
      <>
        <style>{focusStyles}</style>
        <input
          ref={ref}
          className={`styled-input ${className}`}
          style={inputStyles}
          {...props}
        />
      </>
    );
  }
);

StyledInput.displayName = 'StyledInput';

// ==================== STYLED BUTTON ====================

export interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  colors?: StyledFormColors;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  loadingText?: string;
}

export const StyledButton = forwardRef<HTMLButtonElement, StyledButtonProps>(
  ({
    colors = {},
    variant = 'primary',
    isLoading = false,
    loadingText,
    children,
    className = '',
    style,
    disabled,
    ...props
  }, ref) => {
    const c = { ...defaultColors, ...colors };

    const isPrimary = variant === 'primary';
    const isDisabled = disabled || isLoading;

    const buttonStyles: React.CSSProperties = {
      width: '100%',
      height: '56px',
      borderRadius: '16px',
      border: 'none',
      background: isPrimary
        ? `linear-gradient(135deg, ${c.pink} 0%, ${c.peach} 100%)`
        : `linear-gradient(135deg, ${c.mint} 0%, ${c.greenMint} 100%)`,
      color: c.textDark,
      fontSize: '16px',
      fontWeight: 600,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.6 : 1,
      transition: 'all 0.3s ease',
      boxShadow: isPrimary
        ? `0 4px 15px ${c.pink}50`
        : `0 4px 15px ${c.mint}50`,
      ...style,
    };

    return (
      <button
        ref={ref}
        className={className}
        style={buttonStyles}
        disabled={isDisabled}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {loadingText || 'Cargando...'}
            </>
          ) : (
            <>
              {children}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </span>
      </button>
    );
  }
);

StyledButton.displayName = 'StyledButton';

// ==================== STYLED ERROR ====================

export interface StyledErrorProps {
  message: string;
  className?: string;
}

export function StyledError({ message, className = '' }: StyledErrorProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl p-4 text-sm ${className}`}
      style={{
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        border: '1px solid #FECACA'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      {message}
    </div>
  );
}

// ==================== STYLED SUCCESS ====================

export interface StyledSuccessProps {
  message: string;
  colors?: StyledFormColors;
  className?: string;
}

export function StyledSuccess({ message, colors = {}, className = '' }: StyledSuccessProps) {
  const c = { ...defaultColors, ...colors };

  return (
    <div
      className={`flex items-center gap-2 rounded-xl p-4 text-sm ${className}`}
      style={{
        backgroundColor: `${c.mint}60`,
        color: '#166534',
        border: `1px solid ${c.mint}`
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {message}
    </div>
  );
}

// ==================== STYLED LABEL ====================

export interface StyledLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  colors?: StyledFormColors;
}

export const StyledLabel = forwardRef<HTMLLabelElement, StyledLabelProps>(
  ({ colors = {}, className = '', style, children, ...props }, ref) => {
    const c = { ...defaultColors, ...colors };

    return (
      <label
        ref={ref}
        className={`block text-sm font-medium mb-2 ${className}`}
        style={{ color: c.textDark, ...style }}
        {...props}
      >
        {children}
      </label>
    );
  }
);

StyledLabel.displayName = 'StyledLabel';

// ==================== ICONS ====================

export const FormIcons = {
  email: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  password: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17l6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  ),
};
