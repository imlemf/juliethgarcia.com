import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Search, Pencil } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  registrationPurchaseId: string | null;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [emailInput, setEmailInput] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [counts, setCounts] = useState({ all: 0, user: 0, admin: 0 });
  const [initialized, setInitialized] = useState(false);

  const fetchUsers = useCallback(async (role: string, email: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (role !== 'all') params.set('role', role);
      if (email) params.set('email', email);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json() as { users: User[] };
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, userRes, adminRes] = await Promise.all([
        fetch('/api/admin/users').then((r) => r.json() as Promise<{ users: User[] }>),
        fetch('/api/admin/users?role=user').then((r) => r.json() as Promise<{ users: User[] }>),
        fetch('/api/admin/users?role=admin').then((r) => r.json() as Promise<{ users: User[] }>),
      ]);
      setCounts({
        all: allRes.users.length,
        user: userRes.users.length,
        admin: adminRes.users.length,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') || 'all';
    const email = params.get('email') || '';
    setRoleFilter(role);
    setEmailInput(email);
    setEmailFilter(email);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    fetchUsers(roleFilter, emailFilter);

    const params = new URLSearchParams();
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (emailFilter) params.set('email', emailFilter);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [roleFilter, emailFilter, initialized, fetchUsers]);

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

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name || '',
          email: user.email,
          role: user.role,
          isActive: !currentActive,
        }),
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, isActive: !currentActive } : u
        ));
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={roleFilter} onValueChange={handleRoleChange} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
              <TabsTrigger value="user">Usuarios ({counts.user})</TabsTrigger>
              <TabsTrigger value="admin">Admins ({counts.admin})</TabsTrigger>
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
        <Button onClick={() => window.location.href = '/admin/users/new'}>
          Nuevo usuario
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {u.registrationPurchaseId ? (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => window.location.href = `/admin/purchases/${u.registrationPurchaseId}`}
                        >
                          Ver compra →
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">Manual</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.isActive}
                        onCheckedChange={() => handleToggleActive(u.id, u.isActive)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.location.href = `/admin/users/${u.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
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
