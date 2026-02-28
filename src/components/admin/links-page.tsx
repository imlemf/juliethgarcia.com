
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ExternalLink } from 'lucide-react';
import { LinkList } from '@/components/site-links/link-list';

interface SiteLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconType: 'emoji' | 'lucide';
  linkType: 'social' | 'custom';
  order: number;
  isActive: boolean;
  clickCount: number;
}

export function AdminLinksPage() {
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/site-links?showInactive=true');
      if (!response.ok) throw new Error('Failed to fetch links');

      const data = (await response.json()) as { links: SiteLink[] };
      setLinks(data.links);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este enlace?')) return;

    try {
      const response = await fetch(`/api/site-links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete link');

      setLinks(links.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleReorder = async (reorderedLinks: SiteLink[]) => {
    const linkOrders = reorderedLinks.map((link, index) => ({
      id: link.id,
      order: index,
    }));

    try {
      const response = await fetch('/api/site-links/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkOrders }),
      });

      if (!response.ok) throw new Error('Failed to reorder links');

      setLinks(reorderedLinks);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al reordenar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enlaces</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los enlaces de tu página tipo Linktree
          </p>
        </div>
        <a href="/admin/links/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo enlace
          </Button>
        </a>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de enlaces</CardTitle>
              <CardDescription>
                Arrastra para reordenar, edita o elimina enlaces
              </CardDescription>
            </div>
            <a href="/links" target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver página pública
              </Button>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando enlaces...
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay enlaces
            </div>
          ) : (
            <LinkList
              links={links}
              onReorder={handleReorder}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
