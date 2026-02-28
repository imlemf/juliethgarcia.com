import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format-currency';

interface Purchase {
  id: string;
  email: string;
  purchaseCode: string;
  amount: number;
  currency: string;
  status: 'initialized' | 'pending' | 'completed' | 'refunded' | 'failed';
  externalPaymentId: string | null;
  paymentProvider: string | null;
  usedForRegistration: boolean;
  createdAt: string;
  productName: string | null;
  productSlug: string | null;
  userName: string | null;
  userId: string | null;
}

const statusLabels: Record<string, string> = {
  initialized: 'Inicializada',
  pending: 'Pendiente',
  completed: 'Completada',
  refunded: 'Reembolsada',
  failed: 'Fallida',
};

const statusColors: Record<string, string> = {
  initialized: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
  refunded: 'bg-muted text-muted-foreground',
  failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function PurchasesTable() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailInput, setEmailInput] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [counts, setCounts] = useState({ all: 0, completed: 0, pending: 0, initialized: 0 });
  const [initialized, setInitialized] = useState(false);

  const fetchPurchases = useCallback(async (status: string, email: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (email) params.set('email', email);

      const res = await fetch(`/api/admin/purchases?${params.toString()}`);
      const data = await res.json() as { purchases: Purchase[] };
      setPurchases(data.purchases);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, completedRes, pendingRes, initializedRes] = await Promise.all([
        fetch('/api/admin/purchases').then((r) => r.json() as Promise<{ purchases: Purchase[] }>),
        fetch('/api/admin/purchases?status=completed').then((r) => r.json() as Promise<{ purchases: Purchase[] }>),
        fetch('/api/admin/purchases?status=pending').then((r) => r.json() as Promise<{ purchases: Purchase[] }>),
        fetch('/api/admin/purchases?status=initialized').then((r) => r.json() as Promise<{ purchases: Purchase[] }>),
      ]);
      setCounts({
        all: allRes.purchases.length,
        completed: completedRes.purchases.length,
        pending: pendingRes.purchases.length,
        initialized: initializedRes.purchases.length,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') || 'all';
    const email = params.get('email') || '';
    setStatusFilter(status);
    setEmailInput(email);
    setEmailFilter(email);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    fetchPurchases(statusFilter, emailFilter);

    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (emailFilter) params.set('email', emailFilter);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [statusFilter, emailFilter, initialized, fetchPurchases]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleSearch = () => {
    setEmailFilter(emailInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todas ({counts.all})</TabsTrigger>
            <TabsTrigger value="completed">Completadas ({counts.completed})</TabsTrigger>
            <TabsTrigger value="pending">Pendientes ({counts.pending})</TabsTrigger>
            <TabsTrigger value="initialized">Inicializadas ({counts.initialized})</TabsTrigger>
          </TabsList>
        </Tabs>
        <InputGroup className="sm:max-w-xs">
          <InputGroupInput
            placeholder="Buscar por correo..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <InputGroupAddon align="inline-end">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay compras
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {p.purchaseCode}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">{p.productName || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{p.email}</TableCell>
                    <TableCell>{formatCurrency(p.amount / 100, p.currency)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.location.href = `/admin/purchases/${p.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
