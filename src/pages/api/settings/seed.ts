import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { seedSettings } from '@/lib/settings/seed';

// POST /api/settings/seed - Seed default settings (admin only)
export const POST: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    const inserted = await seedSettings(db);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${inserted} settings inicializados`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error seeding settings:', error);
    const message = error instanceof Error ? error.message : 'Error al inicializar configuración';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
