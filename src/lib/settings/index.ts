import { getDb } from '@/lib/db';
import {
  getSettingsObject,
  getSettingValue,
  getPublicSettings,
} from '@/lib/db/queries/settings';
import {
  SETTINGS_DEFINITIONS,
  getDefinitionByKey,
  getDefinitionsByGroup,
  getPublicDefinitions,
  getDefaultValues,
  getAllGroups,
  GROUP_LABELS,
  type SettingDefinition,
  type SettingGroup,
  type SettingType,
  type SettingOption,
} from './definitions';

// Re-export types and definitions
export {
  SETTINGS_DEFINITIONS,
  getDefinitionByKey,
  getDefinitionsByGroup,
  getPublicDefinitions,
  getDefaultValues,
  getAllGroups,
  GROUP_LABELS,
  type SettingDefinition,
  type SettingGroup,
  type SettingType,
  type SettingOption,
};

// Type for runtime environment
type Runtime = { env: { DB: D1Database } };

// Type for all settings values
export type SiteSettings = {
  'site.name': string;
  'site.description': string;
  'site.contactEmail': string;
  'site.maintenanceMode': boolean;
  'date.timezone': string;
  'date.format': string;
  'date.timeFormat': '12h' | '24h';
  'date.locale': string;
  'seo.titleSuffix': string;
  'seo.defaultDescription': string;
  'commerce.defaultCurrency': string;
  'commerce.downloadLinkExpiryHours': number;
  'commerce.subscriptionDurationMonths': number;
};

// Default settings (used as fallback)
export const DEFAULT_SETTINGS: SiteSettings = {
  'site.name': 'My Site',
  'site.description': '',
  'site.contactEmail': '',
  'site.maintenanceMode': false,
  'date.timezone': 'America/Bogota',
  'date.format': 'dd/MM/yyyy',
  'date.timeFormat': '24h',
  'date.locale': 'es-CO',
  'seo.titleSuffix': ' - My Site',
  'seo.defaultDescription': '',
  'commerce.defaultCurrency': 'COP',
  'commerce.downloadLinkExpiryHours': 48,
  'commerce.subscriptionDurationMonths': 3,
};

/**
 * Get all settings for the application
 * Use this at request-time to fetch current settings
 */
export async function getSettings(runtime: Runtime): Promise<SiteSettings> {
  try {
    const db = getDb(runtime);
    const settings = await getSettingsObject(db);
    return { ...DEFAULT_SETTINGS, ...settings } as SiteSettings;
  } catch (error) {
    console.error('Error fetching settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Get a single setting value
 */
export async function getSetting<K extends keyof SiteSettings>(
  runtime: Runtime,
  key: K
): Promise<SiteSettings[K]> {
  try {
    const db = getDb(runtime);
    const value = await getSettingValue(db, key);
    return (value ?? DEFAULT_SETTINGS[key]) as SiteSettings[K];
  } catch (error) {
    console.error(`Error fetching setting ${key}, using default:`, error);
    return DEFAULT_SETTINGS[key];
  }
}

/**
 * Get only public settings (for client-side use)
 */
export async function getPublicSiteSettings(runtime: Runtime): Promise<Partial<SiteSettings>> {
  try {
    const db = getDb(runtime);
    return await getPublicSettings(db);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    // Return public defaults
    const publicDefs = getPublicDefinitions();
    const result: Partial<SiteSettings> = {};
    for (const def of publicDefs) {
      (result as Record<string, unknown>)[def.key] = def.defaultValue;
    }
    return result;
  }
}
