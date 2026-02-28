import { createAuth } from './auth';
import { getDb } from '@/lib/db';
import { validateTurnstile } from './turnstile';
import { users, purchases } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extendUserPremium } from '@/lib/db/queries/users';
import { getSetting } from '@/lib/settings';

// Login with Turnstile validation
export async function loginWithTurnstile(
  email: string,
  password: string,
  turnstileToken: string,
  runtime: { env: { DB: D1Database } }
) {
  // Validate Turnstile
  const turnstileValid = await validateTurnstile(turnstileToken);
  if (!turnstileValid.success) {
    throw new Error(turnstileValid.error || 'Bot detection failed');
  }

  const auth = createAuth(runtime);

  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse: true,
  });

  if (!result.ok) {
    const data = await result.json().catch(() => ({}));
    throw new Error(data?.message || 'Invalid email or password');
  }

  const data = await result.json();
  return { user: data.user, session: data.session, headers: result.headers };
}

// Register with purchase code
export async function registerWithPurchaseCode(
  email: string,
  purchaseCode: string,
  password: string,
  turnstileToken: string,
  runtime: { env: { DB: D1Database } }
) {
  // Validate Turnstile
  const turnstileValid = await validateTurnstile(turnstileToken);
  if (!turnstileValid.success) {
    throw new Error(turnstileValid.error || 'Bot detection failed');
  }

  const auth = createAuth(runtime);
  const db = getDb(runtime);

  // Find purchase by code
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.purchaseCode, purchaseCode))
    .limit(1);

  if (!purchase) {
    throw new Error('Invalid purchase code');
  }

  // Only completed purchases can be used for registration
  if (purchase.status !== 'completed') {
    throw new Error('This purchase has not been completed');
  }

  // Validate email matches
  if (purchase.email !== email) {
    throw new Error('Email does not match purchase record');
  }

  // Check if already used
  if (purchase.usedForRegistration) {
    throw new Error('This purchase code has already been used');
  }

  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // Create user via Better Auth
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: email.split('@')[0],
    },
    asResponse: true,
  });

  if (!result.ok) {
    const errData = await result.json().catch(() => ({}));
    throw new Error(errData?.message || 'Failed to create user');
  }

  const data = await result.json();

  if (!data.user) {
    throw new Error('Failed to create user');
  }

  // Mark purchase code as used
  await db
    .update(purchases)
    .set({
      usedForRegistration: true,
      registrationUsedAt: new Date(),
      userId: data.user.id,
    })
    .where(eq(purchases.id, purchase.id));

  // Grant premium subscription if purchase was completed
  if (purchase.status === 'completed') {
    try {
      const subscriptionMonths = await getSetting(runtime, 'commerce.subscriptionDurationMonths');
      await extendUserPremium(db, data.user.id, subscriptionMonths);
      console.log(`Premium granted to new user ${email} for ${subscriptionMonths} months`);
    } catch (premiumError) {
      // Log error but don't fail registration
      console.error('Failed to grant premium on registration:', premiumError);
    }
  }

  return { user: data.user, session: data.session, headers: result.headers };
}
