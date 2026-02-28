import { useTemplate, useTemplateConfig } from '@/templates/context';

const FONT_FAMILIES: Record<string, string> = {
  inter: "'Inter', sans-serif",
  poppins: "'Poppins', sans-serif",
  nunito: "'Nunito', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  system: "system-ui, sans-serif",
};

// Light mode colors from shadcn - these override the dark mode media query
const LIGHT_MODE_COLORS = `
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(0 0% 3.9%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(0 0% 3.9%);
  --color-popover: hsl(0 0% 100%);
  --color-popover-foreground: hsl(0 0% 3.9%);
  --color-primary: hsl(0 0% 9%);
  --color-primary-foreground: hsl(0 0% 98%);
  --color-secondary: hsl(0 0% 96.1%);
  --color-secondary-foreground: hsl(0 0% 9%);
  --color-muted: hsl(0 0% 96.1%);
  --color-muted-foreground: hsl(0 0% 45.1%);
  --color-accent: hsl(0 0% 96.1%);
  --color-accent-foreground: hsl(0 0% 9%);
  --color-destructive: hsl(0 84.2% 60.2%);
  --color-destructive-foreground: hsl(0 0% 98%);
  --color-border: hsl(0 0% 89.8%);
  --color-input: hsl(0 0% 89.8%);
  --color-ring: hsl(0 0% 3.9%);
`;

/**
 * Injects CSS custom properties based on template config
 */
export function TemplateStyles() {
  const { template } = useTemplate();
  const config = useTemplateConfig();

  const primaryColor = (config.primaryColor as string) || '0 0% 9%';
  const accentColor = (config.accentColor as string) || '340 80% 60%';
  const fontFamily = (config.fontFamily as string) || 'inter';

  // Force light mode if template doesn't support dark mode
  const forceLightMode = !template.supportsDarkMode;

  const cssVars = `
    :root {
      --template-primary: ${primaryColor};
      --template-accent: ${accentColor};
      --template-font-family: ${FONT_FAMILIES[fontFamily] || FONT_FAMILIES.inter};
      ${forceLightMode ? LIGHT_MODE_COLORS : ''}
    }

    /* Apply font family to body */
    body {
      font-family: var(--template-font-family);
    }

    /* Override primary color */
    .text-primary {
      color: hsl(var(--template-primary));
    }

    .bg-primary {
      background-color: hsl(var(--template-primary));
    }

    .border-primary {
      border-color: hsl(var(--template-primary));
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssVars }} />;
}
