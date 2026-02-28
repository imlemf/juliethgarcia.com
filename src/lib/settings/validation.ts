import { z, type ZodTypeAny } from 'zod';
import { SETTINGS_DEFINITIONS, type SettingDefinition } from './definitions';

/**
 * Builds a Zod schema for a single setting definition
 */
function buildFieldSchema(definition: SettingDefinition): ZodTypeAny {
  const { type, validation, options } = definition;

  let schema: ZodTypeAny;

  switch (type) {
    case 'boolean':
      schema = z.boolean();
      break;

    case 'number':
      let numSchema = z.number();
      if (validation?.min !== undefined) {
        numSchema = numSchema.min(validation.min, `Mínimo ${validation.min}`);
      }
      if (validation?.max !== undefined) {
        numSchema = numSchema.max(validation.max, `Máximo ${validation.max}`);
      }
      schema = numSchema;
      break;

    case 'select':
      if (options && options.length > 0) {
        const values = options.map(o => o.value) as [string, ...string[]];
        schema = z.enum(values, {
          errorMap: () => ({ message: 'Selecciona una opción válida' }),
        });
      } else {
        schema = z.string();
      }
      break;

    case 'string':
    default:
      let strSchema = z.string();

      if (validation?.required) {
        strSchema = strSchema.min(1, 'Este campo es requerido');
      }

      if (validation?.maxLength) {
        strSchema = strSchema.max(validation.maxLength, `Máximo ${validation.maxLength} caracteres`);
      }

      if (validation?.pattern === 'email') {
        // Allow empty string or valid email
        schema = z.union([
          z.literal(''),
          z.string().email('Email inválido'),
        ]);
      } else {
        schema = strSchema;
      }
      break;
  }

  return schema;
}

/**
 * Builds a complete Zod schema from all settings definitions
 */
export function buildSettingsSchema() {
  const shape: Record<string, ZodTypeAny> = {};

  for (const definition of SETTINGS_DEFINITIONS) {
    shape[definition.key] = buildFieldSchema(definition);
  }

  return z.object(shape);
}

/**
 * Builds a partial schema for updating specific settings
 */
export function buildPartialSettingsSchema() {
  return buildSettingsSchema().partial();
}

/**
 * Validates settings data against the schema
 */
export function validateSettings(data: unknown) {
  const schema = buildPartialSettingsSchema();
  return schema.safeParse(data);
}

/**
 * Validates a single setting value
 */
export function validateSetting(key: string, value: unknown) {
  const definition = SETTINGS_DEFINITIONS.find(d => d.key === key);
  if (!definition) {
    return { success: false, error: `Setting "${key}" not found` };
  }

  const schema = z.object({ [key]: buildFieldSchema(definition) });
  return schema.safeParse({ [key]: value });
}

// Pre-built schemas for convenience
export const settingsSchema = buildSettingsSchema();
export const partialSettingsSchema = buildPartialSettingsSchema();

// Type inference
export type SettingsInput = z.infer<typeof settingsSchema>;
export type PartialSettingsInput = z.infer<typeof partialSettingsSchema>;
