
import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';

interface SiteLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconType: 'emoji' | 'lucide' | 'simple-icons';
  order: number;
}

export function LinkTreeDisplay() {
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/site-links');
      if (!response.ok) throw new Error('Failed to fetch links');

      const data = (await response.json()) as { links: SiteLink[] };
      setLinks(data.links);
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkClick = async (linkId: string, url: string) => {
    // Track click (fire and forget)
    fetch(`/api/site-links/${linkId}/click`, { method: 'POST' }).catch((err) =>
      console.error('Failed to track click:', err)
    );

    // Open link
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderIcon = (link: SiteLink) => {
    if (link.iconType === 'emoji') {
      return <span className="text-3xl">{link.icon}</span>;
    }

    if (link.iconType === 'simple-icons') {
      const IconComponent = (SimpleIcons as any)[link.icon] as React.ComponentType<{ size?: number }>;
      if (IconComponent) {
        return <IconComponent size={28} />;
      }
    }

    if (link.iconType === 'lucide') {
      const IconComponent = (LucideIcons as any)[link.icon] as React.ComponentType<{ className?: string }>;
      if (IconComponent) {
        return <IconComponent className="h-7 w-7" />;
      }
    }

    return <span className="text-3xl">🔗</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Julieth Garcia</h1>
          <p className="text-muted-foreground">Todos mis enlaces en un solo lugar</p>
        </div>

        {/* Links Section */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando enlaces...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay enlaces disponibles
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  {renderIcon(link)}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>© 2026 Julieth Garcia. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
