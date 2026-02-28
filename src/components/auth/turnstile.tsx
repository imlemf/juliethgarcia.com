import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
  size?: 'normal' | 'compact' | 'flexible';
  theme?: 'light' | 'dark' | 'auto';
}

export interface TurnstileRef {
  reset: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact' | 'flexible';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  function Turnstile({ onVerify, onError, onExpire, className, size = 'normal', theme = 'auto' }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const isRenderedRef = useRef(false);

    // Store callbacks in refs to avoid re-rendering
    const onVerifyRef = useRef(onVerify);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    // Update refs when callbacks change
    useEffect(() => {
      onVerifyRef.current = onVerify;
      onErrorRef.current = onError;
      onExpireRef.current = onExpire;
    }, [onVerify, onError, onExpire]);

    // Expose reset method to parent
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

  useEffect(() => {
    // Check if turnstile is already available
    if (window.turnstile) {
      setIsLoaded(true);
      return;
    }

    // Check if script already exists but not yet loaded
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');

    if (existingScript) {
      // Wait for the script to actually load
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          setIsLoaded(true);
        }
      }, 50);

      return () => {
        clearInterval(checkTurnstile);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
          isRenderedRef.current = false;
        }
      };
    }

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid reload issues
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        isRenderedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile || isRenderedRef.current) return;

    const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error('Turnstile site key is not configured');
      return;
    }

    // Mark as rendered before rendering to prevent double render
    isRenderedRef.current = true;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerifyRef.current(token),
      'error-callback': () => onErrorRef.current?.(),
      'expired-callback': () => onExpireRef.current?.(),
      theme,
      size,
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        isRenderedRef.current = false;
      }
    };
  }, [isLoaded]);

    return <div ref={containerRef} className={className} />;
  }
);
