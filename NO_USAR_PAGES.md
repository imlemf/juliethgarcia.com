# ⚠️ NO USAR CLOUDFLARE PAGES

## IMPORTANTE

Este proyecto se deploya **ÚNICAMENTE en Cloudflare Workers**.

**NO usar Cloudflare Pages bajo ninguna circunstancia.**

---

## ¿Por qué NO Pages?

- Pages NO es recomendado para este tipo de proyectos
- La configuración actual está optimizada para Workers
- Pages introduce complejidad innecesaria

---

## Deployment correcto

**USAR:**
```bash
npx wrangler deploy
```

**NO USAR:**
```bash
npx wrangler pages deploy dist  # ❌ INCORRECTO
```

---

## Configuración actual

- `astro.config.mjs` → `mode: 'advanced'` (Workers)
- `wrangler.toml` → Workers standalone
- Ver `DEPLOYMENT_WORKERS.md` para guía completa

---

**Recordatorio: SOLO Workers. NO Pages.**
