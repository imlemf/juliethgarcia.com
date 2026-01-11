# Guía de Deploy a Cloudflare Pages

Esta guía detalla cómo desplegar la plataforma de venta de productos digitales a Cloudflare Pages.

## Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Configuración de Cloudflare](#configuración-de-cloudflare)
3. [Configuración de Servicios Externos](#configuración-de-servicios-externos)
4. [Deploy a Cloudflare Pages](#deploy-a-cloudflare-pages)
5. [Post-Deploy](#post-deploy)
6. [Verificación](#verificación)
7. [Troubleshooting](#troubleshooting)

---

## Pre-requisitos

### 1. Cuenta de Cloudflare

- Crear cuenta en [dash.cloudflare.com](https://dash.cloudflare.com)
- Verificar email
- Tener un dominio (opcional pero recomendado)

### 2. Repositorio Git

Asegúrate de que tu código esté en un repositorio Git (GitHub, GitLab, o Bitbucket):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repo-url>
git push -u origin main
```

### 3. Dependencias Instaladas

```bash
npm install
```

---

## Configuración de Cloudflare

### Paso 1: Habilitar R2 Storage

1. Ve a **R2** en el dashboard de Cloudflare
2. Haz clic en "Purchase R2"
3. Acepta los términos (plan gratuito incluye 10GB de almacenamiento)

### Paso 2: Crear R2 Bucket

```bash
# Opción 1: Desde el dashboard
# R2 → Create bucket → Nombre: "digital-products"

# Opción 2: Con Wrangler CLI
npx wrangler r2 bucket create digital-products
```

**Configuración del bucket**:
- Nombre: `digital-products`
- Ubicación: Automático (Cloudflare elige el más cercano)
- Storage class: Standard

### Paso 3: Generar R2 API Keys

1. Ve a **R2** → **Manage R2 API Tokens**
2. Clic en "Create API token"
3. Configuración:
   - **Token name**: `ecommerce-r2-access`
   - **Permissions**: Admin Read & Write
   - **TTL**: Never expires (o personalizado)
4. Guarda las credenciales:
   - `Access Key ID`
   - `Secret Access Key`

### Paso 4: Verificar D1 Database

La base de datos D1 ya fue creada durante el desarrollo:

```bash
# Verificar que existe
npx wrangler d1 list

# Debería mostrar:
# database_id: e9bf7dca-a5a5-4942-ac1f-fbcf11cb60ea
# name: ecommerce-db
```

### Paso 5: Migrar Schema a Producción

```bash
# Aplicar migraciones a la base de datos de producción
npx wrangler d1 migrations apply ecommerce-db --remote
```

**IMPORTANTE**: Esto aplicará todas las migraciones en `drizzle` a la base de datos de producción.

---

## Configuración de Servicios Externos

### 1. Mercado Pago

#### Crear Aplicación

1. Ve a [developers.mercadopago.com](https://www.mercadopago.com/developers)
2. **Tus aplicaciones** → **Crear aplicación**
3. Nombre: "Julieth Garcia E-commerce"
4. **Producto**: Checkout Pro (pagos)

#### Obtener Credenciales

**Modo Producción**:
1. Ve a **Credenciales de producción**
2. Copia:
   - `Public Key` → `MERCADOPAGO_PUBLIC_KEY`
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`

**Configurar Webhook**:
1. Ve a **Webhooks**
2. URL: `https://tudominio.com/api/payments/webhook`
3. Eventos: Selecciona "Payments"
4. Guarda el **Webhook Secret** → `MERCADOPAGO_WEBHOOK_SECRET`

### 2. Resend (Emails)

Ver guía completa: [RESEND_SETUP.md](./RESEND_SETUP.md)

1. Crear cuenta en [resend.com](https://resend.com)
2. **Domains** → Agregar tu dominio
3. Configurar registros DNS en Cloudflare
4. Esperar verificación
5. **API Keys** → Create API Key
6. Guardar: `RESEND_API_KEY`

### 3. Cloudflare Turnstile

1. Ve a **Turnstile** en dashboard de Cloudflare
2. **Add site**
3. Configuración:
   - **Site name**: "Julieth Garcia Ecommerce"
   - **Domain**: `tudominio.com`
   - **Widget Mode**: Managed
4. Guarda:
   - `Site Key` → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `Secret Key` → `TURNSTILE_SECRET_KEY`

### 4. Auth.js Secret

Genera un secret aleatorio:

```bash
openssl rand -base64 32
```

Guarda el resultado en `AUTH_SECRET`.

---

## Deploy a Cloudflare Pages

### Opción 1: Desde el Dashboard (Recomendado)

#### 1. Conectar Repositorio

1. Ve a **Pages** en el dashboard de Cloudflare
2. Clic en **Create a project**
3. Selecciona **Connect to Git**
4. Autoriza GitHub/GitLab/Bitbucket
5. Selecciona tu repositorio

#### 2. Configurar Build

**Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/` (default)

**Environment variables** (agrega todas):

```bash
# Auth.js
AUTH_SECRET=<tu-secret-generado>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://tudominio.com

# Cloudflare (se autocompletan)
CLOUDFLARE_ACCOUNT_ID=<auto>
CLOUDFLARE_D1_DATABASE_ID=e9bf7dca-a5a5-4942-ac1f-fbcf11cb60ea

# R2 Storage
R2_BUCKET_NAME=digital-products
R2_ACCESS_KEY_ID=<tu-r2-access-key>
R2_SECRET_ACCESS_KEY=<tu-r2-secret-key>
R2_ACCOUNT_ID=<tu-cloudflare-account-id>

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=<tu-access-token>
MERCADOPAGO_PUBLIC_KEY=<tu-public-key>
MERCADOPAGO_WEBHOOK_SECRET=<tu-webhook-secret>

# Resend
RESEND_API_KEY=<tu-resend-api-key>
EMAIL_FROM=noreply@tudominio.com

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<tu-site-key>
TURNSTILE_SECRET_KEY=<tu-secret-key>

# App Config
NEXT_PUBLIC_APP_URL=https://tudominio.com
DOWNLOAD_LINK_EXPIRY_HOURS=48
MAX_DOWNLOADS_PER_PURCHASE=5
```

#### 3. Configurar Bindings

En **Settings** → **Functions**:

**D1 Databases**:
- Variable name: `DB`
- D1 database: `ecommerce-db`

**R2 Buckets** (después de crear el bucket):
- Variable name: `R2_BUCKET`
- R2 bucket: `digital-products`

#### 4. Deploy

1. Clic en **Save and Deploy**
2. Cloudflare construirá y desplegará tu aplicación
3. Espera a que termine (3-5 minutos)

#### 5. Configurar Dominio Personalizado

1. Ve a **Custom domains**
2. Clic en **Set up a custom domain**
3. Ingresa tu dominio: `tudominio.com`
4. Cloudflare configurará automáticamente los registros DNS
5. Espera propagación (puede tomar hasta 24 horas)

### Opción 2: Desde CLI con Wrangler

```bash
# 1. Login
npx wrangler login

# 2. Deploy
npx wrangler pages deploy .vercel/output/static --project-name=juliethgarcia-ecommerce

# 3. Configurar environment variables
npx wrangler pages secret put AUTH_SECRET --project-name=juliethgarcia-ecommerce
# Repite para cada variable...

# 4. Configurar bindings
# Esto se hace desde el dashboard (Settings → Functions)
```

---

## Post-Deploy

### 1. Crear Usuario Admin

Como las cuentas se crean solo con código de compra, necesitas crear el primer admin manualmente:

**Opción A: Vía D1 Console**

1. Ve a **D1** → `ecommerce-db` → **Console**
2. Ejecuta:

```sql
-- Primero crea un usuario (reemplaza con tus datos)
INSERT INTO users (id, email, password, role, createdAt, updatedAt)
VALUES (
  'admin-001',
  'admin@tudominio.com',
  '$2a$10$<hash-de-password>',  -- Ver nota abajo
  'admin',
  datetime('now'),
  datetime('now')
);
```

**Generar hash de password**:

```bash
# En Node.js
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-password', 10));"
```

**Opción B: Compra de Prueba**

1. Realiza una compra de prueba con tu email
2. Registra tu cuenta usando el código de compra
3. Actualiza el rol a admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
```

### 2. Crear Producto de Prueba

1. Inicia sesión como admin
2. Ve a `/admin/products`
3. Clic en "Nuevo Producto"
4. Sube un archivo de prueba
5. Completa todos los campos
6. Activa el producto

### 3. Configurar Webhook de Mercado Pago

1. Ve a tu aplicación en [developers.mercadopago.com](https://www.mercadopago.com/developers)
2. **Webhooks** → **Configurar**
3. **URL**: `https://tudominio.com/api/payments/webhook`
4. **Eventos**: Payment (payments)
5. Guarda

### 4. Probar Email con Resend

1. Ve al dashboard de Resend
2. Envía un email de prueba
3. Verifica que llegue correctamente
4. Si usas dominio personalizado, asegúrate de que esté verificado

---

## Verificación

### Checklist de Funcionalidad

Ejecuta esta verificación end-to-end en producción:

#### ✅ Navegación

- [ ] Página de inicio carga correctamente
- [ ] Listado de productos funciona
- [ ] Página de detalle de producto se abre

#### ✅ Autenticación

- [ ] Login funciona
- [ ] Registro con código funciona
- [ ] Logout funciona
- [ ] Turnstile se muestra y valida

#### ✅ Admin Panel

- [ ] Admin puede acceder a `/admin`
- [ ] Crear producto funciona
- [ ] Upload de archivo a R2 funciona
- [ ] Editar producto funciona
- [ ] Ver lista de compras funciona

#### ✅ Checkout y Pago

- [ ] Pre-checkout muestra Turnstile
- [ ] Crear preferencia de MP funciona
- [ ] Redirección a Mercado Pago funciona
- [ ] Pago de prueba se procesa

#### ✅ Webhook

- [ ] Webhook recibe notificación de MP
- [ ] Validación de firma HMAC funciona
- [ ] Purchase se crea en DB
- [ ] Download link se crea
- [ ] Email se envía correctamente

#### ✅ Descargas

- [ ] Link del email funciona
- [ ] Primera descarga sin auth funciona
- [ ] Archivo se descarga desde R2
- [ ] Segunda descarga requiere auth
- [ ] Dashboard muestra compras
- [ ] Límites de descarga funcionan
- [ ] Expiración se valida

#### ✅ Seguridad

- [ ] HTTPS está activo
- [ ] Headers de seguridad están presentes
- [ ] Rate limiting funciona (hacer 4+ requests rápidos)
- [ ] CSP no bloquea Turnstile/MP
- [ ] Rutas protegidas redirigen a login

### Testing con Mercado Pago

**Credenciales de prueba**:

1. Ve a **Credenciales de prueba** en MP
2. Usa las credenciales de prueba para testing
3. Tarjetas de prueba:

```
Aprobada: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
Nombre: APRO
DNI: 12345678
```

Ver más tarjetas: [Mercado Pago Test Cards](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/integration-test/test-cards)

---

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- Verificar que todas las dependencias estén en `package.json`
- `npm install` localmente
- Commit `package-lock.json`

**Error**: "Edge runtime not compatible"
- Verificar que todos los archivos tengan `export const runtime = 'edge'`
- No usar módulos de Node.js (fs, path, etc)

### Database Errors

**Error**: "D1 binding not found"
- Ve a Settings → Functions → D1 Databases
- Agrega binding: `DB` → `ecommerce-db`
- Redeploy

**Error**: "Table does not exist"
- Ejecuta migraciones remotas:
  ```bash
  npx wrangler d1 migrations apply ecommerce-db --remote
  ```

### R2 Errors

**Error**: "R2 bucket not found"
- Verifica que el bucket existe: `npx wrangler r2 bucket list`
- Agrega binding en Settings → Functions → R2 Buckets
- Verifica `R2_BUCKET_NAME` en env vars

**Error**: "Access denied"
- Verifica credenciales R2 (Access Key ID y Secret)
- Regenera API token si es necesario

### Email Errors

**Error**: "Domain not verified"
- Ve a Resend dashboard
- Verifica que todos los registros DNS estén agregados
- Espera hasta 24h para propagación

**Error**: "Email not sent"
- Revisa logs en Resend dashboard
- Verifica `RESEND_API_KEY`
- Si usas `onboarding.resend.dev`, verifica que el email destino esté verificado

### Webhook Errors

**Error**: "Invalid signature"
- Verifica `MERCADOPAGO_WEBHOOK_SECRET` coincide con MP dashboard
- Asegúrate de que la URL del webhook termine en `/api/payments/webhook`
- Revisa logs de Cloudflare Pages

**Error**: "Webhook not received"
- Verifica URL en Mercado Pago dashboard
- Asegúrate de que HTTPS esté activo
- Revisa que el evento "Payment" esté seleccionado

### Turnstile Errors

**Error**: "Invalid site key"
- Verifica `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Asegúrate de que el dominio coincida con el configurado en Turnstile

**Error**: "Verification failed"
- Verifica `TURNSTILE_SECRET_KEY`
- Asegúrate de que el widget se esté renderizando correctamente

### Rate Limiting Issues

**Error**: "Too many requests"
- Es normal si estás testeando rápido
- Espera el tiempo indicado en `Retry-After` header
- En desarrollo, los límites se resetean al reiniciar

---

## Logs y Monitoreo

### Ver Logs en Tiempo Real

```bash
# Logs de Pages
npx wrangler pages deployment tail --project-name=juliethgarcia-ecommerce

# Logs de D1
npx wrangler d1 execute ecommerce-db --remote --command="SELECT * FROM purchases ORDER BY createdAt DESC LIMIT 10"
```

### Dashboard de Cloudflare

1. **Pages** → `juliethgarcia-ecommerce` → **Deployments**
2. Ver logs de cada deployment
3. **Analytics** para métricas de tráfico

### Resend Dashboard

- Ve a **Logs** para ver emails enviados
- Filtra por status: Delivered, Bounced, Failed

### Mercado Pago Dashboard

- Ve a **Actividad** para ver pagos
- **Webhooks** → **Logs** para debugging

---

## Rollback

Si algo sale mal:

### Opción 1: Rollback desde Dashboard

1. Ve a **Pages** → **Deployments**
2. Encuentra el deployment anterior que funcionaba
3. Clic en "..." → **Rollback to this deployment**

### Opción 2: Revertir con Git

```bash
git revert HEAD
git push origin main
# Cloudflare auto-redeploya
```

---

## Actualización de la App

Para deployar nuevas versiones:

```bash
# 1. Hacer cambios
git add .
git commit -m "Update: descripción de cambios"

# 2. Push
git push origin main

# 3. Cloudflare Pages auto-deploya
# Ve al dashboard para ver el progreso
```

**Nota**: Los deployments automáticos están habilitados por default. Cada push a `main` dispara un nuevo build.

---

## Backups

### Base de Datos D1

```bash
# Exportar a SQL
npx wrangler d1 export ecommerce-db --remote --output=backup-$(date +%Y%m%d).sql

# Ejecutar regularmente (ej: cada semana)
```

### Archivos R2

```bash
# Listar archivos
npx wrangler r2 object list digital-products

# Descargar archivo específico
npx wrangler r2 object get digital-products/<file-key> --file=<local-path>
```

**Recomendación**: Configurar backups automáticos usando Cloudflare Workers cron triggers.

---

## Costos Estimados

### Cloudflare Pages

- **Gratis** hasta:
  - 500 builds/mes
  - 100,000 requests/día
  - Bandwidth ilimitado

### Cloudflare D1

- **Gratis** hasta:
  - 5M read rows/día
  - 100K write rows/día
  - 5 GB storage

### Cloudflare R2

- **Gratis** hasta:
  - 10 GB storage
  - 1M Class A operations/mes (writes)
  - 10M Class B operations/mes (reads)
  - Egress ilimitado

### Resend

- **Gratis** hasta:
  - 100 emails/día
  - 3,000 emails/mes

### Mercado Pago

- Comisión por transacción (varía por país)
- Argentina: ~5.4% + $5 ARS
- México: ~3.6% + $3 MXN
- Ver [comisiones completas](https://www.mercadopago.com.ar/costs-section)

**Para apps pequeñas/medianas, todo es GRATIS dentro de los límites.**

---

## Soporte

- **Cloudflare**: [community.cloudflare.com](https://community.cloudflare.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Mercado Pago**: [developers.mercadopago.com](https://www.mercadopago.com/developers/es/support)
- **Resend**: [resend.com/docs](https://resend.com/docs)

---

## Última Actualización

Fecha: Enero 2026
Versión: 1.0.0
