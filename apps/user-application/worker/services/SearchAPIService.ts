import { getAdvertisers } from "@repo/data-ops/queries/advertisers";
import { Config, type ConfigError, Context, Effect, Schema as S } from "effect";
import {
	GetAdvertisersFetchError,
	NoInputError,
	ParseError,
	SearchAPIError,
} from "../features/metaAds/errors";
import {
	type AdSchema,
	MetaAdsResponseSchema,
	type PageResultSchema,
} from "../features/metaAds/schemas";
import { fakeAdData, teslaPages } from "../features/metaAds/tests/dummy-data";

// Port
export class SearchAPIService extends Context.Tag("SearchAPIService")<
	SearchAPIService,
	{
		readonly searchPages: (query: string) => Effect.Effect<
			// S.Schema.Type<typeof AdLibraryResponse>,
			Array<S.Schema.Type<typeof PageResultSchema>>,
			SearchAPIError | ParseError | ConfigError.ConfigError
		>;
		readonly getAds: (
			pageId: string,
		) => Effect.Effect<
			Array<S.Schema.Type<typeof AdSchema>>,
			NoInputError | GetAdvertisersFetchError | ConfigError.ConfigError
		>;
	}
>() {}

// // Adapaters
export const testSearchAPI: Context.Tag.Service<SearchAPIService> = {
	searchPages: (_query: string) => Effect.succeed(teslaPages.page_results),
	getAds: () => Effect.succeed(fakeAdData.ads),
};

export const liveSearchAPI: Context.Tag.Service<SearchAPIService> = {
	searchPages: (query: string) =>
		Effect.gen(function* () {
			const search_api_key = yield* Config.string("SEARCH_API_KEY");

			const url = "https://www.searchapi.io/api/v1/search";
			const params = new URLSearchParams({
				engine: "meta_ad_library_page_search",
				q: query,
				api_key: search_api_key,
			});

			const response = yield* Effect.tryPromise({
				try: () => fetch(`${url}?${params}`),
				catch: (error) => new SearchAPIError({ cause: error }),
			});

			const json = yield* Effect.tryPromise({
				try: () => response.json(),
				catch: (error) => new SearchAPIError({ cause: error }),
			});

			const metaAds = yield* S.decodeUnknown(MetaAdsResponseSchema)(json).pipe(
				Effect.mapError((e) => new ParseError({ cause: e })),
			);

			// Explicitly return non-undefined array
			return (metaAds.page_results ?? []) as Array<
				S.Schema.Type<typeof PageResultSchema>
			>;
		}),
	getAds: (pageId: string) =>
		Effect.gen(function* () {
			const api_key = yield* Config.string("SEARCH_API_KEY");
			if (!pageId?.trim()) {
				return yield* new NoInputError({
					cause: new Error("A pageId is required to fetch advertiser data."),
				});
			}
			const result = yield* Effect.tryPromise({
				try: () => getAdvertisers({ page_id: pageId, api_key }),
				catch: (error) => new GetAdvertisersFetchError({ cause: error }),
			});
			return result?.ads ?? [];
		}),
};

// export const metaSearchAPI: Context.Tag.Service<SearchAPIService> = {
// 	searchPages: (query: string) =>
// 		Effect.gen(function* () {
// 			const meta_api_token = yield* Config.string("META_API_TOKEN");

// 			const url = "https://graph.facebook.com/v24.0/ads_archive";
// 			const params = new URLSearchParams({
// 				search_terms: query,
// 				ad_reached_countries: encodeArray([
// 					"US",
// 					"GB",
// 					"CA",
// 					"AU",
// 					"BR",
// 					"IN",
// 					"DE",
// 					"FR",
// 					"ES",
// 					"IT",
// 					"JP",
// 					"MX",
// 					"NL",
// 					"SE",
// 					"NO",
// 					"DK",
// 					"FI",
// 					"IE",
// 					"NZ",
// 					"SG",
// 					"PH",
// 					"KR",
// 					"TW",
// 					"HK",
// 					"IL",
// 					"AE",
// 					"SA",
// 					"ZA",
// 					"NG",
// 					"KE",
// 				]),
// 				languages: encodeArray(["en"]),
// 				access_token: meta_api_token,
// 			});

// 			console.log({ url: `${url}?${params}` });

// 			const response = yield* Effect.tryPromise({
// 				try: () => fetch(`${url}?${params}&fields=page_id,page_name`),
// 				catch: (error) => new SearchAPIError({ cause: error }),
// 			});

// 			const text = yield* Effect.tryPromise({
// 				try: () => response.text(),
// 				catch: (error) => new SearchAPIError({ cause: error }),
// 			});

// 			console.log("Meta API response:", text);

// 			const metaAdPages = yield* S.decode(S.parseJson(AdLibraryResponse))(
// 				text,
// 			).pipe(Effect.mapError((e) => new ParseError({ cause: e })));

// 			const uniquePages = [
// 				...new Map(metaAdPages.data.map((ad) => [ad.page_id, ad])).values(),
// 			];

// 			return { data: uniquePages };
// 		}),
// 	getAds: (pageId: string) =>
// 		Effect.gen(function* () {
// 			const api_key = yield* Config.string("SEARCH_API_KEY");
// 			if (!pageId?.trim()) {
// 				return yield* new NoInputError();
// 			}
// 			const result = yield* Effect.tryPromise({
// 				try: () => getAdvertisers({ page_id: pageId, api_key }),
// 				catch: (error) => new GetAdvertisersFetchError({ cause: error }),
// 			});
// 			return result?.ads ?? [];
// 		}),
// };

// const JsonStringArray = S.parseJson(S.Array(S.String));
// const encodeArray = S.encodeSync(JsonStringArray);

// &fields=id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,age_country_gender_reach_breakdown,beneficiary_payers,br_total_reach,bylines,currency,delivery_by_region,demographic_distribution,estimated_audience_size,eu_total_reach,impressions,languages,page_id,page_name,publisher_platforms,spend,target_ages,target_gender,target_locations,total_reach_by_location
