import { eq } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { users } from '@/db/schema';

/**
 * Check if a user has an active premium subscription
 */
export function isPremiumUser(user: { premiumUntil?: Date | null } | null | undefined): boolean {
  if (!user?.premiumUntil) return false;
  return new Date(user.premiumUntil) > new Date();
}

/**
 * Get a user by their email address
 */
export async function getUserByEmail(db: DbClient, email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
}

/**
 * Get a user by their ID
 */
export async function getUserById(db: DbClient, id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

/**
 * Extend a user's premium subscription by a number of months
 * If the user has no premium or it's expired, start from now
 * If the user has active premium, extend from current expiration date
 */
export async function extendUserPremium(
  db: DbClient,
  userId: string,
  months: number
): Promise<Date | null> {
  const user = await getUserById(db, userId);
  if (!user) return null;

  const now = new Date();
  let startDate: Date;

  // If user has active premium, extend from their current expiration
  // Otherwise, start from now
  if (user.premiumUntil && new Date(user.premiumUntil) > now) {
    startDate = new Date(user.premiumUntil);
  } else {
    startDate = now;
  }

  // Add months to the start date
  const newPremiumUntil = new Date(startDate);
  newPremiumUntil.setMonth(newPremiumUntil.getMonth() + months);

  await db
    .update(users)
    .set({
      premiumUntil: newPremiumUntil,
      updatedAt: now
    })
    .where(eq(users.id, userId));

  return newPremiumUntil;
}

/**
 * Extend a user's premium subscription by email
 * Returns the new expiration date, or null if user not found
 */
export async function extendUserPremiumByEmail(
  db: DbClient,
  email: string,
  months: number
): Promise<Date | null> {
  const user = await getUserByEmail(db, email);
  if (!user) return null;

  return extendUserPremium(db, user.id, months);
}

/**
 * Set a user's premium expiration to a specific date
 */
export async function setUserPremiumUntil(
  db: DbClient,
  userId: string,
  premiumUntil: Date | null
): Promise<void> {
  await db
    .update(users)
    .set({
      premiumUntil,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}
