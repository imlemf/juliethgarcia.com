// Cloudflare environment bindings
export interface CloudflareEnv {
  DB: D1Database;
  R2_BUCKET?: R2Bucket;
}

// Global type augmentation for process.env in edge runtime
declare global {
  interface ProcessEnv {
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_D1_DATABASE_ID: string;
    CLOUDFLARE_API_TOKEN: string;
    R2_BUCKET_NAME: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_ACCOUNT_ID: string;
    AUTH_SECRET: string;
    AUTH_TRUST_HOST: string;
    NEXTAUTH_URL: string;
    MERCADOPAGO_ACCESS_TOKEN: string;
    MERCADOPAGO_PUBLIC_KEY: string;
    MERCADOPAGO_WEBHOOK_SECRET: string;
    RESEND_API_KEY: string;
    EMAIL_FROM: string;
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
    TURNSTILE_SECRET_KEY: string;
    NEXT_PUBLIC_APP_URL: string;
    DOWNLOAD_LINK_EXPIRY_HOURS: string;
    MAX_DOWNLOADS_PER_PURCHASE: string;
  }
}

export {};
