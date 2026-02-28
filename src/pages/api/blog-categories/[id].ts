import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getBlogCategoryById, updateBlogCategory, deleteBlogCategory } from '@/lib/db/queries/blog-categories';
import { updateBlogCategorySchema } from '@/lib/validations/blog';

// GET /api/blog-categories/[id]
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    const category = await getBlogCategoryById(db, id);

    if (!category) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ category }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching blog category:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener categoría' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/blog-categories/[id] (admin only)
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    const user = locals.user;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validationResult = updateBlogCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Datos inválidos',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const db = getDb(locals.runtime);

    const existing = await getBlogCategoryById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const category = await updateBlogCategory(db, id, validationResult.data);

    return new Response(JSON.stringify({ category }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating blog category:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar categoría' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/blog-categories/[id] (admin only)
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    const user = locals.user;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);

    const existing = await getBlogCategoryById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteBlogCategory(db, id);

    return new Response(JSON.stringify({ message: 'Categoría eliminada' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting blog category:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar categoría' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
