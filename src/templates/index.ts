import type { TemplateManifest } from './types';
import jeylaTemplate from './jeyla';

// ==================== TEMPLATE REGISTRY ====================

/**
 * Static registry of all available templates.
 * Templates are imported at build time and bundled with the app.
 */
export const TEMPLATES: Record<string, TemplateManifest> = {
  jeyla: jeylaTemplate,
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string): TemplateManifest | undefined {
  return TEMPLATES[templateId];
}

/**
 * Get a template by ID with fallback to default
 */
export function getTemplateOrDefault(templateId: string): TemplateManifest {
  return TEMPLATES[templateId] || TEMPLATES.jeyla;
}

/**
 * Get all available templates
 */
export function getAllTemplates(): TemplateManifest[] {
  return Object.values(TEMPLATES);
}

/**
 * Get all template IDs
 */
export function getTemplateIds(): string[] {
  return Object.keys(TEMPLATES);
}

/**
 * Check if a template exists
 */
export function templateExists(templateId: string): boolean {
  return templateId in TEMPLATES;
}

export interface MatchedRoute {
  route: import('./types').TemplateRoute;
  params: Record<string, string>;
}

/**
 * Find a route in a template by path, supporting dynamic segments like :slug
 */
export function findTemplateRoute(templateId: string, path: string): MatchedRoute | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  // First try exact match
  const exactMatch = template.routes.find((r) => r.path === path);
  if (exactMatch) {
    return { route: exactMatch, params: {} };
  }

  // Try dynamic routes
  for (const route of template.routes) {
    const params = matchDynamicRoute(route.path, path);
    if (params) {
      return { route, params };
    }
  }

  return null;
}

/**
 * Match a dynamic route pattern against a path
 * e.g., matchDynamicRoute('/recipes/:slug', '/recipes/pasta') => { slug: 'pasta' }
 */
function matchDynamicRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      // Dynamic segment
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      // Static segment doesn't match
      return null;
    }
  }

  return params;
}

/**
 * Get all routes for a template
 */
export function getTemplateRoutes(templateId: string) {
  const template = getTemplate(templateId);
  if (!template) return [];
  return template.routes;
}

// Re-export types
export type { TemplateManifest, TemplateConfig, TemplateComponents, TemplateRoute, TemplatePage } from './types';
