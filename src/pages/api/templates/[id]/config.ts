import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getTemplate, templateExists } from '@/templates';
import {
  getTemplateConfigObject,
  setTemplateConfigs,
} from '@/lib/db/queries/template-configs';
import { getAllTemplateOptions, getTemplateDefaults } from '@/templates/context';

/**
 * GET /api/templates/[id]/config
 * Returns the configuration for a specific template
 */
export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params;

  if (!id || !templateExists(id)) {
    return new Response(JSON.stringify({ error: 'Template not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(locals.runtime);
    const template = getTemplate(id)!;

    // Get stored config from database
    const storedConfig = await getTemplateConfigObject(db, id);

    // Merge with defaults
    const defaults = getTemplateDefaults(template);
    const config = { ...defaults };

    // Apply stored values
    for (const [key, value] of Object.entries(storedConfig)) {
      const option = getAllTemplateOptions(template).find((o) => o.key === key);
      if (option) {
        // Parse value based on type
        if (option.type === 'boolean') {
          config[key] = value === 'true';
        } else if (option.type === 'number') {
          config[key] = Number(value);
        } else {
          config[key] = value;
        }
      }
    }

    return new Response(
      JSON.stringify({
        templateId: id,
        config,
        optionGroups: template.optionGroups,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching template config:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch template config' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PATCH /api/templates/[id]/config
 * Updates the configuration for a specific template
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;

  if (!id || !templateExists(id)) {
    return new Response(JSON.stringify({ error: 'Template not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check authentication (admin only)
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(locals.runtime);
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const template = getTemplate(id)!;
    const validOptions = getAllTemplateOptions(template).map((o) => o.key);

    // Filter only valid options and convert to strings
    const configToSave: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (validOptions.includes(key)) {
        configToSave[key] = String(value);
      }
    }

    // Save to database
    await setTemplateConfigs(db, id, configToSave);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Template config updated',
        updated: Object.keys(configToSave).length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating template config:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update template config' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
