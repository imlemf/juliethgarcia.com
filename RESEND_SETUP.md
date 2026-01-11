# Configuración de Resend para Emails

## Paso 1: Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

## Paso 2: Configurar dominio (Recomendado para producción)

### Opción A: Usar tu propio dominio (Producción)

1. Ve a la sección "Domains" en el dashboard de Resend
2. Haz clic en "Add Domain"
3. Ingresa tu dominio (ej: `juliethgarcia.com`)
4. Resend te proporcionará registros DNS que debes agregar:
   - `TXT` record para verificación
   - `MX` records para recibir emails
   - `DKIM` records para autenticación
5. Agrega estos registros en tu proveedor de DNS (Cloudflare)
6. Espera la verificación (puede tomar hasta 24 horas)
7. Una vez verificado, usa emails como: `noreply@juliethgarcia.com`

### Opción B: Usar dominio onboarding (Solo desarrollo/testing)

1. Resend proporciona un dominio temporal: `onboarding.resend.dev`
2. **Limitación**: Solo puedes enviar a emails verificados
3. Para testing: Verifica tu email personal en "Audiences" → "Add Email"
4. Emails desde: `delivered@resend.dev`

## Paso 3: Obtener API Key

1. Ve a "API Keys" en el dashboard
2. Haz clic en "Create API Key"
3. Dale un nombre: "Production API Key" o "Development API Key"
4. Selecciona permisos: "Sending access"
5. Copia la API key (solo se muestra una vez)

## Paso 4: Configurar variables de entorno

Actualiza tu archivo `.env.local`:

```bash
# Para producción (con dominio propio)
RESEND_API_KEY=re_123456789...
EMAIL_FROM=noreply@juliethgarcia.com

# Para desarrollo (con dominio onboarding)
RESEND_API_KEY=re_123456789...
EMAIL_FROM=delivered@resend.dev
```

## Paso 5: Testing

### Test local (Desarrollo)

1. Asegúrate de que `RESEND_API_KEY` esté configurada
2. Si usas dominio onboarding, verifica tu email en Resend
3. Ejecuta tu aplicación: `npm run dev`
4. Simula una compra o usa el webhook de Mercado Pago
5. Verifica que el email llegue

### Test con simulación directa

Crea un archivo temporal para testear:

```typescript
// test-email.ts
import { sendPurchaseEmail } from '@/lib/email/send';

await sendPurchaseEmail({
  to: 'tu-email@ejemplo.com', // Debe estar verificado si usas onboarding
  productName: 'Producto de prueba',
  productDescription: 'Descripción del producto',
  purchaseCode: 'TEST123ABC',
  downloadToken: 'test-token-123',
  amount: 9900, // $99.00 en centavos
  currency: 'USD',
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
  maxDownloads: 5,
});
```

## Paso 6: Monitoreo

1. Ve a "Logs" en el dashboard de Resend
2. Verás todos los emails enviados con su estado:
   - ✅ Delivered: Email entregado exitosamente
   - ⏳ Queued: En cola de envío
   - ❌ Failed: Falló el envío (revisa el error)
   - 🔄 Bounced: Email rebotó (dirección inválida)

## Límites del plan gratuito

- **100 emails/día**
- **3,000 emails/mes**
- Solo 1 dominio verificado
- API access
- Support por email

Para producción con alto volumen, considera el plan Pro ($20/mes):
- 50,000 emails/mes
- Dominios ilimitados
- Analytics avanzado
- Priority support

## Troubleshooting

### Email no llega

1. Verifica en "Logs" de Resend el estado del email
2. Revisa spam/junk en tu bandeja de entrada
3. Si usas dominio onboarding, asegúrate de que el email destino esté verificado
4. Verifica que `RESEND_API_KEY` sea correcta

### Error "Domain not verified"

1. Ve a "Domains" y verifica el estado
2. Asegúrate de haber agregado todos los registros DNS
3. Espera hasta 24 horas para la propagación DNS
4. Usa `nslookup` para verificar registros: `nslookup -type=TXT yourdomain.com`

### Email cae en spam

1. Asegúrate de tener dominio verificado (no usar onboarding)
2. Configura correctamente registros SPF, DKIM, DMARC
3. Evita palabras spam en el asunto
4. Mantén una buena reputación de envío

## Recursos

- [Documentación de Resend](https://resend.com/docs)
- [Verificación de dominio](https://resend.com/docs/dashboard/domains/introduction)
- [React Email Templates](https://react.email/docs/introduction)
- [Best practices](https://resend.com/docs/knowledge-base/best-practices)
