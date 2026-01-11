CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `downloadLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`purchaseId` text NOT NULL,
	`userId` text,
	`productId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`firstDownloadCompleted` integer DEFAULT false NOT NULL,
	`firstDownloadAt` integer,
	`downloadCount` integer DEFAULT 0 NOT NULL,
	`maxDownloads` integer DEFAULT 5 NOT NULL,
	`lastDownloadedAt` integer,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer,
	FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `downloadLinks_token_unique` ON `downloadLinks` (`token`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`imageUrl` text,
	`fileKey` text NOT NULL,
	`fileName` text NOT NULL,
	`fileSize` integer,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`productId` text NOT NULL,
	`purchaseCode` text NOT NULL,
	`email` text NOT NULL,
	`mpPaymentId` text,
	`mpOrderId` text,
	`mpStatus` text,
	`mpStatusDetail` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`usedForRegistration` integer DEFAULT false NOT NULL,
	`registrationUsedAt` integer,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_purchaseCode_unique` ON `purchases` (`purchaseCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_mpPaymentId_unique` ON `purchases` (`mpPaymentId`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_sessionToken_unique` ON `sessions` (`sessionToken`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`password` text,
	`emailVerified` integer,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verificationTokens_token_unique` ON `verificationTokens` (`token`);