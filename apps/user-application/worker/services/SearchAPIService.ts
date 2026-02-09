import { Config, type ConfigError, Context, Effect, Schema as S } from "effect";
import { teslaPages } from "@/worker/features/metaAds/tests/dummy-data";
import { ParseError, SearchAPIError } from "../features/metaAds/errors";
import {
	MetaAdsResponseSchema,
	type PageResultSchema,
} from "../features/metaAds/schemas";

// Port
export class SearchAPIService extends Context.Tag("SearchAPIService")<
	SearchAPIService,
	{
		readonly searchPages: (
			query: string,
		) => Effect.Effect<
			Array<S.Schema.Type<typeof PageResultSchema>>,
			SearchAPIError | ParseError | ConfigError.ConfigError
		>;
	}
>() {}

// Adapaters
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
};

export const testSearchAPI: Context.Tag.Service<SearchAPIService> = {
	searchPages: (_query: string) => Effect.succeed(teslaPages.page_results),
};
