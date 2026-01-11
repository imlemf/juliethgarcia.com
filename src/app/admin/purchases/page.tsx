import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPurchasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compras</h1>
        <p className="text-muted-foreground mt-2">
          Visualiza todas las compras de tus clientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de compras</CardTitle>
          <CardDescription>
            Todas las transacciones y códigos de compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aún no hay compras registradas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
