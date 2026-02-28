# Testing Checklist - Astro Migration

## 🚀 Servidor Local

**URL:** http://localhost:4321/
**Status:** ✅ Corriendo

## 👤 Credenciales de Testing

### Usuario Admin
- **Email:** admin@test.com
- **Password:** admin123

### Producto de Prueba
- **Nombre:** Producto de Prueba
- **Precio:** $9.99 USD
- **Slug:** producto-prueba

---

## ✅ Testing Manual - Checklist

### 1. Homepage y Navegación

- [ ] **Homepage** (http://localhost:4321/)
  - [ ] Página carga correctamente
  - [ ] Estilos TailwindCSS aplicados
  - [ ] Botón "Ver Productos" funciona
  - [ ] Links de navegación visibles

- [ ] **Productos** (http://localhost:4321/products)
  - [ ] Lista de productos carga
  - [ ] Muestra "Producto de Prueba"
  - [ ] Precio formateado correctamente ($9.99)
  - [ ] Click en producto redirige a /products/producto-prueba

- [ ] **Página de Producto** (http://localhost:4321/products/producto-prueba)
  - [ ] Detalles del producto se muestran
  - [ ] Botón de compra visible

### 2. Autenticación

- [ ] **Login Page** (http://localhost:4321/login)
  - [ ] Página carga sin errores
  - [ ] Tabs (Iniciar sesión / Registrarse) funcionan
  - [ ] Form de login visible
  - [ ] Turnstile checkbox visible (debería pasar automáticamente con test keys)

- [ ] **Login con Admin**
  - [ ] Ingresar email: admin@test.com
  - [ ] Ingresar password: admin123
  - [ ] Click en "Iniciar sesión"
  - [ ] ✅ **Esperado:** Redirección a /dashboard
  - [ ] ✅ **Esperado:** Mensaje de bienvenida visible

- [ ] **Dashboard** (http://localhost:4321/dashboard)
  - [ ] Página protegida (requiere login)
  - [ ] Muestra email del usuario
  - [ ] Lista de compras (vacía por ahora)

- [ ] **Logout**
  - [ ] Botón de logout visible en navegación
  - [ ] Click en logout
  - [ ] ✅ **Esperado:** Sesión cerrada
  - [ ] ✅ **Esperado:** Redirección a homepage

### 3. Admin Panel

- [ ] **Admin Dashboard** (http://localhost:4321/admin)
  - [ ] Solo accesible para usuarios admin
  - [ ] Sidebar de navegación visible
  - [ ] Links a Productos, Compras, Links

- [ ] **Admin - Productos** (http://localhost:4321/admin/products)
  - [ ] Lista de productos carga
  - [ ] Muestra "Producto de Prueba"
  - [ ] Botón "Nuevo producto" visible

- [ ] **Admin - Crear Producto** (http://localhost:4321/admin/products/new)
  - [ ] Form de creación visible
  - [ ] Campos: nombre, slug, descripción, precio, currency
  - [ ] ⚠️ Upload de archivo NO funcionará (requiere credenciales R2)

- [ ] **Admin - Compras** (http://localhost:4321/admin/purchases)
  - [ ] Página carga (lista vacía por ahora)

- [ ] **Admin - Links** (http://localhost:4321/admin/links)
  - [ ] Página carga
  - [ ] Botón "Nuevo enlace" visible

- [ ] **Admin - Crear Link** (http://localhost:4321/admin/links/new)
  - [ ] Tabs: Redes Sociales / Personalizado
  - [ ] Selección de plataformas sociales funciona
  - [ ] Form personalizado funciona

### 4. Links Page (Linktree Style)

- [ ] **Links Públicos** (http://localhost:4321/links)
  - [ ] Página pública carga
  - [ ] Muestra links activos (si hay)
  - [ ] Click tracking NO funcionará sin base de datos activa

---

## ⚠️ Limitaciones del Testing Local

### No Funcionarán Sin Configuración Adicional:

❌ **Upload a R2**
- Requiere: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
- Afecta: Crear/editar productos con archivo

❌ **Mercado Pago**
- Requiere: MERCADOPAGO_ACCESS_TOKEN, webhook configurado
- Afecta: Flujo de compra completo

❌ **Envío de Emails**
- Requiere: RESEND_API_KEY
- Afecta: Emails de confirmación de compra

❌ **Webhook de MP**
- Requiere: ngrok + URL pública + credenciales MP
- Afecta: Procesamiento de pagos

❌ **Descargas de Archivos**
- Requiere: R2 configurado + archivo en bucket
- Afecta: Flujo de descarga completo

### ✅ Lo Que SÍ Funciona:

- ✅ Navegación completa del sitio
- ✅ Login/Logout con Better Auth
- ✅ Vistas del admin panel
- ✅ Forms (UI, no submit funcional en algunos casos)
- ✅ Lista de productos
- ✅ Tailwind CSS y componentes UI
- ✅ React Islands (client:only)

---

## 🔄 Siguiente Paso: Build para Producción

Una vez verificado el testing manual básico:

```bash
# Build para producción
bun run build

# Verificar que dist/_worker.js existe
ls -la dist/_worker.js
```

---

## 🚀 Deployment a Cloudflare Workers

### ⚠️ IMPORTANTE: SOLO WORKERS - NO USAR PAGES

Después del build exitoso:

```bash
# 1. Aplicar migraciones D1 (primera vez)
bunx wrangler d1 migrations apply ecommerce-db --remote

# 2. Deploy a Workers
bunx wrangler deploy

# 3. Configurar secrets
bunx wrangler secret put BETTER_AUTH_SECRET
# ... ver DEPLOYMENT_WORKERS.md para lista completa

# 4. Actualizar webhook URL de Mercado Pago
# Nuevo URL: https://tudominio.com/api/payments/webhook

# 5. Testing en producción
```

**Ver guía completa:** `DEPLOYMENT_WORKERS.md`

---

## 📝 Notas

- **Better Auth:** Usando test keys de Turnstile que siempre pasan
- **Database:** SQLite local en `local.db`
- **Hot Reload:** Astro dev server con HMR
- **SSR:** Componentes Radix UI requieren `client:only="react"` por contexto React
