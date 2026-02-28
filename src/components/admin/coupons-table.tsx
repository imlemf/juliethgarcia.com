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
import { Pencil, Trash2, Copy } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Coupon {
  id: string;
  code: string;
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

export function CouponsTable() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json() as { coupons?: Coupon[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      }
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar');
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon: Coupon) => {
    const newStatus = !coupon.isActive;
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al actualizar');
      }
      setCoupons(coupons.map((c) =>
        c.id === coupon.id ? { ...c, isActive: newStatus } : c
      ));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setCoupons(coupons.filter((c) => c.id !== id));
      toast.success('Cupón eliminado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Código copiado');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Error al copiar el código');
    }
  };

  const formatDiscount = (type: 'percentage' | 'fixed', value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return `$${(value / 100).toFixed(2)}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: 'Inactivo', variant: 'secondary' as const };

    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return { label: 'Programado', variant: 'outline' as const };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return { label: 'Expirado', variant: 'destructive' as const };
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { label: 'Agotado', variant: 'destructive' as const };
    }
    return { label: 'Activo', variant: 'default' as const };
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
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead className="text-center">Usos</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay cupones
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code, coupon.id)}
                        >
                          <Copy className={`h-3 w-3 ${copiedId === coupon.id ? 'text-green-500' : ''}`} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{coupon.name}</div>
                        {coupon.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {coupon.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatDiscount(coupon.discountType, coupon.discountValue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{coupon.usageCount}</span>
                      {coupon.usageLimit !== null && (
                        <span className="text-muted-foreground">/{coupon.usageLimit}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div>
                        {coupon.startsAt && <div>Desde: {formatDate(coupon.startsAt)}</div>}
                        {coupon.expiresAt && <div>Hasta: {formatDate(coupon.expiresAt)}</div>}
                        {!coupon.startsAt && !coupon.expiresAt && <span>Sin límite</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleActive(coupon)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/admin/coupons/${coupon.id}/edit`}>
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
                              <AlertDialogTitle>¿Eliminar cupón?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el cupón "{coupon.code}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(coupon.id)}
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
