CREATE TABLE `advertisers` (
	`page_id` text PRIMARY KEY NOT NULL,
	`page_name` text,
	`categories` text,
	`is_aaa_eligible` integer,
	`page_profile_uri` text,
	`page_profile_picture_url` text,
	`page_categories` text,
	`page_like_count` integer,
	`created_at` text DEFAULT 'sql`(datetime(''now''))`',
	`updated_at` text DEFAULT 'sql`(datetime(''now''))`'
);
--> statement-breakpoint
CREATE INDEX `idx_advertisers_updated_at` ON `advertisers` (`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_advertisers_page_name` ON `advertisers` (`page_name`);