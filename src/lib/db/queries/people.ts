import { eq, desc, and, asc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import {
  people,
  personCategories,
  personTitles,
  peopleSkills,
  skills,
} from '@/db/schema';
import type { PersonSkillInput } from '@/lib/validations/person';

// Types for full person with nested data
export type PersonWithDetails = Awaited<ReturnType<typeof getPersonWithDetails>>;
export type PersonListItem = Awaited<ReturnType<typeof getAllPeople>>[number];

// Get all people (list view)
export async function getAllPeople(db: DbClient, onlyPublished = true) {
  const conditions = onlyPublished ? [eq(people.isPublished, true)] : [];

  return db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      shortBio: people.shortBio,
      avatarUrl: people.avatarUrl,
      titleId: people.titleId,
      titleName: personTitles.name,
      categoryId: people.categoryId,
      categoryName: personCategories.name,
      categorySlug: personCategories.slug,
      order: people.order,
      isPublished: people.isPublished,
      publishedAt: people.publishedAt,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
    })
    .from(people)
    .leftJoin(personCategories, eq(people.categoryId, personCategories.id))
    .leftJoin(personTitles, eq(people.titleId, personTitles.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(people.order), desc(people.createdAt));
}

// Get people by category
export async function getPeopleByCategory(
  db: DbClient,
  categoryId: string,
  onlyPublished = true
) {
  const conditions = [eq(people.categoryId, categoryId)];
  if (onlyPublished) {
    conditions.push(eq(people.isPublished, true));
  }

  return db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      shortBio: people.shortBio,
      avatarUrl: people.avatarUrl,
      titleId: people.titleId,
      titleName: personTitles.name,
      categoryId: people.categoryId,
      categoryName: personCategories.name,
      categorySlug: personCategories.slug,
      order: people.order,
      isPublished: people.isPublished,
      publishedAt: people.publishedAt,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
    })
    .from(people)
    .leftJoin(personCategories, eq(people.categoryId, personCategories.id))
    .leftJoin(personTitles, eq(people.titleId, personTitles.id))
    .where(and(...conditions))
    .orderBy(asc(people.order), desc(people.createdAt));
}

// Get person by ID (basic info)
export async function getPersonById(db: DbClient, id: string) {
  const [person] = await db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      titleId: people.titleId,
      titleName: personTitles.name,
      shortBio: people.shortBio,
      bio: people.bio,
      avatarUrl: people.avatarUrl,
      avatarFileId: people.avatarFileId,
      categoryId: people.categoryId,
      categoryName: personCategories.name,
      categorySlug: personCategories.slug,
      email: people.email,
      emailIsPublic: people.emailIsPublic,
      phone: people.phone,
      phoneIsPublic: people.phoneIsPublic,
      whatsapp: people.whatsapp,
      whatsappIsPublic: people.whatsappIsPublic,
      website: people.website,
      instagram: people.instagram,
      order: people.order,
      isPublished: people.isPublished,
      publishedAt: people.publishedAt,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
    })
    .from(people)
    .leftJoin(personCategories, eq(people.categoryId, personCategories.id))
    .leftJoin(personTitles, eq(people.titleId, personTitles.id))
    .where(eq(people.id, id))
    .limit(1);
  return person || null;
}

// Get person by slug (basic info)
export async function getPersonBySlug(
  db: DbClient,
  slug: string,
  onlyPublished = true
) {
  const conditions = [eq(people.slug, slug)];
  if (onlyPublished) {
    conditions.push(eq(people.isPublished, true));
  }

  const [person] = await db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      titleId: people.titleId,
      titleName: personTitles.name,
      shortBio: people.shortBio,
      bio: people.bio,
      avatarUrl: people.avatarUrl,
      avatarFileId: people.avatarFileId,
      categoryId: people.categoryId,
      categoryName: personCategories.name,
      categorySlug: personCategories.slug,
      email: people.email,
      emailIsPublic: people.emailIsPublic,
      phone: people.phone,
      phoneIsPublic: people.phoneIsPublic,
      whatsapp: people.whatsapp,
      whatsappIsPublic: people.whatsappIsPublic,
      website: people.website,
      instagram: people.instagram,
      order: people.order,
      isPublished: people.isPublished,
      publishedAt: people.publishedAt,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
    })
    .from(people)
    .leftJoin(personCategories, eq(people.categoryId, personCategories.id))
    .leftJoin(personTitles, eq(people.titleId, personTitles.id))
    .where(and(...conditions))
    .limit(1);
  return person || null;
}

// Get full person with skills
export async function getPersonWithDetails(
  db: DbClient,
  id: string,
  onlyPublished = false
) {
  const person = await getPersonById(db, id);
  if (!person) return null;

  if (onlyPublished && !person.isPublished) return null;

  // Get skills
  const personSkillsData = await db
    .select({
      id: peopleSkills.id,
      skillId: peopleSkills.skillId,
      order: peopleSkills.order,
      skillName: skills.name,
      skillSlug: skills.slug,
      skillColor: skills.color,
    })
    .from(peopleSkills)
    .innerJoin(skills, eq(peopleSkills.skillId, skills.id))
    .where(eq(peopleSkills.personId, id))
    .orderBy(asc(peopleSkills.order));

  return {
    ...person,
    skills: personSkillsData,
  };
}

// Get full person by slug with skills
export async function getPersonWithDetailsBySlug(
  db: DbClient,
  slug: string,
  onlyPublished = true
) {
  const person = await getPersonBySlug(db, slug, onlyPublished);
  if (!person) return null;

  return getPersonWithDetails(db, person.id, onlyPublished);
}

// Get public person data (filters private contact info)
export async function getPublicPersonBySlug(db: DbClient, slug: string) {
  const person = await getPersonWithDetailsBySlug(db, slug, true);
  if (!person) return null;

  return {
    id: person.id,
    name: person.name,
    slug: person.slug,
    titleName: person.titleName,
    shortBio: person.shortBio,
    bio: person.bio,
    avatarUrl: person.avatarUrl,
    categoryName: person.categoryName,
    categorySlug: person.categorySlug,
    // Only include contact if public
    email: person.emailIsPublic ? person.email : null,
    phone: person.phoneIsPublic ? person.phone : null,
    whatsapp: person.whatsappIsPublic ? person.whatsapp : null,
    website: person.website,
    instagram: person.instagram,
    skills: person.skills,
  };
}

// Get all public people (for directory page)
export async function getAllPublicPeople(db: DbClient) {
  const peopleList = await getAllPeople(db, true);

  // Get skills for each person
  const peopleWithSkills = await Promise.all(
    peopleList.map(async (person) => {
      const personSkillsData = await db
        .select({
          skillId: peopleSkills.skillId,
          skillName: skills.name,
          skillSlug: skills.slug,
          skillColor: skills.color,
        })
        .from(peopleSkills)
        .innerJoin(skills, eq(peopleSkills.skillId, skills.id))
        .where(eq(peopleSkills.personId, person.id))
        .orderBy(asc(peopleSkills.order));

      return {
        ...person,
        skills: personSkillsData,
      };
    })
  );

  return peopleWithSkills;
}

// Create person with skills
export async function createPerson(
  db: DbClient,
  data: {
    name: string;
    slug: string;
    titleId?: string | null;
    shortBio?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    avatarFileId?: string | null;
    categoryId?: string | null;
    email?: string | null;
    emailIsPublic?: boolean;
    phone?: string | null;
    phoneIsPublic?: boolean;
    whatsapp?: string | null;
    whatsappIsPublic?: boolean;
    website?: string | null;
    instagram?: string | null;
    order?: number;
    isPublished?: boolean;
    skills?: PersonSkillInput[];
  }
) {
  const { skills: skillsData, ...personData } = data;
  const publishedAt = data.isPublished ? new Date() : null;

  // Insert person
  const [person] = await db
    .insert(people)
    .values({ ...personData, publishedAt })
    .returning();

  // Insert skills assignments
  if (skillsData && skillsData.length > 0) {
    for (let i = 0; i < skillsData.length; i++) {
      const skill = skillsData[i];
      await db.insert(peopleSkills).values({
        personId: person.id,
        skillId: skill.skillId,
        order: skill.order ?? i,
      });
    }
  }

  return getPersonWithDetails(db, person.id);
}

// Update person with skills
export async function updatePerson(
  db: DbClient,
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    titleId: string | null;
    shortBio: string | null;
    bio: string | null;
    avatarUrl: string | null;
    avatarFileId: string | null;
    categoryId: string | null;
    email: string | null;
    emailIsPublic: boolean;
    phone: string | null;
    phoneIsPublic: boolean;
    whatsapp: string | null;
    whatsappIsPublic: boolean;
    website: string | null;
    instagram: string | null;
    order: number;
    isPublished: boolean;
    skills: PersonSkillInput[];
  }>
) {
  const { skills: skillsData, ...personData } = data;

  // Get current person for publishedAt logic
  const currentPerson = await getPersonById(db, id);
  if (!currentPerson) return null;

  let publishedAt = currentPerson.publishedAt;
  if (data.isPublished !== undefined) {
    if (data.isPublished && !currentPerson.isPublished) {
      publishedAt = new Date();
    }
  }

  // Update person
  await db
    .update(people)
    .set({ ...personData, publishedAt, updatedAt: new Date() })
    .where(eq(people.id, id));

  // If skills provided, replace all
  if (skillsData !== undefined) {
    // Delete existing
    await db.delete(peopleSkills).where(eq(peopleSkills.personId, id));

    // Insert new
    for (let i = 0; i < skillsData.length; i++) {
      const skill = skillsData[i];
      await db.insert(peopleSkills).values({
        personId: id,
        skillId: skill.skillId,
        order: skill.order ?? i,
      });
    }
  }

  return getPersonWithDetails(db, id);
}

// Delete person (cascades to skills)
export async function deletePerson(db: DbClient, id: string) {
  await db.delete(people).where(eq(people.id, id));
}

// Toggle person published status
export async function togglePersonPublished(db: DbClient, id: string) {
  const person = await getPersonById(db, id);
  if (!person) return null;

  const newPublished = !person.isPublished;
  const publishedAt = newPublished && !person.publishedAt ? new Date() : person.publishedAt;

  const [updated] = await db
    .update(people)
    .set({
      isPublished: newPublished,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(people.id, id))
    .returning();

  return updated;
}
