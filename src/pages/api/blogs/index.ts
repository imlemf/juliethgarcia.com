import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getAllBlogs, createBlog } from '@/lib/db/queries/blogs';
import { createBlogSchema } from '@/lib/validations/blog';

// GET /api/blogs - List blogs (public: only published, admin: all)
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const showDrafts = url.searchParams.get('showDrafts') === 'true';

    const user = locals.user;
    const isAdmin = user?.role === 'admin';

    // Only admins can see drafts
    const onlyPublished = !showDrafts || !isAdmin;

    const db = getDb(locals.runtime);
    const blogs = await getAllBlogs(db, onlyPublished);

    return new Response(JSON.stringify({ blogs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener blogs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/blogs - Create blog (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validationResult = createBlogSchema.safeParse(body);

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

    // Handle empty coverImage
    const data = {
      ...validationResult.data,
      coverImage: validationResult.data.coverImage || undefined,
      categoryId: validationResult.data.categoryId || undefined,
    };

    const blog = await createBlog(db, data);

    return new Response(JSON.stringify({ blog }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return new Response(JSON.stringify({ error: 'Error al crear blog' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
