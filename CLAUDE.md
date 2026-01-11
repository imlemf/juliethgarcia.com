# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a digital products e-commerce platform built with Next.js 16, Cloudflare D1, R2, Mercado Pago, and Auth.js. The platform enables selling digital products with a unique download flow: first download requires no authentication, subsequent downloads require user login or registration with a purchase code.

## Development Commands

```bash
# Development
npm run dev                    # Start Next.js dev server on localhost:3000
npm run build                  # Production build
npm run lint                   # Run ESLint

# Database (Drizzle ORM + Cloudflare D1)
npm run db:generate            # Generate migrations from schema changes
npm run db:migrate             # Apply migrations locally
npm run db:studio              # Open Drizzle Studio GUI

# Wrangler (Cloudflare CLI)
npx wrangler d1 execute ecommerce-db --local --command="SELECT * FROM users"
npx wrangler d1 migrations apply ecommerce-db --local    # Local migrations
npx wrangler d1 migrations apply ecommerce-db --remote   # Production migrations
npx wrangler pages deployment tail                       # View production logs
```

## Critical Architecture Concepts

### Edge Runtime Requirement

**ALL API routes and components must be edge-compatible**:
- Every API route MUST export `export const runtime = 'edge'`
- NEVER use Node.js modules (`fs`, `path`, `crypto.createHmac`, etc.)
- Use Web Crypto API instead: `crypto.subtle` for HMAC operations
- D1 database client is passed via request context: `(request as any).env?.DB`

### Download Flow Architecture

The most critical feature is the dual-auth download system:

**First Download (No Auth Required)**:
1. Purchase completed → Email sent with unique download token
2. User clicks `/download/[token]` → Direct download
3. `downloadLinks.firstDownloadCompleted` flag set to `true`
4. Download count incremented, IP/User-Agent tracked

**Subsequent Downloads (Auth Required)**:
1. User clicks same link → Detected via `firstDownloadCompleted === true`
2. Redirect to `/auth/required?token=[token]`
3. Two authentication paths:
   - **New users**: Register with email + purchaseCode + password
   - **Existing users**: Login with email + password (NO code needed)
4. After auth → Ownership validation → Download allowed

**Ownership Validation Logic**:
```typescript
// User can download if EITHER condition is true:
const isOwner =
  downloadLink.purchase.userId === session.user.id ||  // Registered and owns
  downloadLink.purchase.email === session.user.email;  // Email match (multiple purchases)
```

This allows users with multiple purchases to access new products by just logging in, without needing new codes.

### Auth.js Configuration

Located at `src/lib/auth/auth.ts`, configured with **2 Credentials providers**:

**Provider 1: credentials-login**
- Standard login: email + password + Turnstile token
- No purchase code required
- For existing users

**Provider 2: credentials-register**
- Registration: email + purchaseCode + password + Turnstile token
- Validates purchase code exists and matches email
- Marks `purchases.usedForRegistration = true` (single-use)
- Creates user and auto-logs in

**Critical**: Both providers use JWT sessions (`strategy: 'jwt'`) for edge runtime compatibility.

### Database Schema Key Relationships

**purchases table**:
- `purchaseCode`: Unique 12-char alphanumeric (generated with `src/lib/utils/generate-code.ts`)
- `usedForRegistration`: Boolean flag (prevents code reuse for account creation)
- `email`: Allows ownership validation even without userId

**downloadLinks table**:
- `firstDownloadCompleted`: Boolean flag (controls auth requirement)
- `token`: CUID2 unique token for download URL
- `expiresAt`: Configurable via `DOWNLOAD_LINK_EXPIRY_HOURS` env var
- `maxDownloads`: Configurable via `MAX_DOWNLOADS_PER_PURCHASE` env var
- `downloadCount`: Increments on each download

**Critical Query**: Always use `getPurchasesByUserIdOrEmail()` (not `getPurchasesByUserId()`) to fetch user's purchases, as it matches BOTH userId AND email to handle purchases made before registration.

### Mercado Pago Webhook Flow

Located at `src/app/api/payments/webhook/route.ts` - this is the **most critical endpoint**:

1. **Signature Validation**: HMAC SHA256 with Web Crypto API
   - Parse `x-signature` header: `ts=timestamp,v1=hash`
   - Build manifest: `id:{dataId};request-id:{xRequestId};ts:{ts};`
   - Compare with `MERCADOPAGO_WEBHOOK_SECRET`

2. **Idempotency**: Check `mpPaymentId` doesn't already exist

3. **Create Purchase**: Generate unique `purchaseCode`

4. **Create Download Link**: Generate `downloadToken` with expiry

5. **Send Email**: Via Resend with React Email template
   - Product name and description
   - Purchase code (for new user registration)
   - Direct download link: `{APP_URL}/download/{token}`
   - Instructions about first download vs. subsequent downloads

**Never skip email sending**: Even if it fails, purchase must be created (email failure is logged but doesn't abort webhook).

### R2 Presigned URLs

Located at `src/lib/r2/download.ts`:

**Upload (Admin only)**:
```typescript
generatePresignedUploadUrl(fileKey, contentType, expiresIn = 3600)
// Returns URL valid for 1 hour for direct browser upload
```

**Download (All users)**:
```typescript
generatePresignedDownloadUrl(fileKey, expiresIn = 3600)
// Generated AFTER all validations pass
// Never generate presigned URL before auth/ownership validation
```

**Critical**: R2 bucket must be PRIVATE. All access via presigned URLs only.

### Security: Rate Limiting

Located at `src/lib/security/rate-limit.ts` and enforced in `src/middleware.ts`:

**In-memory rate limiter** (edge-compatible):
- Tracks by IP (cf-connecting-ip, x-forwarded-for, x-real-ip)
- Preset limits in `RateLimits` constant:
  - Payment creation: 3 req / 5 min
  - Downloads: 5 req / hour
  - Webhooks: 100 req / min
  - General API: 60 req / min

**Returns 429 with headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

### Zod Validation

All input validation uses Zod schemas in `src/lib/validations/`:

- `auth.ts`: Login and registration validation
- `products.ts`: Product CRUD validation
- `payments.ts`: Payment preference validation

**Always use `.parse()` not `.safeParse()` in try-catch blocks** to let the centralized error handler (`src/lib/utils/error-handler.ts`) format Zod errors consistently.

## File Organization Patterns

**API Routes** (`src/app/api/`):
- All must export `export const runtime = 'edge'`
- Use `handleApiError()` wrapper for consistent error responses
- Import Zod schemas from `src/lib/validations/`
- Get D1 from request: `const db = getDb((request as any).env?.DB)`

**Database Queries** (`src/lib/db/queries/`):
- Separated by entity: `products.ts`, `purchases.ts`, `downloads.ts`
- Always include relations when needed for UI (use Drizzle `.with()`)
- Return full objects, not partial selects (easier to work with)

**Validations** (`src/lib/validations/`):
- Export both schema and inferred TypeScript type
- Use descriptive error messages in Spanish (user-facing)

**Email Templates** (`src/lib/email/templates/`):
- React Email components
- Must render to HTML via `@react-email/render`
- Include both text content and structured data

## Environment Variables

**Required for Development**:
```bash
AUTH_SECRET                      # openssl rand -base64 32
CLOUDFLARE_D1_DATABASE_ID       # From wrangler d1 create
R2_BUCKET_NAME                  # "digital-products"
R2_ACCESS_KEY_ID                # From Cloudflare R2 dashboard
R2_SECRET_ACCESS_KEY            # From Cloudflare R2 dashboard
MERCADOPAGO_ACCESS_TOKEN        # Test credentials from MP dashboard
MERCADOPAGO_WEBHOOK_SECRET      # From MP webhook config
RESEND_API_KEY                  # From resend.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY  # From Cloudflare Turnstile
TURNSTILE_SECRET_KEY            # From Cloudflare Turnstile
```

See `.env.example` for complete list.

## Common Workflows

### Adding a New Product (Admin)

1. Login as admin (`role = 'admin'` in database)
2. Go to `/admin/products/new`
3. Upload triggers: Request presigned URL → Upload to R2 → Save `fileKey`
4. Product creation saves to `products` table with `fileKey` pointing to R2
5. Activate product: Set `isActive = true`

### Testing Purchase Flow Locally

1. Use Mercado Pago test credentials (see DEPLOY.md)
2. Test card: `5031 7557 3453 0604`, CVV: `123`
3. Webhook must be publicly accessible (use ngrok/cloudflared tunnel)
4. Verify email arrives (use Resend test mode)
5. Test both first download (no auth) and second download (with auth)

### Creating Admin User

After first deployment:
```bash
# Generate password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"

# Insert directly into D1
npx wrangler d1 execute ecommerce-db --remote --command="INSERT INTO users (id, email, password, role, createdAt, updatedAt) VALUES ('admin-001', 'admin@example.com', '<hash>', 'admin', datetime('now'), datetime('now'))"
```

### Debugging Webhook Issues

1. Check Mercado Pago webhook logs (developer dashboard)
2. View Cloudflare Pages logs: `npx wrangler pages deployment tail`
3. Verify HMAC signature validation isn't failing
4. Check `purchases` table for created record
5. Check `downloadLinks` table for generated token
6. Check Resend dashboard for email delivery status

## Critical Files Reference

When making changes, always consider impact on these files:

- `src/middleware.ts` - Rate limiting, security headers, route protection
- `src/app/api/payments/webhook/route.ts` - Payment processing (most critical)
- `src/app/api/downloads/[token]/route.ts` - Download validation and serving
- `src/lib/auth/auth.ts` - Auth.js dual-provider configuration
- `src/lib/mercadopago/webhook.ts` - HMAC signature validation (Web Crypto API)
- `src/db/schema.ts` - Database schema changes require new migration

## Documentation

- `DEPLOY.md` - Complete production deployment guide
- `PRE_DEPLOY_CHECKLIST.md` - Mandatory checklist before deploy
- `SECURITY.md` - All security measures explained
- `RESEND_SETUP.md` - Email configuration guide

## Known Constraints

1. **Next.js 16 + Cloudflare**: `@cloudflare/next-on-pages` removed due to incompatibility
2. **Edge Runtime Only**: No server runtime, all code must be edge-compatible
3. **D1 from Request Context**: Database binding accessed via `(request as any).env?.DB`
4. **JWT Sessions Required**: DrizzleAdapter database sessions don't work in edge runtime
5. **In-Memory Rate Limiting**: Resets on deployment (acceptable for this use case)
6. **Single-Use Purchase Codes**: Code can only register ONE account (enforced by `usedForRegistration` flag)
7. **Email Match Ownership**: Users can access purchases made with their email even before registration
