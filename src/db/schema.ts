import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Users table - managed by Auth.js D1 adapter
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'), // hashed password (bcryptjs)
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  image: text('image'),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Auth.js required tables
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// Products table
export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // Price in cents
  currency: text('currency').default('USD').notNull(),
  imageUrl: text('imageUrl'),
  fileKey: text('fileKey').notNull(), // R2 object key
  fileName: text('fileName').notNull(),
  fileSize: integer('fileSize'), // in bytes
  isActive: integer('isActive', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Purchases table
export const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  productId: text('productId').notNull().references(() => products.id),
  purchaseCode: text('purchaseCode').notNull().unique(), // Unique code for registration
  email: text('email').notNull(), // Email where purchase code was sent

  // Mercado Pago fields
  mpPaymentId: text('mpPaymentId').unique(),
  mpOrderId: text('mpOrderId'),
  mpStatus: text('mpStatus'), // approved, pending, rejected
  mpStatusDetail: text('mpStatusDetail'),

  amount: integer('amount').notNull(), // Amount paid in cents
  currency: text('currency').default('USD').notNull(),

  // Status tracking
  status: text('status', {
    enum: ['pending', 'completed', 'refunded', 'failed']
  }).default('pending').notNull(),

  // Registration tracking
  usedForRegistration: integer('usedForRegistration', { mode: 'boolean' }).default(false).notNull(),
  registrationUsedAt: integer('registrationUsedAt', { mode: 'timestamp' }),

  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Download links table
export const downloadLinks = sqliteTable('downloadLinks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  purchaseId: text('purchaseId').notNull().references(() => purchases.id, { onDelete: 'cascade' }),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id),

  token: text('token').notNull().unique(), // Unique token for the download link
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),

  // First download tracking (no auth required for first download)
  firstDownloadCompleted: integer('firstDownloadCompleted', { mode: 'boolean' }).default(false).notNull(),
  firstDownloadAt: integer('firstDownloadAt', { mode: 'timestamp' }),

  downloadCount: integer('downloadCount').default(0).notNull(),
  maxDownloads: integer('maxDownloads').default(5).notNull(),

  lastDownloadedAt: integer('lastDownloadedAt', { mode: 'timestamp' }),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),

  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  downloadLinks: many(downloadLinks),
  accounts: many(accounts),
  sessions: many(sessions)
}));

export const productsRelations = relations(products, ({ many }) => ({
  purchases: many(purchases),
  downloadLinks: many(downloadLinks)
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [purchases.productId],
    references: [products.id]
  }),
  downloadLinks: many(downloadLinks)
}));

export const downloadLinksRelations = relations(downloadLinks, ({ one }) => ({
  purchase: one(purchases, {
    fields: [downloadLinks.purchaseId],
    references: [purchases.id]
  }),
  user: one(users, {
    fields: [downloadLinks.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [downloadLinks.productId],
    references: [products.id]
  })
}));
