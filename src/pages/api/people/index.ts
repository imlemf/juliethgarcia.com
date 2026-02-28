import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getAllPublicPeople } from '@/lib/db/queries/people';
import { getAllPersonCategories } from '@/lib/db/queries/person-categories';
import { getAllSkills } from '@/lib/db/queries/skills';

// GET /api/people - List all published people with filters
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const categorySlug = url.searchParams.get('category');
    const skillSlug = url.searchParams.get('skill');

    const db = getDb(locals.runtime);

    // Get all public people
    let people = await getAllPublicPeople(db);

    // Filter by category if provided
    if (categorySlug) {
      people = people.filter((p) => p.categorySlug === categorySlug);
    }

    // Filter by skill if provided
    if (skillSlug) {
      people = people.filter((p) =>
        p.skills.some((s) => s.skillSlug === skillSlug)
      );
    }

    // Get categories and skills for filters (only active ones)
    const categories = await getAllPersonCategories(db, true);
    const skills = await getAllSkills(db, true);

    return new Response(
      JSON.stringify({
        people,
        filters: {
          categories: categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          })),
          skills: skills.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            color: s.color,
          })),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching people:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener personas' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
