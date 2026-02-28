import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getAllSettingsWithMeta,
  updateSettings,
} from '@/lib/db/queries/settings';
import { validateSettings } from '@/lib/settings/validation';
import {
  SETTINGS_DEFINITIONS,
  getDefinitionsByGroup,
  getAllGroups,
  GROUP_LABELS,
} from '@/lib/settings/definitions';
import { seedSettings } from '@/lib/settings/seed';

// GET /api/settings - Get all settings with metadata (admin only)
export const GET: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    let settings = await getAllSettingsWithMeta(db);

    // Auto-seed if no settings exist
    if (settings.length === 0) {
      await seedSettings(db);
      settings = await getAllSettingsWithMeta(db);
    }

    // Build response with definitions grouped
    const groups = getAllGroups().map((group) => ({
      key: group,
      label: GROUP_LABELS[group].label,
      description: GROUP_LABELS[group].description,
      definitions: getDefinitionsByGroup(group),
    }));

    // Create a map of current values
    const values: Record<string, string | number | boolean> = {};
    for (const setting of settings) {
      values[setting.key] = setting.parsedValue;
    }

    // Fill in defaults for missing settings
    for (const def of SETTINGS_DEFINITIONS) {
      if (values[def.key] === undefined) {
        values[def.key] = def.defaultValue;
      }
    }

    return new Response(
      JSON.stringify({
        groups,
        values,
        definitions: SETTINGS_DEFINITIONS,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener configuración' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/settings - Update settings (admin only)
export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validationResult = validateSettings(body);

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
    const updated = await updateSettings(db, validationResult.data);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updated.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar configuración';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
