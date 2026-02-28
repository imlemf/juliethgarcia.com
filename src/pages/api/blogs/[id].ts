import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getBlogById, updateBlog, deleteBlog } from '@/lib/db/queries/blogs';
import { updateBlogSchema } from '@/lib/validations/blog';

// GET /api/blogs/[id]
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
    const blog = await getBlogById(db, id);

    if (!blog) {
      return new Response(JSON.stringify({ error: 'Blog no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only admins can see unpublished blogs via API
    const user = locals.user;
    if (!blog.isPublished && user?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Blog no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ blog }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener blog' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/blogs/[id] (admin only)
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
    const validationResult = updateBlogSchema.safeParse(body);

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

    const existing = await getBlogById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Blog no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const blog = await updateBlog(db, id, validationResult.data);

    return new Response(JSON.stringify({ blog }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar blog' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/blogs/[id] (admin only)
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

    const existing = await getBlogById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Blog no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteBlog(db, id);

    return new Response(JSON.stringify({ message: 'Blog eliminado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar blog' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
