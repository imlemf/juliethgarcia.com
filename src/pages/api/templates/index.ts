import type { APIRoute } from 'astro';
import { getAllTemplates } from '@/templates';

/**
 * GET /api/templates
 * Returns list of all available templates with their metadata
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const templates = getAllTemplates().map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      author: template.author,
      thumbnail: template.thumbnail,
      supportsDarkMode: template.supportsDarkMode,
      optionGroups: template.optionGroups,
    }));

    return new Response(JSON.stringify({ templates }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch templates' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
