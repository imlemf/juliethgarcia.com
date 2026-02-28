import { eq } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import {
  SETTINGS_DEFINITIONS,
  getDefinitionByKey,
  getPublicDefinitions,
  type SettingDefinition,
} from '@/lib/settings/definitions';

type SettingValue = string | number | boolean;

export interface SettingRecord {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingWithMeta extends SettingRecord {
  definition: SettingDefinition | undefined;
  parsedValue: SettingValue;
}

/**
 * Get all settings from database
 */
export async function getAllSettings(db: DbClient): Promise<SettingRecord[]> {
  return db.select().from(siteSettings);
}

/**
 * Get all settings with their definitions and parsed values
 */
export async function getAllSettingsWithMeta(db: DbClient): Promise<SettingWithMeta[]> {
  const settings = await getAllSettings(db);

  return settings.map((setting) => ({
    ...setting,
    definition: getDefinitionByKey(setting.key),
    parsedValue: parseSettingValue(setting.value, setting.type),
  }));
}

/**
 * Get a single setting by key
 */
export async function getSetting(db: DbClient, key: string): Promise<SettingRecord | null> {
  const [setting] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  return setting || null;
}

/**
 * Get a setting value, parsed to its correct type
 * Returns the default value from definitions if not found in database
 */
export async function getSettingValue<T extends SettingValue>(
  db: DbClient,
  key: string
): Promise<T> {
  const definition = getDefinitionByKey(key);
  const defaultValue = definition?.defaultValue as T;

  const setting = await getSetting(db, key);
  if (!setting) {
    return defaultValue;
  }

  return parseSettingValue(setting.value, setting.type) as T;
}

/**
 * Get all settings as a key-value object
 */
export async function getSettingsObject(db: DbClient): Promise<Record<string, SettingValue>> {
  const settings = await getAllSettings(db);
  const result: Record<string, SettingValue> = {};

  // Start with defaults
  for (const def of SETTINGS_DEFINITIONS) {
    result[def.key] = def.defaultValue;
  }

  // Override with database values
  for (const setting of settings) {
    result[setting.key] = parseSettingValue(setting.value, setting.type);
  }

  return result;
}

/**
 * Get only public settings (for unauthenticated API)
 */
export async function getPublicSettings(db: DbClient): Promise<Record<string, SettingValue>> {
  const allSettings = await getSettingsObject(db);
  const publicDefs = getPublicDefinitions();
  const result: Record<string, SettingValue> = {};

  for (const def of publicDefs) {
    if (allSettings[def.key] !== undefined) {
      result[def.key] = allSettings[def.key];
    }
  }

  return result;
}

/**
 * Update a single setting
 */
export async function updateSetting(
  db: DbClient,
  key: string,
  value: SettingValue
): Promise<SettingRecord | null> {
  const definition = getDefinitionByKey(key);
  if (!definition) {
    throw new Error(`Setting "${key}" is not defined`);
  }

  const stringValue = String(value);
  const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';

  // Try to update existing
  const [updated] = await db
    .update(siteSettings)
    .set({ value: stringValue, type, updatedAt: new Date() })
    .where(eq(siteSettings.key, key))
    .returning();

  if (updated) {
    return updated;
  }

  // Insert if not exists
  const [inserted] = await db
    .insert(siteSettings)
    .values({ key, value: stringValue, type })
    .returning();

  return inserted;
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  db: DbClient,
  settings: Record<string, SettingValue>
): Promise<SettingRecord[]> {
  const results: SettingRecord[] = [];

  for (const [key, value] of Object.entries(settings)) {
    const result = await updateSetting(db, key, value);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Parse a stored string value to its correct type
 */
function parseSettingValue(value: string, type: string): SettingValue {
  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return Number(value);
    default:
      return value;
  }
}
