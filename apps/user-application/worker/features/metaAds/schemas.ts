import { Schema as S } from "effect";

const SearchMetadataSchema = S.Struct({
	id: S.optional(S.String),
	status: S.optional(S.String),
	created_at: S.optional(S.String), // or S.DateTimeUtc for datetime validation
	request_time_taken: S.optional(S.Number),
	parsing_time_taken: S.optional(S.Number),
	total_time_taken: S.optional(S.Number),
	request_url: S.optional(S.String), // Effect Schema doesn't have built-in URL validation
	html_url: S.optional(S.String),
	json_url: S.optional(S.String),
});

const SearchParametersSchema = S.Struct({
	engine: S.optional(S.Literal("meta_ad_library_page_search")),
	q: S.optional(S.String),
	country: S.optional(S.String),
	ad_type: S.optional(
		S.Literal(
			"all",
			"political_and_issue_ads",
			"housing_ads",
			"employment_ads",
			"credit_ads",
		),
	),
});

export const PageResultSchema = S.Struct({
	page_id: S.String,
	category: S.optional(S.String),
	image_uri: S.optional(S.String),
	likes: S.optional(S.Number),
	verification: S.optional(S.String),
	name: S.String,
	entity_type: S.optional(S.String),
	ig_username: S.optional(S.String),
	ig_verification: S.optional(S.Boolean),
	ig_followers: S.optional(S.Number),
	page_alias: S.optional(S.String),
});

export const MetaAdsResponseSchema = S.Struct({
	search_metadata: S.optional(SearchMetadataSchema),
	search_parameters: S.optional(SearchParametersSchema),
	page_results: S.optional(S.Array(PageResultSchema)),
});

// Type inference
export type MetaAdsResponse = S.Schema.Type<typeof MetaAdsResponseSchema>;
export type FacebookPageResults = S.Schema.Type<typeof PageResultSchema>;

// advertiser endpoint

import { Schema } from "effect";

const AdMetadataSchema = Schema.Struct({
	id: Schema.optionalWith(Schema.String, { exact: true }),
	status: Schema.optionalWith(Schema.String, { exact: true }),
	created_at: Schema.optionalWith(Schema.String, { exact: true }),
	request_time_taken: Schema.optionalWith(Schema.Number, { exact: true }),
	parsing_time_taken: Schema.optionalWith(Schema.Number, { exact: true }),
	total_time_taken: Schema.optionalWith(Schema.Number, { exact: true }),
	request_url: Schema.optionalWith(Schema.String, { exact: true }),
	html_url: Schema.optionalWith(Schema.String, { exact: true }),
	json_url: Schema.optionalWith(Schema.String, { exact: true }),
});

const AdParametersSchema = Schema.Struct({
	engine: Schema.optionalWith(Schema.String, { exact: true }),
	page_id: Schema.String,
	ad_type: Schema.optionalWith(Schema.String, { exact: true }),
	country: Schema.optionalWith(Schema.String, { exact: true }),
	media_type: Schema.optionalWith(Schema.String, { exact: true }),
	sort_by: Schema.optionalWith(Schema.String, { exact: true }),
});

const SearchInformationSchema = Schema.Struct({
	total_results: Schema.optionalWith(Schema.Number, { exact: true }),
	ad_library_page_info: Schema.optionalWith(
		Schema.Struct({
			hidden_ads: Schema.optionalWith(Schema.Number, { exact: true }),
		}),
		{ exact: true },
	),
	page: Schema.optionalWith(
		Schema.Struct({
			name: Schema.optionalWith(Schema.String, { exact: true }),
			id: Schema.optionalWith(Schema.String, { exact: true }),
		}),
		{ exact: true },
	),
});

const VideoSchema = Schema.Struct({
	video_hd_url: Schema.optionalWith(Schema.String, { exact: true }),
	video_preview_image_url: Schema.optionalWith(Schema.String, { exact: true }),
	video_sd_url: Schema.optionalWith(Schema.String, { exact: true }),
});

const CardSchema = Schema.Struct({
	body: Schema.optionalWith(Schema.String, { exact: true }),
	cta_type: Schema.optionalWith(Schema.String, { exact: true }),
	link_description: Schema.optionalWith(Schema.String, { exact: true }),
	link_url: Schema.optionalWith(Schema.String, { exact: true }),
	title: Schema.optionalWith(Schema.String, { exact: true }),
	cta_text: Schema.optionalWith(Schema.String, { exact: true }),
	original_image_url: Schema.optionalWith(Schema.String, { exact: true }),
	resized_image_url: Schema.optionalWith(Schema.String, { exact: true }),
});

const SnapshotSchema = Schema.Struct({
	page_id: Schema.optionalWith(Schema.String, { exact: true }),
	page_profile_uri: Schema.optionalWith(Schema.String, { exact: true }),
	page_name: Schema.optionalWith(Schema.String, { exact: true }),
	page_profile_picture_url: Schema.optionalWith(Schema.String, { exact: true }),
	caption: Schema.optionalWith(Schema.String, { exact: true }),
	cta_text: Schema.optionalWith(Schema.String, { exact: true }),
	body: Schema.optionalWith(
		Schema.Struct({
			text: Schema.optionalWith(Schema.String, { exact: true }),
		}),
		{ exact: true },
	),
	cta_type: Schema.optionalWith(Schema.String, { exact: true }),
	display_format: Schema.optionalWith(Schema.String, { exact: true }),
	link_description: Schema.optionalWith(Schema.String, { exact: true }),
	link_url: Schema.optionalWith(Schema.String, { exact: true }),
	page_categories: Schema.optionalWith(Schema.Array(Schema.String), {
		exact: true,
	}),
	page_like_count: Schema.optionalWith(Schema.Number, { exact: true }),
	title: Schema.optionalWith(Schema.String, { exact: true }),
	videos: Schema.optionalWith(Schema.Array(VideoSchema), { exact: true }),
	cards: Schema.optionalWith(Schema.Array(CardSchema), { exact: true }),
});

export const AdSchema = Schema.Struct({
	ad_archive_id: Schema.optionalWith(Schema.String, { exact: true }),
	collation_count: Schema.optionalWith(Schema.Number, { exact: true }),
	collation_id: Schema.optionalWith(Schema.String, { exact: true }),
	page_id: Schema.optionalWith(Schema.String, { exact: true }),
	snapshot: Schema.optionalWith(SnapshotSchema, { exact: true }),
	is_active: Schema.optionalWith(Schema.Boolean, { exact: true }),
	page_name: Schema.optionalWith(Schema.String, { exact: true }),
	impressions_with_index: Schema.optionalWith(
		Schema.Struct({
			impressions_index: Schema.optionalWith(Schema.Number, { exact: true }),
		}),
		{ exact: true },
	),
	gated_type: Schema.optionalWith(Schema.String, { exact: true }),
	categories: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
	is_aaa_eligible: Schema.optionalWith(Schema.Boolean, { exact: true }),
	end_date: Schema.optionalWith(Schema.String, { exact: true }),
	publisher_platform: Schema.optionalWith(Schema.Array(Schema.String), {
		exact: true,
	}),
	start_date: Schema.optionalWith(Schema.String, { exact: true }),
	hide_data_status: Schema.optionalWith(Schema.String, { exact: true }),
});

export const MetaAdLibraryResponseSchema = Schema.Struct({
	search_metadata: AdMetadataSchema,
	search_parameters: AdParametersSchema,
	search_information: SearchInformationSchema,
	ads: Schema.Array(AdSchema),
});

export type MetaAdLibraryResponse = typeof MetaAdLibraryResponseSchema.Type;
export type AdSchemaType = typeof AdSchema.Type;
