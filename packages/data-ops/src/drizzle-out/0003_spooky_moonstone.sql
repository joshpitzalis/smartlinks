ALTER TABLE `advertisers` ADD `total_ads` integer;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `active_ads` integer;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `ads_by_format` text;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `ads_by_category` text;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `platform_distribution` text;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `advertising_since` text;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `average_ad_lifespan_days` real;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `longest_running_ad` text;