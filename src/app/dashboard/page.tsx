import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getPurchasesByUserIdOrEmail } from '@/lib/db/queries/purchases';
import { PurchasesList } from '@/components/dashboard/purchases-list';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Get all purchases for this user (by userId or email)
  const context = getRequestContext();
  const db = getDb((context.env as any).DB as D1Database);
  const purchases = await getPurchasesByUserIdOrEmail(db, session.user.id, session.user.email);

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
