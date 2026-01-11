# Seguridad

Este documento describe las medidas de seguridad implementadas en la plataforma de venta de productos digitales.

## Tabla de Contenidos

1. [Rate Limiting](#rate-limiting)
2. [Validaciones de Entrada](#validaciones-de-entrada)
3. [Headers de Seguridad](#headers-de-seguridad)
4. [Protección Anti-Bot](#protección-anti-bot)
5. [Autenticación y Autorización](#autenticación-y-autorización)
6. [Manejo de Errores](#manejo-de-errores)
7. [Seguridad de Archivos](#seguridad-de-archivos)
8. [Webhooks](#webhooks)
9. [Mejores Prácticas](#mejores-prácticas)

---

## Rate Limiting

### Implementación

El rate limiting está implementado en el middleware (`src/middleware.ts`) usando un sistema en memoria compatible con edge runtime.

**Archivo**: `src/lib/security/rate-limit.ts`

### Límites Configurados

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/payments/create-preference` | 3 requests | 5 minutos |
| `/api/downloads/*` | 5 requests | 1 hora |
| `/api/payments/webhook` | 100 requests | 1 minuto |
| Otros endpoints `/api/*` | 60 requests | 1 minuto |

### Headers de Respuesta

Cuando se alcanza el límite, se retorna status `429 Too Many Requests` con los siguientes headers:

```
X-RateLimit-Limit: <máximo de requests>
X-RateLimit-Remaining: <requests restantes>
X-RateLimit-Reset: <timestamp de reset>
Retry-After: <segundos hasta reset>
```

### Identificación de Clientes

El rate limiting identifica clientes por IP usando los siguientes headers (en orden de prioridad):

1. `cf-connecting-ip` (Cloudflare)
2. `x-forwarded-for`
3. `x-real-ip`

---

## Validaciones de Entrada

### Zod Schemas

Todas las entradas de usuario son validadas con Zod antes de procesarse.

**Archivos**:
- `src/lib/validations/auth.ts` - Login y registro
- `src/lib/validations/products.ts` - Productos
- `src/lib/validations/payments.ts` - Pagos

### Validaciones de Autenticación

**Login**:
```typescript
- email: string válido
- password: mínimo 1 carácter
- turnstileToken: requerido
```

**Registro**:
```typescript
- email: string válido
- purchaseCode: exactamente 12 caracteres alfanuméricos (A-Z, 0-9)
- password: entre 8-100 caracteres
- turnstileToken: requerido
```

### Validaciones de Productos

**Creación/Actualización**:
```typescript
- name: 1-200 caracteres
- slug: solo minúsculas, números y guiones
- description: máximo 2000 caracteres
- price: 0 - 1,000,000,000
- currency: USD, ARS, MXN, CLP, COP, PEN, UYU, BRL
- fileKey: requerido
- fileName: 1-255 caracteres
- fileSize: máximo 5GB
- imageUrl: URL válida (opcional)
```

### Validaciones de Pagos

```typescript
- productId: requerido
- buyerEmail: email válido
- turnstileToken: requerido
```

---

## Headers de Seguridad

Los siguientes headers se aplican a todas las respuestas vía middleware:

### Headers Implementados

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

### Content Security Policy (CSP)

```csp
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://sdk.mercadopago.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https://api.mercadopago.com https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com https://www.mercadopago.com;
object-src 'none';
base-uri 'self';
form-action 'self' https://www.mercadopago.com;
frame-ancestors 'none';
upgrade-insecure-requests;
```

**Nota**: Los `'unsafe-inline'` y `'unsafe-eval'` son necesarios para el SDK de Mercado Pago y Turnstile. En producción, considera usar nonces para mayor seguridad.

---

## Protección Anti-Bot

### Cloudflare Turnstile

Implementado en los siguientes puntos:

1. **Pre-checkout**: Antes de crear preferencia de Mercado Pago
2. **Login**: Al iniciar sesión
3. **Registro**: Al crear cuenta

**Archivo**: `src/lib/auth/turnstile.ts`

### Validación Server-Side

Todos los tokens de Turnstile se validan en el servidor antes de procesar la solicitud:

```typescript
const turnstileValidation = await validateTurnstile(turnstileToken);
if (!turnstileValidation.success) {
  throw ErrorResponses.forbidden('Bot detection failed');
}
```

### Variables de Entorno

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site_key>  # Cliente
TURNSTILE_SECRET_KEY=<secret_key>           # Servidor
```

---

## Autenticación y Autorización

### Auth.js v5

**Archivo**: `src/lib/auth/auth.ts`

### Providers

1. **Credentials Login**: Email + Password + Turnstile
2. **Credentials Register**: Email + Purchase Code + Password + Turnstile

### Passwords

- Hasheados con `bcryptjs`
- Mínimo 8 caracteres
- Almacenados de forma segura en la base de datos

### Sesiones

- JWT sessions (edge compatible)
- httpOnly cookies
- CSRF protection integrado en Auth.js

### Roles

- `user`: Usuario normal (default)
- `admin`: Administrador (acceso a panel admin)

### Rutas Protegidas

**Middleware** (`src/middleware.ts`):

- `/dashboard/*` - Requiere autenticación
- `/admin/*` - Requiere rol de admin

### Purchase Codes

- Un solo uso para registro
- 12 caracteres alfanuméricos
- Marcados como `usedForRegistration` al crear cuenta
- Validación de email match al registrar

---

## Manejo de Errores

### Error Handler Centralizado

**Archivo**: `src/lib/utils/error-handler.ts`

### Tipos de Errores

```typescript
ApiError - Errores personalizados con status code
ZodError - Errores de validación automáticos
Error - Errores genéricos de JavaScript
```

### Respuestas de Error

Formato consistente en todos los endpoints:

```json
{
  "error": "Mensaje de error",
  "details": {} // Opcional, para errores de validación
}
```

### Errores de Validación Zod

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### Logging

- Todos los errores se logean en consola con `console.error()`
- No se exponen detalles internos al cliente
- Mensajes genéricos para errores 500

---

## Seguridad de Archivos

### R2 Storage (S3-compatible)

**Archivo**: `src/lib/r2/download.ts`

### Bucket Privado

- El bucket de R2 es privado
- No se permite acceso directo público
- Solo acceso vía presigned URLs

### Presigned URLs

**Upload** (Admin):
```typescript
- Expira en 1 hora
- Solo método PUT
- Content-Type específico
```

**Download** (Usuario):
```typescript
- Expira en 1 hora
- Solo método GET
- Generado bajo demanda tras validaciones
```

### Validaciones de Descarga

Antes de generar presigned URL:

1. ✅ Token de descarga válido
2. ✅ Token no expirado
3. ✅ Límite de descargas no excedido
4. ✅ Ownership verificado (para descargas posteriores)
5. ✅ IP y User-Agent tracking

### Límites

- Expiración: Configurable vía `DOWNLOAD_LINK_EXPIRY_HOURS` (default: 48h)
- Descargas: Configurable vía `MAX_DOWNLOADS_PER_PURCHASE` (default: 5)

---

## Webhooks

### Mercado Pago Webhook

**Archivo**: `src/app/api/payments/webhook/route.ts`

### Validación de Firma HMAC SHA256

**Archivo**: `src/lib/mercadopago/webhook.ts`

```typescript
// Usando Web Crypto API (edge compatible)
const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
```

### Idempotencia

Se verifica que el `mpPaymentId` no exista antes de crear la compra:

```typescript
const existingPurchase = await getPurchaseByPaymentId(db, paymentId);
if (existingPurchase) {
  return NextResponse.json({ received: true }, { status: 200 });
}
```

### Headers Requeridos

- `x-signature`: Firma HMAC
- `x-request-id`: ID único del request

### Variable de Entorno

```bash
MERCADOPAGO_WEBHOOK_SECRET=<secret>
```

**⚠️ Importante**: Este secret debe configurarse en el dashboard de Mercado Pago.

---

## Mejores Prácticas

### ✅ Implementadas

- Rate limiting en endpoints sensibles
- Validación de entrada con Zod
- Headers de seguridad estrictos
- Protección anti-bot con Turnstile
- Passwords hasheados con bcrypt
- CSRF protection (Auth.js)
- JWT sessions con httpOnly cookies
- HMAC signature validation para webhooks
- Presigned URLs con expiración corta
- Bucket privado para archivos
- Tracking de descargas (IP, User-Agent)
- Error handling centralizado
- Logs de errores sin exponer detalles internos

### 🔒 Recomendaciones Adicionales

Para producción:

1. **Environment Variables**:
   - Usar secrets management (Cloudflare Secrets, AWS Secrets Manager)
   - Nunca commitear `.env.local`
   - Rotar secretos regularmente

2. **Monitoring**:
   - Implementar logging centralizado (Sentry, LogRocket)
   - Alertas para errores 500
   - Monitoreo de rate limiting

3. **CSP**:
   - Considerar usar nonces en lugar de `'unsafe-inline'`
   - Remover `'unsafe-eval'` si es posible

4. **HTTPS**:
   - Forzar HTTPS en producción
   - HSTS header para prevenir downgrade attacks

5. **Database**:
   - Backups automáticos de D1
   - Prepared statements (Drizzle ORM ya los usa)

6. **Dependencies**:
   - Auditoría regular con `npm audit`
   - Actualizar dependencias con vulnerabilidades

7. **2FA**:
   - Considerar implementar autenticación de dos factores para admins

8. **IP Whitelisting**:
   - Para panel admin, considerar whitelist de IPs

---

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** la publiques públicamente
2. Envía un email a: security@juliethgarcia.com
3. Incluye:
   - Descripción detallada del problema
   - Pasos para reproducirlo
   - Impacto potencial
   - Sugerencias de remediación (opcional)

Responderemos en un plazo de 48 horas.

---

## Última Actualización

Fecha: Enero 2026
Versión: 1.0.0
