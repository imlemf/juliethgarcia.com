import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';

export default function AuthRequiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Autenticación requerida</CardTitle>
          <CardDescription>
            Has usado tu descarga gratuita. Para descargar nuevamente, inicia sesión o registra una cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <p className="font-medium">¿Ya tienes cuenta?</p>
            <p className="text-xs mt-1">Solo inicia sesión, no necesitas el código de compra.</p>
          </div>

          <Suspense fallback={<div>Cargando...</div>}>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Si ya tienes una cuenta de compras anteriores, solo ingresa tu email y contraseña.
                  </p>
                  <LoginForm />
                </div>
              </TabsContent>
              <TabsContent value="register">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Si es tu primera compra, usa el código que recibiste en tu email.
                  </p>
                  <RegisterForm />
                </div>
              </TabsContent>
            </Tabs>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
