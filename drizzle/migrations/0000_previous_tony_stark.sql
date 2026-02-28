CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blogCategories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blogCategories_slug_unique` ON `blogCategories` (`slug`);--> statement-breakpoint
CREATE TABLE `blogs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`coverImage` text,
	`categoryId` text,
	`isPublished` integer DEFAULT false NOT NULL,
	`isPremium` integer DEFAULT false NOT NULL,
	`publishedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `blogCategories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blogs_slug_unique` ON `blogs` (`slug`);--> statement-breakpoint
CREATE TABLE `couponUsages` (
	`id` text PRIMARY KEY NOT NULL,
	`couponId` text NOT NULL,
	`purchaseId` text NOT NULL,
	`userId` text,
	`email` text NOT NULL,
	`discountApplied` integer NOT NULL,
	`usedAt` integer NOT NULL,
	FOREIGN KEY (`couponId`) REFERENCES `coupons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`discountType` text NOT NULL,
	`discountValue` integer NOT NULL,
	`minPurchaseAmount` integer,
	`maxDiscountAmount` integer,
	`usageLimit` integer,
	`usageCount` integer DEFAULT 0 NOT NULL,
	`usageLimitPerUser` integer,
	`productIds` text,
	`startsAt` integer,
	`expiresAt` integer,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `downloadLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`purchaseId` text NOT NULL,
	`userId` text,
	`productId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`downloadCount` integer DEFAULT 0 NOT NULL,
	`maxDownloads` integer DEFAULT 5 NOT NULL,
	`lastDownloadedAt` integer,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `downloadLinks_token_unique` ON `downloadLinks` (`token`);--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`phone` text,
	`countryCode` text,
	`status` text DEFAULT 'active' NOT NULL,
	`createdAt` integer NOT NULL,
	`unsubscribedAt` integer,
	`ipAddress` text,
	`userAgent` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletterSubscribers_email_unique` ON `newsletterSubscribers` (`email`);--> statement-breakpoint
CREATE TABLE `offerUsages` (
	`id` text PRIMARY KEY NOT NULL,
	`offerId` text NOT NULL,
	`purchaseId` text NOT NULL,
	`userId` text,
	`email` text NOT NULL,
	`discountApplied` integer NOT NULL,
	`usedAt` integer NOT NULL,
	FOREIGN KEY (`offerId`) REFERENCES `offers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`discountType` text NOT NULL,
	`discountValue` integer NOT NULL,
	`minPurchaseAmount` integer,
	`maxDiscountAmount` integer,
	`usageLimit` integer,
	`usageCount` integer DEFAULT 0 NOT NULL,
	`usageLimitPerUser` integer,
	`productIds` text,
	`startsAt` integer,
	`expiresAt` integer,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`titleId` text,
	`shortBio` text,
	`bio` text,
	`avatarUrl` text,
	`avatarFileId` text,
	`categoryId` text,
	`email` text,
	`emailIsPublic` integer DEFAULT false NOT NULL,
	`phone` text,
	`phoneIsPublic` integer DEFAULT false NOT NULL,
	`whatsapp` text,
	`whatsappIsPublic` integer DEFAULT false NOT NULL,
	`website` text,
	`instagram` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isPublished` integer DEFAULT false NOT NULL,
	`publishedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`titleId`) REFERENCES `personTitles`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`categoryId`) REFERENCES `personCategories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `people_slug_unique` ON `people` (`slug`);--> statement-breakpoint
CREATE TABLE `peopleSkills` (
	`id` text PRIMARY KEY NOT NULL,
	`personId` text NOT NULL,
	`skillId` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`personId`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skillId`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `personCategories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personCategories_slug_unique` ON `personCategories` (`slug`);--> statement-breakpoint
CREATE TABLE `personTitles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personTitles_slug_unique` ON `personTitles` (`slug`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`imageUrl` text,
	`imageFileId` text,
	`imageProvider` text,
	`fileKey` text NOT NULL,
	`fileName` text NOT NULL,
	`fileSize` integer,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`productId` text NOT NULL,
	`purchaseCode` text NOT NULL,
	`email` text NOT NULL,
	`paymentProvider` text,
	`externalPaymentId` text,
	`externalOrderId` text,
	`providerStatus` text,
	`providerStatusDetail` text,
	`checkoutUrl` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'initialized' NOT NULL,
	`couponId` text,
	`offerId` text,
	`discountSource` text,
	`discountAmount` integer DEFAULT 0 NOT NULL,
	`originalAmount` integer,
	`usedForRegistration` integer DEFAULT false NOT NULL,
	`registrationUsedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_purchaseCode_unique` ON `purchases` (`purchaseCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_externalPaymentId_unique` ON `purchases` (`externalPaymentId`);--> statement-breakpoint
CREATE TABLE `recipeCategories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipeCategories_slug_unique` ON `recipeCategories` (`slug`);--> statement-breakpoint
CREATE TABLE `recipePreparationIngredients` (
	`id` text PRIMARY KEY NOT NULL,
	`preparationId` text NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit` text NOT NULL,
	`calories` integer,
	`order` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`preparationId`) REFERENCES `recipePreparations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recipePreparations` (
	`id` text PRIMARY KEY NOT NULL,
	`recipeId` text NOT NULL,
	`title` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recipeSteps` (
	`id` text PRIMARY KEY NOT NULL,
	`preparationId` text NOT NULL,
	`instruction` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`timerSeconds` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`preparationId`) REFERENCES `recipePreparations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`imageUrl` text,
	`estimatedTime` integer NOT NULL,
	`calories` integer,
	`servings` integer DEFAULT 1 NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`categoryId` text,
	`isPublished` integer DEFAULT false NOT NULL,
	`isPremium` integer DEFAULT false NOT NULL,
	`publishedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `recipeCategories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipes_slug_unique` ON `recipes` (`slug`);--> statement-breakpoint
CREATE TABLE `referralCategories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referralCategories_slug_unique` ON `referralCategories` (`slug`);--> statement-breakpoint
CREATE TABLE `referralClicks` (
	`id` text PRIMARY KEY NOT NULL,
	`linkId` text NOT NULL,
	`country` text,
	`userAgent` text,
	`referer` text,
	`ipAddress` text,
	`incomingUtmSource` text,
	`incomingUtmMedium` text,
	`incomingUtmCampaign` text,
	`clickedAt` integer NOT NULL,
	FOREIGN KEY (`linkId`) REFERENCES `referralLinks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `referralLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`destinationUrl` text NOT NULL,
	`image` text,
	`categoryId` text,
	`utmSource` text,
	`utmMedium` text,
	`utmCampaign` text,
	`utmTerm` text,
	`utmContent` text,
	`clickCount` integer DEFAULT 0 NOT NULL,
	`lastClickAt` integer,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `referralCategories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referralLinks_slug_unique` ON `referralLinks` (`slug`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `siteLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`icon` text NOT NULL,
	`iconType` text DEFAULT 'emoji' NOT NULL,
	`linkType` text DEFAULT 'custom' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`clickCount` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`type` text DEFAULT 'string' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `siteSettings_key_unique` ON `siteSettings` (`key`);--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`color` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skills_slug_unique` ON `skills` (`slug`);--> statement-breakpoint
CREATE TABLE `templateConfigs` (
	`id` text PRIMARY KEY NOT NULL,
	`templateId` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `template_key_idx` ON `templateConfigs` (`templateId`,`key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`password` text,
	`role` text DEFAULT 'user' NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`premiumUntil` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verificationTokens_token_unique` ON `verificationTokens` (`token`);