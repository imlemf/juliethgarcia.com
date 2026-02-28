
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkForm } from '@/components/site-links/link-form';

interface SiteLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconType: 'emoji' | 'lucide';
  linkType: 'social' | 'custom';
  isActive: boolean;
}

interface EditLinkPageProps {
  linkId?: string;
}

export function EditLinkPage({ linkId }: EditLinkPageProps) {
  const [link, setLink] = useState<SiteLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!linkId) {
      setError('No se proporcionó ID de enlace');
      setIsLoading(false);
      return;
    }

    const fetchLink = async () => {
      try {
        const response = await fetch(`/api/site-links/${linkId}`);
        if (!response.ok) throw new Error('Failed to fetch link');

        const data = (await response.json()) as { link: SiteLink };
        setLink(data.link);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading link');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLink();
  }, [linkId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-muted-foreground">
        Cargando enlace...
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error || 'Enlace no encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Enlace</h1>
        <p className="text-muted-foreground mt-2">Actualiza la información del enlace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del enlace</CardTitle>
          <CardDescription>
            Modifica los detalles del enlace y guarda los cambios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm mode="edit" initialData={link} />
        </CardContent>
      </Card>
    </div>
  );
}
