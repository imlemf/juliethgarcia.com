import type { DbClient } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import { SETTINGS_DEFINITIONS } from './definitions';

/**
 * Seed the database with default settings
 * Uses INSERT ... ON CONFLICT DO NOTHING to avoid duplicates
 */
export async function seedSettings(db: DbClient): Promise<number> {
  let inserted = 0;

  for (const definition of SETTINGS_DEFINITIONS) {
    const type =
      typeof definition.defaultValue === 'boolean'
        ? 'boolean'
        : typeof definition.defaultValue === 'number'
          ? 'number'
          : 'string';

    try {
      await db
        .insert(siteSettings)
        .values({
          key: definition.key,
          value: String(definition.defaultValue),
          type,
        })
        .onConflictDoNothing();
      inserted++;
    } catch (error) {
      // Setting already exists, skip
      console.log(`Setting ${definition.key} already exists, skipping`);
    }
  }

  return inserted;
}

/**
 * Reset all settings to their default values
 * WARNING: This will overwrite all custom settings
 */
export async function resetSettings(db: DbClient): Promise<number> {
  let updated = 0;

  for (const definition of SETTINGS_DEFINITIONS) {
    const type =
      typeof definition.defaultValue === 'boolean'
        ? 'boolean'
        : typeof definition.defaultValue === 'number'
          ? 'number'
          : 'string';

    await db
      .insert(siteSettings)
      .values({
        key: definition.key,
        value: String(definition.defaultValue),
        type,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: String(definition.defaultValue),
          type,
          updatedAt: new Date(),
        },
      });
    updated++;
  }

  return updated;
}
