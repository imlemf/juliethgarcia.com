import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  countryCode: 'CO' | 'US' | 'MX' | null;
  status: 'active' | 'unsubscribed';
  createdAt: string | null;
  uncreatedAt: string | null;
}

const countryPrefixes: Record<string, string> = {
  CO: '+57',
  US: '+1',
  MX: '+52',
};

export function SubscribersTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailInput, setEmailInput] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [counts, setCounts] = useState({ all: 0, active: 0, unsubscribed: 0 });
  const [initialized, setInitialized] = useState(false);

  const fetchSubscribers = useCallback(async (status: string, email: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (email) params.set('email', email);

      const res = await fetch(`/api/admin/newsletter?${params.toString()}`);
      const data = await res.json() as { subscribers: Subscriber[] };
      setSubscribers(data.subscribers);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, activeRes, unsubRes] = await Promise.all([
        fetch('/api/admin/newsletter').then((r) => r.json() as Promise<{ subscribers: Subscriber[] }>),
        fetch('/api/admin/newsletter?status=active').then((r) => r.json() as Promise<{ subscribers: Subscriber[] }>),
        fetch('/api/admin/newsletter?status=unsubscribed').then((r) => r.json() as Promise<{ subscribers: Subscriber[] }>),
      ]);
      setCounts({
        all: allRes.subscribers.length,
        active: activeRes.subscribers.length,
        unsubscribed: unsubRes.subscribers.length,
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
    fetchSubscribers(statusFilter, emailFilter);

    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (emailFilter) params.set('email', emailFilter);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [statusFilter, emailFilter, initialized, fetchSubscribers]);

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

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={statusFilter} onValueChange={handleStatusChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
            <TabsTrigger value="active">Activos ({counts.active})</TabsTrigger>
            <TabsTrigger value="unsubscribed">Desuscritos ({counts.unsubscribed})</TabsTrigger>
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
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Fecha de suscripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay suscriptores
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name || '—'}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.phone && s.countryCode
                        ? `${countryPrefixes[s.countryCode]} ${s.phone}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.status === 'active'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {s.status === 'active' ? 'Activo' : 'Desuscrito'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-CO') : '—'}
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
