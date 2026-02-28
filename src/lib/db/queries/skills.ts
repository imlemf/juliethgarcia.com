import { eq, asc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { skills } from '@/db/schema';

export type Skill = typeof skills.$inferSelect;

// Get all skills
export async function getAllSkills(db: DbClient, onlyActive = true) {
  if (onlyActive) {
    return db
      .select()
      .from(skills)
      .where(eq(skills.isActive, true))
      .orderBy(asc(skills.order));
  }

  return db
    .select()
    .from(skills)
    .orderBy(asc(skills.order));
}

// Get skill by ID
export async function getSkillById(db: DbClient, id: string) {
  const [skill] = await db
    .select()
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);
  return skill || null;
}

// Get skill by slug
export async function getSkillBySlug(db: DbClient, slug: string) {
  const [skill] = await db
    .select()
    .from(skills)
    .where(eq(skills.slug, slug))
    .limit(1);
  return skill || null;
}

// Create skill
export async function createSkill(
  db: DbClient,
  data: {
    name: string;
    slug: string;
    description?: string | null;
    color?: string | null;
    order?: number;
    isActive?: boolean;
  }
) {
  const [skill] = await db
    .insert(skills)
    .values(data)
    .returning();
  return skill;
}

// Update skill
export async function updateSkill(
  db: DbClient,
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    order: number;
    isActive: boolean;
  }>
) {
  const [skill] = await db
    .update(skills)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(skills.id, id))
    .returning();
  return skill || null;
}

// Delete skill
export async function deleteSkill(db: DbClient, id: string) {
  await db.delete(skills).where(eq(skills.id, id));
}

// Toggle skill active status
export async function toggleSkillActive(db: DbClient, id: string) {
  const skill = await getSkillById(db, id);
  if (!skill) return null;

  const [updated] = await db
    .update(skills)
    .set({ isActive: !skill.isActive, updatedAt: new Date() })
    .where(eq(skills.id, id))
    .returning();
  return updated;
}
