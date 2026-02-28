import { eq, and } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { templateConfigs } from '@/db/schema';

export interface TemplateConfigRecord {
  id: string;
  templateId: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all configs for a specific template
 */
export async function getTemplateConfigs(
  db: DbClient,
  templateId: string
): Promise<TemplateConfigRecord[]> {
  return db
    .select()
    .from(templateConfigs)
    .where(eq(templateConfigs.templateId, templateId));
}

/**
 * Get template configs as a key-value object
 */
export async function getTemplateConfigObject(
  db: DbClient,
  templateId: string
): Promise<Record<string, string>> {
  const configs = await getTemplateConfigs(db, templateId);
  return Object.fromEntries(configs.map((c) => [c.key, c.value]));
}

/**
 * Get a single config value for a template
 */
export async function getTemplateConfigValue(
  db: DbClient,
  templateId: string,
  key: string
): Promise<string | null> {
  const [config] = await db
    .select()
    .from(templateConfigs)
    .where(
      and(
        eq(templateConfigs.templateId, templateId),
        eq(templateConfigs.key, key)
      )
    )
    .limit(1);
  return config?.value ?? null;
}

/**
 * Set a single config value for a template (upsert)
 */
export async function setTemplateConfigValue(
  db: DbClient,
  templateId: string,
  key: string,
  value: string
): Promise<TemplateConfigRecord> {
  // Try to update existing
  const [updated] = await db
    .update(templateConfigs)
    .set({ value, updatedAt: new Date() })
    .where(
      and(
        eq(templateConfigs.templateId, templateId),
        eq(templateConfigs.key, key)
      )
    )
    .returning();

  if (updated) {
    return updated;
  }

  // Insert if not exists
  const [inserted] = await db
    .insert(templateConfigs)
    .values({ templateId, key, value })
    .returning();

  return inserted;
}

/**
 * Set multiple config values for a template
 */
export async function setTemplateConfigs(
  db: DbClient,
  templateId: string,
  configs: Record<string, string>
): Promise<TemplateConfigRecord[]> {
  const results: TemplateConfigRecord[] = [];

  for (const [key, value] of Object.entries(configs)) {
    const result = await setTemplateConfigValue(db, templateId, key, value);
    results.push(result);
  }

  return results;
}

/**
 * Delete a config value for a template
 */
export async function deleteTemplateConfigValue(
  db: DbClient,
  templateId: string,
  key: string
): Promise<boolean> {
  await db
    .delete(templateConfigs)
    .where(
      and(
        eq(templateConfigs.templateId, templateId),
        eq(templateConfigs.key, key)
      )
    );
  return true;
}

/**
 * Delete all configs for a template
 */
export async function deleteTemplateConfigs(
  db: DbClient,
  templateId: string
): Promise<void> {
  await db
    .delete(templateConfigs)
    .where(eq(templateConfigs.templateId, templateId));
}
