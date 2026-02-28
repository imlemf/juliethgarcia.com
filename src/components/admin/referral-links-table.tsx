import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Copy, ExternalLink, BarChart2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface ReferralLink {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  destinationUrl: string;
  categoryId: string | null;
  categoryName: string | null;
  clickCount: number;
  lastClickAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export function ReferralLinksTable() {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLinks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/referral-links');
      const data = await res.json() as { links?: ReferralLink[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      }
      setLinks(data.links || []);
    } catch (err) {
      console.error('Error fetching links:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar');
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleToggleActive = async (link: ReferralLink) => {
    const newStatus = !link.isActive;
    try {
      const res = await fetch(`/api/referral-links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al actualizar');
      }
      setLinks(links.map((l) =>
        l.id === link.id ? { ...l, isActive: newStatus } : l
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/referral-links/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setLinks(links.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const copyLink = async (slug: string, id: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Link copiado al portapapeles');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Error al copiar el link');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-center">Clicks</TableHead>
              <TableHead>Último click</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay links
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{link.title}</div>
                      <div className="text-xs text-muted-foreground">/r/{link.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {link.categoryName || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{link.clickCount}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(link.lastClickAt)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={link.isActive}
                      onCheckedChange={() => handleToggleActive(link)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyLink(link.slug, link.id)}
                        title="Copiar link"
                      >
                        <Copy className={`h-4 w-4 ${copiedId === link.id ? 'text-green-500' : ''}`} />
                      </Button>
                      <a href={`/r/${link.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Probar link">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <a href={`/admin/referrals/links/${link.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar link?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente "{link.title}" y todos sus datos de clicks.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(link.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
