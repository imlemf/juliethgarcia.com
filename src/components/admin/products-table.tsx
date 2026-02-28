import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Download } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  fileKey: string;
  fileName: string;
  isActive: boolean;
  createdAt: string;
}

function formatPrice(priceInCents: number, currency: string) {
  const amount = priceInCents / 100;
  if (currency === 'COP') {
    return `$${amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`;
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products?showInactive=true');
      const data = await res.json() as { products: Product[] };
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleActive = async (product: Product) => {
    const newStatus = !product.isActive;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al actualizar');
      }
      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, isActive: newStatus } : p
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'active') return p.isActive;
    if (filter === 'inactive') return !p.isActive;
    return true;
  });

  const counts = {
    active: products.filter((p) => p.isActive).length,
    inactive: products.filter((p) => !p.isActive).length,
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">Activos ({counts.active})</TabsTrigger>
          <TabsTrigger value="inactive">Inactivos ({counts.inactive})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Archivo</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay productos {filter === 'active' ? 'activos' : 'inactivos'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">/{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(product.price, product.currency)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {product.fileName}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={() => handleToggleActive(product)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/api/admin/products/${product.id}/download`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      <a href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </a>
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
