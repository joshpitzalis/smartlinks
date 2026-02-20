import { sql } from "drizzle-orm";
import {
	AnySQLiteColumn,
	foreignKey,
	index,
	integer,
	numeric,
	real,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const links = sqliteTable("links", {
	linkId: text("link_id").primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	destinations: text().notNull(),
	created: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updated: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	name: text().notNull(),
});

export const linkClicks = sqliteTable(
	"link_clicks",
	{
		id: text().notNull(),
		accountId: text("account_id").notNull(),
		country: text(),
		destination: text().notNull(),
		clickedTime: numeric("clicked_time").notNull(),
		latitude: real(),
		longitude: real(),
	},
	(table) => [
		index("idx_link_clicks_id").on(table.id),
		index("idx_link_clicks_clicked_time").on(table.clickedTime),
		index("idx_link_clicks_account_id").on(table.accountId),
	],
);

export const destinationEvaluations = sqliteTable(
	"destination_evaluations",
	{
		id: text().primaryKey(),
		linkId: text("link_id").notNull(),
		accountId: text("account_id").notNull(),
		destinationUrl: text("destination_url").notNull(),
		status: text().notNull(),
		reason: text().notNull(),
		createdAt: numeric("created_at")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
	},
	(table) => [
		index("idx_destination_evaluations_account_time").on(
			table.accountId,
			table.createdAt,
		),
	],
);

export const account = sqliteTable(
	"account",
	{
		id: text().primaryKey().notNull(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at"),
		refreshTokenExpiresAt: integer("refresh_token_expires_at"),
		scope: text(),
		password: text(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at").notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const session = sqliteTable(
	"session",
	{
		id: text().primaryKey().notNull(),
		expiresAt: integer("expires_at").notNull(),
		token: text().notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at").notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("session_userId_idx").on(table.userId),
		uniqueIndex("session_token_unique").on(table.token),
	],
);

export const user = sqliteTable(
	"user",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: integer("email_verified").default(0).notNull(),
		image: text(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		stripeCustomerId: text("stripe_customer_id"),
	},
	(table) => [uniqueIndex("user_email_unique").on(table.email)],
);

export const verification = sqliteTable(
	"verification",
	{
		id: text().primaryKey().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer("expires_at").notNull(),
		createdAt: integer("created_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at")
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const subscription = sqliteTable("subscription", {
	id: text().primaryKey().notNull(),
	plan: text().notNull(),
	referenceId: text("reference_id").notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	status: text().default("incomplete"),
	periodStart: integer("period_start"),
	periodEnd: integer("period_end"),
	cancelAtPeriodEnd: integer("cancel_at_period_end").default(0),
	seats: integer(),
});

export const advertisers = sqliteTable(
	"advertisers",
	{
		pageId: text("page_id").primaryKey().notNull(),
		pageName: text("page_name"),
		categories: text(),
		isAaaEligible: integer("is_aaa_eligible"),
		pageProfileUri: text("page_profile_uri"),
		pageProfilePictureUrl: text("page_profile_picture_url"),
		pageCategories: text("page_categories"),
		pageLikeCount: integer("page_like_count"),
		createdAt: text("created_at").default("sql`(datetime('now'))`"),
		updatedAt: text("updated_at").default("sql`(datetime('now'))`"),
		totalAds: integer("total_ads"),
		activeAds: integer("active_ads"),
		adsByFormat: text("ads_by_format"), // JSON stringified
		adsByCategory: text("ads_by_category"), // JSON stringified
		platformDistribution: text("platform_distribution"), // JSON stringified
		advertisingSince: text("advertising_since"),
		averageAdLifespanDays: real("average_ad_lifespan_days"),
		longestRunningAd: text("longest_running_ad"), // JSON stringified
	},
	(table) => [
		index("idx_advertisers_updated_at").on(table.updatedAt),
		index("idx_advertisers_page_name").on(table.pageName),
	],
);
