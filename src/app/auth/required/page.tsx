import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Lock } from 'lucide-react';

export const runtime = 'edge';

interface AuthRequiredPageProps {
  searchParams: {
    token?: string;
  };
}

async function AuthRequiredContent({ searchParams }: AuthRequiredPageProps) {
  const session = await auth();
  const token = searchParams.token;

  // If already authenticated and has token, redirect to download
  if (session?.user && token) {
    redirect(`/api/downloads/${token}`);
  }

  // If authenticated but no token, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Autenticación requerida</CardTitle>
            <CardDescription>
              Para descargar este archivo necesitas iniciar sesión o crear una cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 mb-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <span className="font-semibold">¿Ya tienes cuenta?</span>
                    <br />
                    Inicia sesión con tu email y contraseña para acceder a tus compras.
                  </p>
                </div>
                <LoginForm redirectTo={token ? `/api/downloads/${token}` : '/dashboard'} />
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 mb-4">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <span className="font-semibold">¿Primera vez?</span>
                    <br />
                    Crea tu cuenta usando el código de compra que recibiste por email. Este código solo se usa una vez
                    para crear tu cuenta.
                  </p>
                </div>
                <RegisterForm redirectTo={token ? `/api/downloads/${token}` : '/dashboard'} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No encuentras tu código de compra? Revisa tu email o contacta con soporte.
        </p>
      </div>
    </div>
  );
}

export default function AuthRequiredPage(props: AuthRequiredPageProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AuthRequiredContent {...props} />
    </Suspense>
  );
}
