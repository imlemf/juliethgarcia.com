import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getAllSkills,
  createSkill,
  getSkillBySlug,
} from '@/lib/db/queries/skills';
import { createSkillSchema } from '@/lib/validations/person';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const showInactive = url.searchParams.get('showInactive') === 'true';
  const db = getDb(locals.runtime);

  const skills = await getAllSkills(db, !showInactive);

  return new Response(JSON.stringify({ skills }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const result = createSkillSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb(locals.runtime);

    // Check if slug already exists
    const existing = await getSkillBySlug(db, result.data.slug);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'El slug ya está en uso' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const skill = await createSkill(db, result.data);

    return new Response(JSON.stringify({ skill }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear skill' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
