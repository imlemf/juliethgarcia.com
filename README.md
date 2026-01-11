# Plataforma de Venta de Productos Digitales

Plataforma e-commerce completa para venta de productos digitales con Next.js 16, Cloudflare D1, R2, Mercado Pago, y Auth.js.

## 🌟 Características

### Para Compradores

- ✅ **Primera descarga sin registro**: Link directo del email, sin necesidad de crear cuenta
- ✅ **Descargas adicionales**: Requieren autenticación con código de compra (nuevos usuarios) o login (usuarios existentes)
- ✅ **Dashboard personal**: Acceso a todos los productos comprados
- ✅ **Múltiples descargas**: Hasta 5 descargas por producto (configurable)
- ✅ **Links con expiración**: Válidos por 48 horas (configurable)
- ✅ **Emails automáticos**: Confirmación de compra con link de descarga directo

### Para Administradores

- ✅ **Panel de administración**: CRUD completo de productos
- ✅ **Upload directo a R2**: Subida de archivos con barra de progreso
- ✅ **Gestión de compras**: Ver todas las transacciones y descargas
- ✅ **Analytics**: Métricas de ventas y descargas

### Seguridad

- ✅ **Rate limiting**: Protección contra abuso en endpoints sensibles
- ✅ **Anti-bot**: Cloudflare Turnstile en checkout y autenticación
- ✅ **Headers de seguridad**: CSP, X-Frame-Options, CSRF protection
- ✅ **Validaciones Zod**: Todas las entradas validadas
- ✅ **Passwords hasheados**: bcryptjs con salt rounds
- ✅ **Webhook HMAC**: Validación de firma para pagos

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Edge Runtime)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible)
- **Auth**: [Auth.js v5](https://authjs.dev/)
- **Payments**: [Mercado Pago](https://www.mercadopago.com.ar/developers)
- **Emails**: [Resend](https://resend.com/) + [React Email](https://react.email/)
- **Anti-bot**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 📋 Pre-requisitos

- Node.js 18+ y npm
- Cuenta de Cloudflare
- Cuenta de Mercado Pago
- Cuenta de Resend
- Git

## 🚀 Instalación Local

### 1. Clonar repositorio

```bash
git clone <tu-repo-url>
cd juliethgarcia.com
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completa las variables (ver [Configuración](#configuración)).

### 4. Configurar base de datos

```bash
# Crear base de datos D1
npx wrangler d1 create ecommerce-db

# Copiar el database_id al .env.local y wrangler.toml

# Generar migraciones
npm run db:generate

# Aplicar migraciones localmente
npx wrangler d1 migrations apply ecommerce-db --local
```

### 5. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## ⚙️ Configuración

### Variables de Entorno Requeridas

Ver archivo `.env.example` para la lista completa.

Ver guías detalladas:
- [DEPLOY.md](./DEPLOY.md) - Configuración de producción
- [RESEND_SETUP.md](./RESEND_SETUP.md) - Configuración de emails

## 📚 Documentación

- **[DEPLOY.md](./DEPLOY.md)** - Guía completa de deploy a Cloudflare Pages
- **[PRE_DEPLOY_CHECKLIST.md](./PRE_DEPLOY_CHECKLIST.md)** - Checklist obligatorio pre-deploy
- **[RESEND_SETUP.md](./RESEND_SETUP.md)** - Configuración de emails con Resend
- **[SECURITY.md](./SECURITY.md)** - Medidas de seguridad implementadas

## 🔑 Comandos Útiles

### Desarrollo

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción local
npm run lint         # Linter
```

### Base de Datos

```bash
npm run db:generate  # Generar migraciones
npm run db:migrate   # Aplicar migraciones
npm run db:studio    # Drizzle Studio (GUI)
```

## 🚢 Deploy a Producción

Ver guía completa: **[DEPLOY.md](./DEPLOY.md)**

Checklist pre-deploy: **[PRE_DEPLOY_CHECKLIST.md](./PRE_DEPLOY_CHECKLIST.md)**

## 🔒 Seguridad

Ver documentación completa: **[SECURITY.md](./SECURITY.md)**

### Rate Limits

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/payments/create-preference` | 3 | 5 min |
| `/api/downloads/*` | 5 | 1 hora |
| `/api/payments/webhook` | 100 | 1 min |
| Otros `/api/*` | 60 | 1 min |

## 📞 Soporte

- **Email**: soporte@juliethgarcia.com
- **Docs**: Ver carpeta de documentación

---

**Versión**: 1.0.0
**Última actualización**: Enero 2026
