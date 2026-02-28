import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

interface AuthRequiredTabsProps {
  redirectTo: string;
}

export function AuthRequiredTabs({ redirectTo }: AuthRequiredTabsProps) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <svg
            className="h-10 w-10 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <CardTitle className="text-2xl">Autenticación requerida</CardTitle>
        <CardDescription>
          Para descargar este archivo necesitas iniciar sesión o crear una cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <LoginForm redirectTo={redirectTo} />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 mb-4">
              <p className="text-sm text-green-900 dark:text-green-100">
                <span className="font-semibold">¿Primera vez?</span>
                <br />
                Crea tu cuenta usando el código de compra que recibiste por email. Este código
                solo se usa una vez para crear tu cuenta.
              </p>
            </div>
            <RegisterForm redirectTo={redirectTo} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
