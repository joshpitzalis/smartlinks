import { getAdvertisers } from "@repo/data-ops/queries/advertisers";
import { z } from "zod";
import { fakeAdData } from "@/worker/trpc/routers/dummy-data";
import { t } from "@/worker/trpc/trpc-instance";

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

export const advertiserTrpcRoutes = t.router({
	getAllAdvertisers: t.procedure
		.input(
			z.object({
				page_id: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const metaAdLibraryAPI = `https://www.searchapi.io/api/v1/search`;

			const searchParams: MetaAdLibrarySearchParams = {
				engine: "meta_ad_library",
				api_key: process.env.SEARCH_API_KEY!,
				page_id: input.page_id,
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
				console.log("Connecting to:", url);
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
				const metaAds = MetaAdLibraryResponseSchema.parse(metaAdsResponse);
				console.log(JSON.stringify(metaAds));

				return metaAds;
			} catch (error) {
				console.error("Error fetching from the Meta Ad Library API:", error);
			}

			// return getAdvertisers();
			// return fakeAdData;
		}),
});

const SearchMetadataSchema = z.object({
	id: z.string(),
	status: z.string(),
	created_at: z.string(),
	request_time_taken: z.number(),
	parsing_time_taken: z.number(),
	total_time_taken: z.number(),
	request_url: z.string(),
	html_url: z.string(),
	json_url: z.string(),
});

const SearchParametersSchema = z.object({
	engine: z.string(),
	page_id: z.string(),
	ad_type: z.string(),
	country: z.string(),
	media_type: z.string(),
	sort_by: z.string(),
});

const SearchInformationSchema = z.object({
	total_results: z.number(),
	ad_library_page_info: z.object({ hidden_ads: z.number() }),
	page: z.object({ name: z.string(), id: z.string() }),
});

const VideoSchema = z.object({
	video_hd_url: z.string(),
	video_preview_image_url: z.string(),
	video_sd_url: z.string(),
});

const CardSchema = z.object({
	body: z.string().optional(),
	cta_type: z.string().optional(),
	link_description: z.string().optional(),
	link_url: z.string().optional(),
	title: z.string().optional(),
	cta_text: z.string().optional(),
	original_image_url: z.string().optional(),
	resized_image_url: z.string().optional(),
});

const SnapshotSchema = z.object({
	page_id: z.string(),
	page_profile_uri: z.string(),
	page_name: z.string(),
	page_profile_picture_url: z.string(),
	caption: z.string().optional(),
	cta_text: z.string().optional(),
	body: z.object({ text: z.string() }).optional(),
	cta_type: z.string().optional(),
	display_format: z.string().optional(),
	link_description: z.string().optional(),
	link_url: z.string().optional(),
	page_categories: z.array(z.string()).optional(),
	page_like_count: z.number().optional(),
	title: z.string().optional(),
	videos: z.array(VideoSchema).optional(),
	cards: z.array(CardSchema).optional(),
});

const AdSchema = z.object({
	ad_archive_id: z.string(),
	collation_count: z.number().optional(),
	collation_id: z.string().optional(),
	page_id: z.string(),
	snapshot: SnapshotSchema,
	is_active: z.boolean().optional(),
	page_name: z.string(),
	impressions_with_index: z
		.object({ impressions_index: z.number() })
		.optional(),
	gated_type: z.string().optional(),
	categories: z.array(z.string()).optional(),
	is_aaa_eligible: z.boolean().optional(),
	end_date: z.string().optional(),
	publisher_platform: z.array(z.string()).optional(),
	start_date: z.string().optional(),
	hide_data_status: z.string().optional(),
});

export type AdSchemaType = z.infer<typeof AdSchema>;

export const MetaAdLibraryResponseSchema = z.object({
	search_metadata: SearchMetadataSchema,
	search_parameters: SearchParametersSchema,
	search_information: SearchInformationSchema,
	ads: z.array(AdSchema),
});

export type MetaAdLibraryResponse = z.infer<typeof MetaAdLibraryResponseSchema>;
