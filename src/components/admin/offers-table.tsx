import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { Pencil, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Offer {
  id: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  usageLimitPerUser: number | null;
  productIds: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export function OffersTable() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOffers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/offers');
      const data = await res.json() as { offers?: Offer[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      }
      setOffers(data.offers || []);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar');
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleActive = async (offer: Offer) => {
    const newStatus = !offer.isActive;
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al actualizar');
      }
      setOffers(offers.map((o) =>
        o.id === offer.id ? { ...o, isActive: newStatus } : o
      ));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setOffers(offers.filter((o) => o.id !== id));
      toast.success('Oferta eliminada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const formatDiscount = (type: 'percentage' | 'fixed', value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return `$${(value / 100).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const getOfferStatus = (offer: Offer) => {
    if (!offer.isActive) return { label: 'Inactivo', variant: 'secondary' as const, isCurrentlyActive: false };

    const now = new Date();
    const startsAt = offer.startsAt ? new Date(offer.startsAt) : null;
    const expiresAt = offer.expiresAt ? new Date(offer.expiresAt) : null;

    // Check if scheduled for future
    if (startsAt && startsAt > now) {
      return { label: 'Programada', variant: 'outline' as const, isCurrentlyActive: false };
    }
    // Check if already ended
    if (expiresAt && expiresAt < now) {
      return { label: 'Finalizada', variant: 'destructive' as const, isCurrentlyActive: false };
    }
    // Active (no dates = always active, or within date range)
    return { label: 'Activa', variant: 'default' as const, isCurrentlyActive: true };
  };

  const activeOffersCount = offers.filter(o => getOfferStatus(o).isCurrentlyActive).length;

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />

      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Ofertas activas: <span className={activeOffersCount >= 5 ? 'text-destructive font-medium' : 'font-medium'}>{activeOffersCount}/5</span>
            {activeOffersCount >= 5 && ' (límite alcanzado)'}
          </p>
          <p className="text-xs text-muted-foreground">
            Se aplica automáticamente la oferta con mayor descuento
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead className="text-center">Usos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay ofertas
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => {
                const status = getOfferStatus(offer);
                return (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{offer.name}</div>
                        {offer.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {offer.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatDiscount(offer.discountType, offer.discountValue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div>
                        <div>Desde: {offer.startsAt ? formatDate(offer.startsAt) : 'Inmediato'}</div>
                        <div>Hasta: {offer.expiresAt ? formatDate(offer.expiresAt) : 'Sin límite'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">
                        {offer.usageCount}
                        {offer.usageLimit !== null && (
                          <span className="text-muted-foreground">/{offer.usageLimit}</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={offer.isActive}
                        onCheckedChange={() => handleToggleActive(offer)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/admin/offers/${offer.id}/edit`}>
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
                              <AlertDialogTitle>¿Eliminar oferta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente la oferta "{offer.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(offer.id)}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
