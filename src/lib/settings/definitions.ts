// Tipos para definir settings
export type SettingType = 'string' | 'number' | 'boolean' | 'select';

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: 'email' | string;
}

export type SettingGroup = 'general' | 'date' | 'seo' | 'commerce' | 'template';

export interface SettingDefinition {
  key: string;
  type: SettingType;
  group: SettingGroup;
  label: string;
  description: string;
  defaultValue: string | number | boolean;
  options?: SettingOption[];
  validation?: SettingValidation;
  isPublic?: boolean;
}

// Definición centralizada de todos los settings
export const SETTINGS_DEFINITIONS: SettingDefinition[] = [
  // === GENERAL ===
  {
    key: 'site.name',
    type: 'string',
    group: 'general',
    label: 'Nombre del sitio',
    description: 'El nombre que aparece en el header y títulos',
    defaultValue: 'My Site',
    validation: { required: true, maxLength: 100 },
    isPublic: true,
  },
  {
    key: 'site.description',
    type: 'string',
    group: 'general',
    label: 'Descripción',
    description: 'Descripción general del sitio',
    defaultValue: '',
    validation: { maxLength: 500 },
  },
  {
    key: 'site.contactEmail',
    type: 'string',
    group: 'general',
    label: 'Email de contacto',
    description: 'Email para recibir mensajes de contacto',
    defaultValue: '',
    validation: { pattern: 'email' },
  },
  {
    key: 'site.maintenanceMode',
    type: 'boolean',
    group: 'general',
    label: 'Modo mantenimiento',
    description: 'Muestra una página de mantenimiento a los visitantes',
    defaultValue: false,
  },

  // === FECHAS ===
  {
    key: 'date.timezone',
    type: 'select',
    group: 'date',
    label: 'Zona horaria',
    description: 'Zona horaria para mostrar fechas',
    defaultValue: 'America/Bogota',
    options: [
      { value: 'America/Bogota', label: 'Colombia (Bogotá)' },
    ],
    isPublic: true,
  },
  {
    key: 'date.format',
    type: 'select',
    group: 'date',
    label: 'Formato de fecha',
    description: 'Cómo se muestran las fechas',
    defaultValue: 'dd/MM/yyyy',
    options: [
      { value: 'dd/MM/yyyy', label: '25/01/2026' },
      { value: 'MM/dd/yyyy', label: '01/25/2026' },
      { value: 'yyyy-MM-dd', label: '2026-01-25' },
      { value: 'd MMM yyyy', label: '25 ene 2026' },
      { value: 'dd MMMM yyyy', label: '25 enero 2026' },
    ],
    isPublic: true,
  },
  {
    key: 'date.timeFormat',
    type: 'select',
    group: 'date',
    label: 'Formato de hora',
    description: 'Formato de 12 o 24 horas',
    defaultValue: '24h',
    options: [
      { value: '24h', label: '24 horas (14:30)' },
      { value: '12h', label: '12 horas (2:30 PM)' },
    ],
    isPublic: true,
  },
  {
    key: 'date.locale',
    type: 'select',
    group: 'date',
    label: 'Idioma/Región',
    description: 'Idioma para nombres de meses y días',
    defaultValue: 'es-CO',
    options: [
      { value: 'es-CO', label: 'Español (Colombia)' },
    ],
    isPublic: true,
  },

  // === SEO ===
  {
    key: 'seo.titleSuffix',
    type: 'string',
    group: 'seo',
    label: 'Sufijo del título',
    description: 'Se añade al final del título de cada página',
    defaultValue: ' - My Site',
    validation: { maxLength: 60 },
  },
  {
    key: 'seo.defaultDescription',
    type: 'string',
    group: 'seo',
    label: 'Meta descripción',
    description: 'Descripción por defecto para SEO',
    defaultValue: '',
    validation: { maxLength: 160 },
  },

  // === COMERCIO ===
  {
    key: 'commerce.defaultCurrency',
    type: 'select',
    group: 'commerce',
    label: 'Moneda por defecto',
    description: 'Moneda para mostrar precios',
    defaultValue: 'COP',
    options: [
      { value: 'COP', label: 'Peso Colombiano (COP)' },
      { value: 'USD', label: 'Dólar (USD)' },
      { value: 'MXN', label: 'Peso Mexicano (MXN)' },
    ],
  },
  {
    key: 'commerce.downloadLinkExpiryHours',
    type: 'number',
    group: 'commerce',
    label: 'Expiración de enlaces',
    description: 'Horas antes de que expiren los enlaces de descarga',
    defaultValue: 48,
    validation: { min: 1, max: 720 },
  },
  {
    key: 'commerce.subscriptionDurationMonths',
    type: 'number',
    group: 'commerce',
    label: 'Duración de suscripción premium (meses)',
    description: 'Meses de acceso premium otorgados por cada compra',
    defaultValue: 3,
    validation: { min: 1, max: 24 },
  },

  // === TEMPLATE ===
  {
    key: 'template.active',
    type: 'select',
    group: 'template',
    label: 'Plantilla activa',
    description: 'Diseño visual del sitio público',
    defaultValue: 'jeyla',
    options: [
      { value: 'jeyla', label: 'Jeyla - Fitness & Wellness' },
    ],
    isPublic: true,
  },
];

// Helpers para trabajar con las definiciones
export function getDefinitionByKey(key: string): SettingDefinition | undefined {
  return SETTINGS_DEFINITIONS.find(d => d.key === key);
}

export function getDefinitionsByGroup(group: SettingGroup): SettingDefinition[] {
  return SETTINGS_DEFINITIONS.filter(d => d.group === group);
}

export function getPublicDefinitions(): SettingDefinition[] {
  return SETTINGS_DEFINITIONS.filter(d => d.isPublic);
}

export function getDefaultValues(): Record<string, string | number | boolean> {
  return Object.fromEntries(
    SETTINGS_DEFINITIONS.map(d => [d.key, d.defaultValue])
  );
}

export function getAllGroups(): SettingGroup[] {
  return ['general', 'date', 'seo', 'commerce', 'template'];
}

export const GROUP_LABELS: Record<SettingGroup, { label: string; description: string }> = {
  general: {
    label: 'General',
    description: 'Información básica del sitio',
  },
  date: {
    label: 'Fechas',
    description: 'Configura cómo se muestran las fechas',
  },
  seo: {
    label: 'SEO',
    description: 'Optimización para motores de búsqueda',
  },
  commerce: {
    label: 'Comercio',
    description: 'Configuración de pagos y descargas',
  },
  template: {
    label: 'Plantilla',
    description: 'Diseño y apariencia del sitio',
  },
};

// Tipo para los valores de settings
export type SettingsValues = {
  [K in typeof SETTINGS_DEFINITIONS[number]['key']]: string | number | boolean;
};
