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
	page_id: S.optional(S.String),
	category: S.optional(S.String),
	image_uri: S.optional(S.String),
	likes: S.optional(S.Number),
	verification: S.optional(S.String),
	name: S.optional(S.String),
	entity_type: S.optional(S.String),
	ig_username: S.optional(S.String),
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
