import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/database";
import { advertisers } from "@/drizzle-out/schema";
import { MetaAdLibraryResponseSchema } from "@/zod/advertisers";

export async function getAdvertisers({
	page_id,
	api_key,
}: {
	page_id: string;
	api_key: string;
}) {
	const metaAdLibraryAPI = `https://www.searchapi.io/api/v1/search`;

	const searchParams: MetaAdLibrarySearchParams = {
		engine: "meta_ad_library",
		api_key: api_key,
		page_id: page_id,
		country: "ALL",
		ad_type: "all",
		active_status: "all",
		media_type: "all",
		sort_by: "impressions_high_to_low",
	};

	// Convert to URLSearchParams properly
	const params = new URLSearchParams();
	Object.entries(searchParams).forEach(([key, value]) => {
		if (value !== undefined) {
			params.append(key, String(value));
		}
	});

	const url = `${metaAdLibraryAPI}?${params.toString()}`;
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; SmartLinks/1.0)",
			},
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const metaAdsResponse = await response.json();

		// Parse and validate the entire response
		const metaAds =
			MetaAdLibraryResponseSchema.passthrough().parse(metaAdsResponse);
		console.log(JSON.stringify(metaAds));

		return metaAds;
	} catch (error) {
		console.error("Error fetching from the Meta Ad Library API:", error);
	}
}

export const MetaAdLibrarySearchSchema = z.object({
	// Required
	engine: z.literal("meta_ad_library"),
	api_key: z.string(),

	// Search Params
	q: z.string().optional(),
	page_id: z.string().optional(),
	location_id: z.string().optional(),

	// Localization
	country: z.string().default("ALL"),
	content_languages: z.string().optional(), // comma-separated list

	// Filters
	ad_type: z
		.enum([
			"all",
			"political_and_issue_ads",
			"housing_ads",
			"employment_ads",
			"credit_ads",
		])
		.default("all"),
	active_status: z.enum(["active", "inactive", "all"]).default("active"),
	media_type: z
		.enum(["all", "video", "image", "meme", "image_and_meme", "none"])
		.default("all"),
	platforms: z.string().optional(), // comma-separated: facebook, instagram, audience_network, messenger, threads
	start_date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(), // YYYY-MM-DD format
	end_date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(), // YYYY-MM-DD format
	sort_by: z
		.enum(["most_recent", "impressions_high_to_low"])
		.default("impressions_high_to_low"),

	// Pagination
	next_page_token: z.string().optional(),

	// Enterprise
	zero_retention: z.boolean().optional(),
});

export type MetaAdLibrarySearchParams = z.infer<
	typeof MetaAdLibrarySearchSchema
>;

export async function addAdvertiser(data: {
	pageId: string;
	pageName: string | undefined;
	categories: readonly string[] | undefined;
	isAaaEligible: boolean | undefined;
	pageProfileUri: string | undefined;
	pageProfilePictureUrl: string | undefined;
	pageCategories: readonly string[] | undefined;
	pageLikeCount: number | undefined;
}) {
	const db = getDb();

	const {
		pageId,
		pageName,
		categories,
		isAaaEligible,
		pageProfileUri,
		pageProfilePictureUrl,
		pageLikeCount,
	} = data;

	await db
		.insert(advertisers)
		.values({
			pageId,
			pageName,
			categories: JSON.stringify(categories),
			isAaaEligible: isAaaEligible ? 1 : 0,
			pageProfileUri,
			pageProfilePictureUrl,
			pageLikeCount,
		})
		.onConflictDoUpdate({
			target: advertisers.pageId,
			set: {
				...(pageName ? { pageName } : {}),
				...(categories?.length
					? { categories: JSON.stringify(categories) }
					: {}),
				...(isAaaEligible !== undefined
					? { isAaaEligible: isAaaEligible ? 1 : 0 }
					: {}),
				...(pageProfileUri ? { pageProfileUri } : {}),
				...(pageProfilePictureUrl ? { pageProfilePictureUrl } : {}),
				...(pageLikeCount !== undefined ? { pageLikeCount } : {}),
			},
		});
}

export async function getAdvertiserData(pageId?: string) {
	const db = getDb();

	if (pageId?.trim()) {
		const result = await db
			.select()
			.from(advertisers)
			.where(eq(advertisers.pageId, pageId))
			.limit(1);

		if (!result.length) {
			return null;
		}
		return result;
	}

	const result = await db
		.select()
		.from(advertisers)
		.orderBy(desc(advertisers.updatedAt))
		.limit(25);

	if (!result.length) {
		return null;
	}
	return result;
}
