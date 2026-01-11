# Pre-Deploy Checklist

Lista de verificación **OBLIGATORIA** antes de hacer deploy a producción.

## 🔐 Seguridad

### Secrets y Variables de Entorno

- [ ] **AUTH_SECRET** generado con `openssl rand -base64 32`
- [ ] **MERCADOPAGO_WEBHOOK_SECRET** configurado (no usar el de prueba)
- [ ] **R2_SECRET_ACCESS_KEY** rotado si fue comprometido
- [ ] **RESEND_API_KEY** de producción (no desarrollo)
- [ ] **.env.local** está en `.gitignore` (NUNCA commitear secrets)
- [ ] Ningún secret hardcodeado en el código

### Validaciones

- [ ] Todos los endpoints tienen validación Zod
- [ ] Turnstile configurado en checkout y auth
- [ ] Rate limiting activado en middleware
- [ ] Headers de seguridad configurados (CSP, X-Frame-Options, etc)

### Auth y Permisos

- [ ] CSRF protection habilitado (Auth.js default)
- [ ] Rutas `/admin` protegidas con rol check
- [ ] Rutas `/dashboard` requieren autenticación
- [ ] Passwords hasheados con bcrypt (min 8 caracteres)

---

## 🗄️ Base de Datos

### D1 Database

- [ ] Database creado: `ecommerce-db`
- [ ] Database ID agregado a `wrangler.toml`
- [ ] Migraciones aplicadas con `npx wrangler d1 migrations apply ecommerce-db --remote`
- [ ] Verificar tablas existen:
  ```sql
  SELECT name FROM sqlite_master WHERE type='table';
  ```
- [ ] Al menos un usuario admin creado (ver DEPLOY.md)

### Schema Validation

```bash
# Verificar schema localmente
npm run db:generate
npm run db:migrate
```

- [ ] Sin errores en migraciones
- [ ] Relaciones funcionan correctamente
- [ ] Índices creados para queries frecuentes

---

## 📦 R2 Storage

### Bucket Configuration

- [ ] R2 habilitado en Cloudflare account
- [ ] Bucket creado: `digital-products`
- [ ] Bucket es PRIVADO (no public access)
- [ ] API keys generadas (Access Key ID + Secret)
- [ ] Binding configurado en Pages: `R2_BUCKET`

### Testing

- [ ] Upload de archivo funciona localmente
- [ ] Presigned URLs generan correctamente
- [ ] Download funciona con presigned URL
- [ ] URLs expiran después del tiempo configurado

---

## 💳 Mercado Pago

### Credenciales

- [ ] Aplicación creada en [developers.mercadopago.com](https://www.mercadopago.com/developers)
- [ ] Producto seleccionado: Checkout Pro
- [ ] **Credenciales de producción** obtenidas:
  - [ ] `MERCADOPAGO_PUBLIC_KEY`
  - [ ] `MERCADOPAGO_ACCESS_TOKEN`
- [ ] **NO** usar credenciales de prueba en producción

### Webhook

- [ ] URL configurada: `https://tudominio.com/api/payments/webhook`
- [ ] Evento "Payment" seleccionado
- [ ] Webhook Secret guardado: `MERCADOPAGO_WEBHOOK_SECRET`
- [ ] Validación HMAC funciona (test con pago de prueba primero)

### Testing

- [ ] Pago de prueba completado exitosamente (con credenciales de prueba)
- [ ] Webhook recibido y procesado
- [ ] Purchase creado en DB
- [ ] Email enviado
- [ ] Download link generado

---

## 📧 Resend (Emails)

### Dominio

- [ ] Dominio agregado en Resend dashboard
- [ ] Registros DNS configurados en Cloudflare:
  - [ ] TXT record (verificación)
  - [ ] MX records
  - [ ] DKIM records
- [ ] Dominio verificado ✓ en Resend
- [ ] **NO** usar `onboarding.resend.dev` en producción

### API Key

- [ ] API Key de producción generada
- [ ] Permisos: Sending access
- [ ] `EMAIL_FROM` usa tu dominio: `noreply@tudominio.com`

### Testing

- [ ] Email de prueba enviado y recibido
- [ ] Email NO cae en spam
- [ ] Template se renderiza correctamente
- [ ] Links en email funcionan

---

## 🔒 Cloudflare Turnstile

### Site Configuration

- [ ] Site creado en Turnstile dashboard
- [ ] Dominio correcto: `tudominio.com`
- [ ] Widget mode: Managed (recomendado)
- [ ] Keys obtenidas:
  - [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - [ ] `TURNSTILE_SECRET_KEY`

### Integration

- [ ] Widget se renderiza en checkout
- [ ] Widget se renderiza en login/registro
- [ ] Validación server-side funciona
- [ ] Fallback en caso de error de red

---

## 🏗️ Build y Deploy

### Next.js Build

```bash
npm run build
```

- [ ] Build completa sin errores
- [ ] Sin warnings críticos de TypeScript
- [ ] Bundle size razonable (<500KB first load JS)
- [ ] Todas las rutas generan correctamente

### Wrangler Configuration

- [ ] `wrangler.toml` configurado:
  - [ ] `compatibility_date` actualizado
  - [ ] D1 binding correcto
  - [ ] R2 binding descomentado (después de crear bucket)
- [ ] Database ID correcto: `e9bf7dca-a5a5-4942-ac1f-fbcf11cb60ea`

### Environment Variables

Verificar que TODAS estén configuradas en Cloudflare Pages:

```bash
AUTH_SECRET
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://tudominio.com

CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_D1_DATABASE_ID

R2_BUCKET_NAME=digital-products
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ACCOUNT_ID

MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY
MERCADOPAGO_WEBHOOK_SECRET

RESEND_API_KEY
EMAIL_FROM=noreply@tudominio.com

NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY

NEXT_PUBLIC_APP_URL=https://tudominio.com
DOWNLOAD_LINK_EXPIRY_HOURS=48
MAX_DOWNLOADS_PER_PURCHASE=5
```

- [ ] Todas las variables configuradas
- [ ] URLs usan HTTPS (no HTTP)
- [ ] Emails usan dominio verificado

---

## 🌐 Dominio y DNS

### Cloudflare DNS

- [ ] Dominio agregado a Cloudflare
- [ ] Nameservers apuntan a Cloudflare
- [ ] SSL/TLS configurado: Full (strict)
- [ ] Always Use HTTPS habilitado

### Pages Custom Domain

- [ ] Custom domain agregado en Pages
- [ ] DNS records autocreados
- [ ] HTTPS certificate emitido
- [ ] Redirección www → apex (o viceversa) configurada

---

## 🧪 Testing Local

Antes de deploy, verifica localmente:

### Funcionalidad Básica

```bash
npm run dev
```

- [ ] Homepage carga
- [ ] Login funciona
- [ ] Registro con código funciona
- [ ] Admin panel accesible
- [ ] Crear producto funciona
- [ ] Upload de archivos funciona

### Edge Runtime Compatibility

- [ ] Todos los API routes tienen `export const runtime = 'edge'`
- [ ] No se usa módulos de Node.js (fs, path, crypto.createHmac)
- [ ] Todas las funciones son edge-compatible

### Security

- [ ] CSP no rompe la app (ver consola del navegador)
- [ ] Turnstile se muestra correctamente
- [ ] Rate limiting funciona (probar múltiples requests)

---

## 📊 Monitoring Setup

### Post-Deploy

- [ ] Configurar Cloudflare Analytics
- [ ] Agregar Sentry (opcional pero recomendado)
- [ ] Configurar alertas de errores
- [ ] Logs accesibles vía `wrangler pages deployment tail`

---

## 📝 Documentación

### README

- [ ] Instrucciones de desarrollo actualizadas
- [ ] Variables de entorno documentadas
- [ ] Comandos útiles listados

### Backups

- [ ] Plan de backup de D1 definido
- [ ] Script de backup de R2 (opcional)
- [ ] Frecuencia de backups documentada

---

## ✅ Final Verification

### Antes de Deploy

- [ ] Todas las checkboxes anteriores marcadas
- [ ] Código commiteado a Git
- [ ] Tests pasando (si existen)
- [ ] Changelog actualizado

### Deploy Checklist

1. [ ] Push código a repositorio
2. [ ] Cloudflare Pages auto-deploya
3. [ ] Verificar build exitoso en dashboard
4. [ ] Esperar DNS propagation (si es primer deploy)
5. [ ] Probar en producción (ver sección siguiente)

---

## 🔍 Post-Deploy Testing

### Verificación en Producción

#### Navegación y UI

- [ ] Homepage: `https://tudominio.com`
- [ ] Products: `https://tudominio.com/products`
- [ ] Login: `https://tudominio.com/login`
- [ ] Admin: `https://tudominio.com/admin` (requiere auth)

#### Checkout Flow Completo

1. [ ] Ir a producto
2. [ ] Click "Comprar"
3. [ ] Completar Turnstile
4. [ ] Redirige a Mercado Pago
5. [ ] Completar pago
6. [ ] Webhook se procesa
7. [ ] Email recibido con link
8. [ ] Link de descarga funciona
9. [ ] Archivo se descarga desde R2

#### Downloads

- [ ] Primera descarga sin auth funciona
- [ ] Segunda descarga requiere auth
- [ ] Dashboard muestra compra
- [ ] Contador de descargas incrementa
- [ ] Límite se respeta
- [ ] Links expirados no funcionan

#### Security

- [ ] HTTPS activo
- [ ] Headers presentes (ver DevTools → Network)
- [ ] Rate limiting funciona
- [ ] Admin routes protegidas

---

## 🚨 Rollback Plan

Si algo falla en producción:

### Opción 1: Rollback Rápido

1. Cloudflare Pages → Deployments
2. Seleccionar deployment anterior
3. Click "Rollback"

### Opción 2: Git Revert

```bash
git revert HEAD
git push origin main
```

### Opción 3: Hotfix

```bash
git checkout -b hotfix/critical-issue
# Fix issue
git commit -m "Hotfix: descripción"
git push origin hotfix/critical-issue
# Merge rápido a main
```

---

## 📞 Contactos de Emergencia

Servicios de soporte:

- **Cloudflare**: community.cloudflare.com
- **Mercado Pago**: [soporte](https://www.mercadopago.com.ar/ayuda)
- **Resend**: support@resend.com
- **Next.js**: github.com/vercel/next.js/discussions

---

## ✨ Deploy Completado

Una vez todas las checkboxes estén marcadas:

```bash
🎉 ¡Tu aplicación está lista para producción!

Monitorea logs en:
- Cloudflare Pages Dashboard
- Resend Dashboard
- Mercado Pago Developer Dashboard

Sigue las métricas de:
- Requests/día
- Tasa de error
- Tiempo de respuesta
- Ventas completadas
```

---

**Fecha de última revisión**: _________
**Revisado por**: _________
**Deploy a producción**: ☐ Aprobado ☐ Pendiente

