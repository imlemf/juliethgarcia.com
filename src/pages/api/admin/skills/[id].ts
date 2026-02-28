import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getSkillById,
  getSkillBySlug,
  updateSkill,
  deleteSkill,
  toggleSkillActive,
} from '@/lib/db/queries/skills';
import { updateSkillSchema } from '@/lib/validations/person';

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  const db = getDb(locals.runtime);
  const skill = await getSkillById(db, id);

  if (!skill) {
    return new Response(JSON.stringify({ error: 'Skill no encontrado' }), { status: 404 });
  }

  return new Response(JSON.stringify({ skill }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const body = await request.json();

    // Handle toggle active shortcut
    if (body.toggleActive === true) {
      const db = getDb(locals.runtime);
      const skill = await toggleSkillActive(db, id);
      if (!skill) {
        return new Response(JSON.stringify({ error: 'Skill no encontrado' }), { status: 404 });
      }
      return new Response(JSON.stringify({ skill }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = updateSkillSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb(locals.runtime);

    // Check if skill exists
    const existing = await getSkillById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Skill no encontrado' }), { status: 404 });
    }

    // Check if slug is taken by another skill
    if (result.data.slug) {
      const slugTaken = await getSkillBySlug(db, result.data.slug);
      if (slugTaken && slugTaken.id !== id) {
        return new Response(
          JSON.stringify({ error: 'El slug ya está en uso' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const skill = await updateSkill(db, id, result.data);

    return new Response(JSON.stringify({ skill }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar skill' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const db = getDb(locals.runtime);

    const existing = await getSkillById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Skill no encontrado' }), { status: 404 });
    }

    await deleteSkill(db, id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar skill' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
