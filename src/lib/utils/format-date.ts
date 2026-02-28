import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SiteSettings } from '@/lib/settings';

// Locale mapping
const locales: Record<string, Locale> = {
  'es-CO': es,
};

type DateSettings = Pick<SiteSettings, 'date.format' | 'date.locale'>;
type DateTimeSettings = Pick<SiteSettings, 'date.format' | 'date.locale' | 'date.timeFormat'>;

/**
 * Format a date according to site settings
 */
export function formatDate(
  date: Date | string | number,
  settings: DateSettings
): string {
  const d = new Date(date);
  const locale = locales[settings['date.locale']] || es;
  const pattern = settings['date.format'];

  return format(d, pattern, { locale });
}

/**
 * Format a date with time according to site settings
 */
export function formatDateTime(
  date: Date | string | number,
  settings: DateTimeSettings
): string {
  const d = new Date(date);
  const locale = locales[settings['date.locale']] || es;
  const timePattern = settings['date.timeFormat'] === '12h' ? 'h:mm a' : 'HH:mm';
  const pattern = `${settings['date.format']} ${timePattern}`;

  return format(d, pattern, { locale });
}

/**
 * Format relative time (e.g., "hace 2 horas")
 */
export function formatRelativeDate(
  date: Date | string | number,
  settings: Pick<SiteSettings, 'date.locale'>
): string {
  const d = new Date(date);
  const locale = locales[settings['date.locale']] || es;

  return formatDistance(d, new Date(), { addSuffix: true, locale });
}

/**
 * Create a formatter instance with pre-loaded settings
 * Useful for React components that need to format multiple dates
 */
export function createDateFormatter(settings: DateTimeSettings) {
  return {
    date: (date: Date | string | number) => formatDate(date, settings),
    dateTime: (date: Date | string | number) => formatDateTime(date, settings),
    relative: (date: Date | string | number) => formatRelativeDate(date, settings),
  };
}

/**
 * Format date for display in tables (short format)
 * Fallback function that doesn't require settings (uses defaults)
 */
export function formatDateShort(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMM yyyy', { locale: es });
  } catch {
    return '-';
  }
}

/**
 * Format date and time for display (using defaults)
 */
export function formatDateTimeDefault(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: es });
  } catch {
    return '-';
  }
}
