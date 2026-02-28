import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, locals }) => {
  const email = url.searchParams.get('email');
  if (!email) {
    return new Response(JSON.stringify({ error: 'email param required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = getDb(locals.runtime);

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return new Response(JSON.stringify({ error: 'user not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await db.delete(users).where(eq(users.email, email));

  return new Response(JSON.stringify({ ok: true, deleted: { id: user.id, email: user.email } }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
