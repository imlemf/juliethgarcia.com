import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface OfferFormProps {
  offerId?: string;
}

interface Product {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  usageLimitPerUser: string;
  productIds: string[];
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

export function OfferForm({ offerId }: OfferFormProps) {
  const isEditing = !!offerId;
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: '',
    productIds: [],
    startsAt: null,
    expiresAt: null,
    isActive: true,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    if (offerId) {
      fetchOffer();
    } else {
      setIsFetching(false);
    }
  }, [offerId]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json() as { products: Product[] };
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOffer = async () => {
    try {
      const res = await fetch(`/api/offers/${offerId}`);
      if (!res.ok) throw new Error('Oferta no encontrada');
      const data = await res.json() as { offer: any };
      const offer = data.offer;

      let productIds: string[] = [];
      if (offer.productIds) {
        try {
          productIds = JSON.parse(offer.productIds);
        } catch {
          productIds = [];
        }
      }

      setFormData({
        name: offer.name,
        description: offer.description || '',
        discountType: offer.discountType,
        discountValue: String(offer.discountValue),
        minPurchaseAmount: offer.minPurchaseAmount ? String(offer.minPurchaseAmount / 100) : '',
        maxDiscountAmount: offer.maxDiscountAmount ? String(offer.maxDiscountAmount / 100) : '',
        usageLimit: offer.usageLimit !== null ? String(offer.usageLimit) : '',
        usageLimitPerUser: offer.usageLimitPerUser !== null ? String(offer.usageLimitPerUser) : '',
        productIds,
        startsAt: offer.startsAt ? new Date(offer.startsAt) : null,
        expiresAt: offer.expiresAt ? new Date(offer.expiresAt) : null,
        isActive: offer.isActive,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = isEditing ? `/api/offers/${offerId}` : '/api/offers';
      const method = isEditing ? 'PATCH' : 'POST';

      const payload: any = {
        name: formData.name,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: formData.discountType === 'percentage'
          ? Number(formData.discountValue)
          : Math.round(Number(formData.discountValue) * 100), // Convert to cents for fixed
        minPurchaseAmount: formData.minPurchaseAmount
          ? Math.round(Number(formData.minPurchaseAmount) * 100)
          : null,
        maxDiscountAmount: formData.maxDiscountAmount
          ? Math.round(Number(formData.maxDiscountAmount) * 100)
          : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        usageLimitPerUser: formData.usageLimitPerUser ? Number(formData.usageLimitPerUser) : null,
        productIds: formData.productIds.length > 0 ? formData.productIds : null,
        startsAt: formData.startsAt || null,
        expiresAt: formData.expiresAt || null,
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string; details?: Array<{ path: string[]; message: string }> };
        let errorMessage = data.error || 'Error al guardar';
        if (data.details && data.details.length > 0) {
          const fieldErrors = data.details.map((d) => `${d.path.join('.')}: ${d.message}`).join(', ');
          errorMessage = `${errorMessage} (${fieldErrors})`;
        }
        throw new Error(errorMessage);
      }

      window.location.href = '/admin/offers';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  if (isFetching) {
    return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="restrictions">Restricciones</TabsTrigger>
              <TabsTrigger value="products">
                Productos
                {formData.productIds.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {formData.productIds.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la oferta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la oferta</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Black Friday 2024"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descuento especial por Black Friday..."
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se mostrará a los usuarios en el checkout
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Descuento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Tipo de descuento</Label>
                      <Select
                        value={formData.discountType}
                        onValueChange={(value: 'percentage' | 'fixed') =>
                          setFormData((prev) => ({ ...prev, discountType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountValue">
                        Valor {formData.discountType === 'percentage' ? '(%)' : '($)'}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        min="1"
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                        value={formData.discountValue}
                        onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                        placeholder={formData.discountType === 'percentage' ? '30' : '15.00'}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="restrictions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Límites de compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="minPurchaseAmount">Monto mínimo de compra ($)</Label>
                      <Input
                        id="minPurchaseAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minPurchaseAmount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, minPurchaseAmount: e.target.value }))}
                        placeholder="50.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDiscountAmount">Descuento máximo ($)</Label>
                      <Input
                        id="maxDiscountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
                        placeholder="100.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tope máximo del descuento aplicado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Límites de uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="usageLimit">Límite total de usos</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        min="1"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                        placeholder="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Dejar vacío para ilimitado
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usageLimitPerUser">Límite por usuario</Label>
                      <Input
                        id="usageLimitPerUser"
                        type="number"
                        min="1"
                        value={formData.usageLimitPerUser}
                        onChange={(e) => setFormData((prev) => ({ ...prev, usageLimitPerUser: e.target.value }))}
                        placeholder="1"
                      />
                      <p className="text-xs text-muted-foreground">
                        Veces que un mismo email puede usar la oferta
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productos específicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona los productos a los que aplica esta oferta. Si no seleccionas ninguno, aplicará a todos.
                  </p>
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay productos</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                        >
                          <Checkbox
                            id={`offer-product-${product.id}`}
                            checked={formData.productIds.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <label
                            htmlFor={`offer-product-${product.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {product.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium">Configuración</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Activo</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium">Vigencia</h3>

            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <DateTimePicker
                value={formData.startsAt}
                onChange={(date) => setFormData((prev) => ({ ...prev, startsAt: date }))}
                placeholder="Seleccionar inicio"
              />
              <p className="text-xs text-muted-foreground">
                Dejar vacío para que inicie inmediatamente
              </p>
            </div>

            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <DateTimePicker
                value={formData.expiresAt}
                onChange={(date) => setFormData((prev) => ({ ...prev, expiresAt: date }))}
                placeholder="Seleccionar fin"
              />
              <p className="text-xs text-muted-foreground">
                Dejar vacío para que no expire
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-medium">Información</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Máximo 5 ofertas activas al mismo tiempo</li>
              <li>Se aplica automáticamente la oferta con mayor descuento para el usuario</li>
              <li>No requieren que el usuario ingrese un código</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
            <a href="/admin/offers">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
