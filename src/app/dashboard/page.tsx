import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { PurchasesList } from '@/components/dashboard/purchases-list';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // TODO: Fetch purchases from API route once Cloudflare Pages supports Next.js 16 bindings
  // For now, showing empty state
  const purchases: any[] = [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido, {session.user.email}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mis Compras</CardTitle>
            <CardDescription>
              Accede a todos tus productos digitales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PurchasesList purchases={purchases} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
