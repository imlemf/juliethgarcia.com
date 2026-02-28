import { createContext, useContext, type ReactNode } from 'react';
import type {
  TemplateManifest,
  TemplateConfig,
  TemplateComponents,
  TemplateContextValue,
  TemplateOption,
} from './types';
import { TEMPLATES } from './index';

// ==================== CONTEXT ====================

const TemplateContext = createContext<TemplateContextValue | null>(null);

// ==================== PROVIDER ====================

interface TemplateProviderProps {
  templateId: string;
  configOverrides?: Record<string, string>;
  children: ReactNode;
}

export function TemplateProvider({
  templateId,
  configOverrides = {},
  children,
}: TemplateProviderProps) {
  // Get template or fallback to first available
  const template = TEMPLATES[templateId] || Object.values(TEMPLATES)[0];

  if (!template) {
    throw new Error(`No templates available`);
  }

  // Build config from defaults + overrides
  const config = buildConfig(template, configOverrides);

  return (
    <TemplateContext.Provider
      value={{
        template,
        config,
        components: template.components,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

// ==================== HOOKS ====================

/**
 * Get the current template context
 */
export function useTemplate(): TemplateContextValue {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}

/**
 * Get the current template config
 */
export function useTemplateConfig(): TemplateConfig {
  const { config } = useTemplate();
  return config;
}

/**
 * Get a specific config value
 */
export function useTemplateConfigValue<T extends string | number | boolean>(
  key: string,
  defaultValue?: T
): T | undefined {
  const { config } = useTemplate();
  return (config[key] as T) ?? defaultValue;
}

/**
 * Get the current template's components
 */
export function useTemplateComponents(): TemplateComponents {
  const { components } = useTemplate();
  return components;
}

/**
 * Get a specific component from the current template
 */
export function useTemplateComponent<K extends keyof TemplateComponents>(
  name: K
): TemplateComponents[K] {
  const { components } = useTemplate();
  return components[name];
}

// ==================== HELPERS ====================

/**
 * Build config object from template defaults and database overrides
 */
function buildConfig(
  template: TemplateManifest,
  overrides: Record<string, string>
): TemplateConfig {
  const config: TemplateConfig = {};

  // Collect all options from all groups
  const allOptions: TemplateOption[] = template.optionGroups.flatMap(
    (group) => group.options
  );

  // Set defaults
  for (const option of allOptions) {
    config[option.key] = option.defaultValue;
  }

  // Apply overrides (parse values based on option type)
  for (const option of allOptions) {
    if (overrides[option.key] !== undefined) {
      config[option.key] = parseConfigValue(overrides[option.key], option.type);
    }
  }

  return config;
}

/**
 * Parse a string value to its correct type based on option type
 */
function parseConfigValue(
  value: string,
  type: string
): string | number | boolean {
  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return Number(value);
    default:
      return value;
  }
}

/**
 * Get all options from a template as a flat list
 */
export function getAllTemplateOptions(
  template: TemplateManifest
): TemplateOption[] {
  return template.optionGroups.flatMap((group) => group.options);
}

/**
 * Get default config values for a template
 */
export function getTemplateDefaults(
  template: TemplateManifest
): Record<string, string | number | boolean> {
  const defaults: Record<string, string | number | boolean> = {};
  for (const option of getAllTemplateOptions(template)) {
    defaults[option.key] = option.defaultValue;
  }
  return defaults;
}
