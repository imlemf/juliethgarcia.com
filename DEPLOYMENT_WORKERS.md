# Deployment a Cloudflare Workers

## ⚠️ IMPORTANTE: SOLO WORKERS

**Este proyecto se deploya ÚNICAMENTE en Cloudflare Workers.**
**NO usar Cloudflare Pages.**

---

## Configuración Actual

El proyecto está configurado con:
- `astro.config.mjs` → `mode: 'advanced'` (Workers)
- `wrangler.toml` → Configuración para Workers standalone
- Build output: `dist/_worker.js` + assets en `dist/`

---

## 🧪 Testing Local (Antes de Deploy)

**IMPORTANTE: Este proyecto usa BUN como package manager.**

```bash
# Desarrollo local
bun run dev
```

- Corre en http://localhost:4321
- Usa SQLite local (local.db)
- Hot reload habilitado
- Funciona perfectamente

**⚠️ Limitación:** `bunx wrangler dev` NO funciona debido a better-sqlite3. Usar `bun run dev` para testing local.

---

## 🚀 Deployment Paso a Paso

### 1. Build del Proyecto

```bash
bun run build
```

Esto genera:
- `dist/_worker.js` - Worker entry point
- `dist/_astro/` - Assets estáticos
- `dist/_routes.json` - Routing config

### 2. Aplicar Migraciones D1 (Solo Primera Vez)

```bash
bunx wrangler d1 migrations apply ecommerce-db --remote
```

### 3. Deploy a Workers

```bash
bunx wrangler deploy
```

O con publish:
```bash
bunx wrangler publish
```

---

## 🔐 Configurar Variables de Entorno (Secrets)

Después del primer deploy, configurar todos los secrets:

```bash
# Better Auth
bunx wrangler secret put BETTER_AUTH_SECRET
# Valor: generar con openssl rand -base64 32

bunx wrangler secret put BETTER_AUTH_URL
# Valor: https://tudominio.com

# Mercado Pago (PRODUCCIÓN)
bunx wrangler secret put MERCADOPAGO_ACCESS_TOKEN
bunx wrangler secret put MERCADOPAGO_PUBLIC_KEY
bunx wrangler secret put MERCADOPAGO_WEBHOOK_SECRET

# Resend Email
bunx wrangler secret put RESEND_API_KEY
bunx wrangler secret put EMAIL_FROM
# Ejemplo: noreply@tudominio.com

# Cloudflare Turnstile (PRODUCCIÓN)
bunx wrangler secret put PUBLIC_TURNSTILE_SITE_KEY
bunx wrangler secret put TURNSTILE_SECRET_KEY

# App Configuration
bunx wrangler secret put PUBLIC_APP_URL
# Valor: https://tudominio.com

bunx wrangler secret put DOWNLOAD_LINK_EXPIRY_HOURS
# Valor: 48

bunx wrangler secret put MAX_DOWNLOADS_PER_PURCHASE
# Valor: 5
```

### Variables NO secretas (en wrangler.toml o dashboard):

```bash
# R2 Configuration (si no usas el binding)
R2_BUCKET_NAME=digital-products
R2_ACCOUNT_ID=tu-account-id

# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=tu-account-id
```

---

## 🌐 Custom Domain

### Opción A: Via Wrangler CLI

```bash
bunx wrangler domains add tudominio.com
```

### Opción B: Via Dashboard

1. Ir a Workers & Pages → Tu Worker
2. Settings → Domains & Routes
3. Add Custom Domain
4. Seguir instrucciones de DNS

---

## 📊 Post-Deployment Tasks

### 1. Crear Usuario Admin en Producción

```bash
# 1. Generar hash de password
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-password-seguro', 10));"

# 2. Insertar en D1 remoto
bunx wrangler d1 execute ecommerce-db --remote --command="
INSERT INTO users (id, email, password, role, emailVerified, createdAt, updatedAt)
VALUES ('admin-001', 'admin@tudominio.com', '\$2b\$10\$HASH_GENERADO', 'admin', 1, datetime('now'), datetime('now'))
"
```

### 2. Actualizar Webhook de Mercado Pago

URL del webhook: `https://tudominio.com/api/payments/webhook`

Configurar en: https://www.mercadopago.com/developers/panel/webhooks

### 3. Verificar Bindings

```bash
# Ver bindings del Worker
bunx wrangler dev

# O revisar en dashboard:
# Workers & Pages → Tu Worker → Settings → Variables & Secrets
```

### 4. Testing en Producción

**Checklist:**
- [ ] Login funciona
- [ ] Admin panel accesible
- [ ] Productos se muestran
- [ ] Compra de prueba con tarjeta sandbox MP
- [ ] Webhook recibido correctamente
- [ ] Email enviado (revisar Resend dashboard)
- [ ] Flujo de descarga completo funciona
- [ ] Rate limiting activo

---

## 🔄 Redeploy / Actualizaciones

Para actualizar el Worker después de cambios:

```bash
# 1. Build
bun run build

# 2. Deploy
bunx wrangler deploy
```

**Nota:** Los secrets persisten entre deploys. Solo necesitas reconfigurarlos si cambian.

---

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
bunx wrangler tail

# Ver lista de Workers
bunx wrangler list

# Ver configuración actual
bunx wrangler whoami

# Eliminar Worker (CUIDADO)
bunx wrangler delete juliethgarcia-astro

# Ver secrets configurados
bunx wrangler secret list

# Eliminar un secret
bunx wrangler secret delete NOMBRE_SECRET

# Ejecutar query en D1 producción
bunx wrangler d1 execute ecommerce-db --remote --command="SELECT * FROM users LIMIT 5"

# Ver migraciones aplicadas
bunx wrangler d1 migrations list ecommerce-db --remote
```

---

## 🐛 Troubleshooting

### Error: "Invalid binding DB"
**Solución:** Verificar que el `database_id` en wrangler.toml sea correcto.

### Error: "Module not found"
**Solución:** Rebuild con `bun run build` antes de deploy.

### Error: "Unauthorized"
**Solución:** Login con `bunx wrangler login`

### Webhook no recibe requests
**Solución:**
1. Verificar URL en MP dashboard
2. Revisar logs con `bunx wrangler tail`
3. Verificar HMAC signature validation

### Rate limiting muy agresivo
**Solución:** Ajustar valores en `src/lib/security/rate-limit.ts` y redeploy.

---

## 📋 Checklist Pre-Deployment

- [x] `astro.config.mjs` configurado con `mode: 'advanced'`
- [x] `wrangler.toml` configurado para Workers
- [x] Build exitoso (`bun run build`)
- [ ] Credenciales de producción listas (MP, Resend, Turnstile)
- [ ] D1 database creada y migraciones listas
- [ ] R2 bucket creado y configurado
- [ ] Dominio custom listo (DNS configurado)
- [ ] Backup de datos existentes (si migras desde otro sistema)

---

## ✅ Deployment Completo

Después de seguir todos los pasos:

1. ✅ Worker desplegado en Cloudflare
2. ✅ D1 database migrada
3. ✅ Secrets configurados
4. ✅ Custom domain activo
5. ✅ Webhook de MP configurado
6. ✅ Usuario admin creado
7. ✅ Testing en producción exitoso

**Tu aplicación está lista en producción.** 🎉

---

## 📚 Recursos

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
