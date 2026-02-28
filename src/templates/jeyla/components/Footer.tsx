import type { FooterProps } from '../../types';
import { DynamicIcon } from './DynamicIcon';

export function Footer({ config, siteName = 'Jeyla', socialLinks = [] }: FooterProps) {
  const footerText = (config.footerText as string) || '';

  // Pastel colors from config with defaults
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  return (
    <footer>
      {/* Footer Bottom */}
      <div
        className="py-8 px-4"
        style={{ backgroundColor: pastelPeach }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-lg font-bold"
                style={{ color: pastelTextDark }}
              >
                {siteName}
              </a>

              {socialLinks.length > 0 && (
                <>
                  <div
                    className="h-4 w-px"
                    style={{ backgroundColor: `${pastelMint}60` }}
                  />
                  <div className="flex gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ backgroundColor: pastelMint }}
                        aria-label={link.title}
                      >
                        <DynamicIcon
                          icon={link.icon}
                          iconType={link.iconType}
                          size={16}
                          color={pastelTextDark}
                        />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              {footerText && (
                <p style={{ color: pastelTextMedium }}>{footerText}</p>
              )}
              <p style={{ color: pastelTextMedium }}>
                &copy; {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
