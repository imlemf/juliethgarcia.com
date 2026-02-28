# Astro E-commerce - Cloudflare Workers

E-commerce platform for digital products built with Astro 6, deployed on **Cloudflare Workers**.

## ⚠️ IMPORTANTE

### SOLO WORKERS - NO PAGES
**Este proyecto se deploya ÚNICAMENTE en Cloudflare Workers.**
**NO usar Cloudflare Pages bajo ninguna circunstancia.**

Ver: [NO_USAR_PAGES.md](./NO_USAR_PAGES.md)

### Package Manager: BUN
**Este proyecto usa BUN como package manager.**
- ✅ Usar: `bun install`, `bun run dev`, `bunx wrangler`
- ❌ NO usar: `npm install`, `npm run`, `npx`

---

## 🚀 Quick Start

```bash
# Install
bun install

# Development
bun run dev

# Build
bun run build

# Deploy to Workers
bunx wrangler deploy
```

**Admin de prueba:** `admin@test.com` / `admin123`

---

## Stack

- **Framework:** Astro 6 (SSR)
- **Runtime:** Cloudflare Workers
- **Database:** D1 (SQLite)
- **Storage:** R2
- **Auth:** Better Auth
- **ORM:** Drizzle
- **UI:** React + shadcn/ui + Tailwind
- **Payments:** Mercado Pago
- **Email:** Resend

---

## Deployment

**Ver guía completa:** [DEPLOYMENT_WORKERS.md](./DEPLOYMENT_WORKERS.md)

```bash
bun run build
bunx wrangler d1 migrations apply ecommerce-db --remote  # Primera vez
bunx wrangler deploy
bunx wrangler secret put BETTER_AUTH_SECRET
# ... más secrets (ver documentación)
```

---

## Comandos

```bash
bun run dev          # Dev server (localhost:4321)
bun run build        # Build para Workers
bun run db:generate  # Generar migraciones
bun run db:migrate   # Aplicar migraciones local
bun run db:studio    # Drizzle Studio GUI
```

---

## Documentación

- **[DEPLOYMENT_WORKERS.md](./DEPLOYMENT_WORKERS.md)** - Guía de deployment (LEER PRIMERO)
- **[NO_USAR_PAGES.md](./NO_USAR_PAGES.md)** - Importante: Solo Workers
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Testing manual
- [FASE_6_RESUMEN.md](./FASE_6_RESUMEN.md) - Resumen de migración

---

## Features

✅ Venta de productos digitales
✅ Mercado Pago integration
✅ Dual-auth download flow
✅ Admin panel
✅ Email notifications
✅ Rate limiting
✅ Security headers
✅ Turnstile bot protection

---

---

## 🧪 Testing Local

```bash
bun run dev
```

- Corre en http://localhost:4321
- Usa SQLite local (local.db)
- Hot reload habilitado
- Simula producción fielmente

**Nota:** `bunx wrangler dev` NO funciona debido a limitación con better-sqlite3. Usa `bun run dev` para desarrollo local.

---

**Recordatorio:** Deploy SOLO con `bunx wrangler deploy` (Workers), NO Pages.
