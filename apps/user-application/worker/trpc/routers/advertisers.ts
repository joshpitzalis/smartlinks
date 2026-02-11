// import { getAdvertisers } from "@repo/data-ops/queries/advertisers";
import { TRPCError } from "@trpc/server";
import { Effect } from "effect";
import { z } from "zod";
import { getAdvertiser, getPages } from "@/worker/features/metaAds/effects";
import { KVStore, stagingKVAPI } from "@/worker/services/KVStore";
import { t } from "@/worker/trpc/trpc-instance";
import { R2Storage, stagingR2API } from "../../services/R2Storage";
import {
	liveSearchAPI,
	SearchAPIService,
	testSearchAPI,
} from "../../services/SearchAPIService";

// Key tRPC error codes:
// BAD_REQUEST - Invalid input
// UNAUTHORIZED - Not authenticated
// FORBIDDEN - Not authorized
// NOT_FOUND - Resource not found
// INTERNAL_SERVER_ERROR - Server errors
// TIMEOUT - Request timeout
// https://trpc.io/docs/server/error-handling

export const advertiserTrpcRoutes = t.router({
	searchPages: t.procedure
		.input(z.object({ query: z.string() }))
		.query(async ({ input, ctx }) => {
			const pageResults = getPages(input.query).pipe(
				Effect.provideService(SearchAPIService, liveSearchAPI),
				Effect.provideService(KVStore, stagingKVAPI(ctx.env)),
				Effect.catchTags({
					SearchAPIError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "BAD_GATEWAY",
								message: "Search API request failed",
								cause: error.cause,
							}),
						),

					ConfigError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Server configuration error",
								cause: error,
							}),
						),

					ParseError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "UNPROCESSABLE_CONTENT",
								message: "Schema validation failed",
								cause: error.cause,
							}),
						),

					NoResultsError: () =>
						Effect.fail(
							new TRPCError({
								code: "NOT_FOUND",
								message: "No results found for the given query",
							}),
						),
				}),
			);
			return Effect.runPromise(pageResults);
		}),

	getAllAdvertisers: t.procedure
		.input(z.object({ page_id: z.string() }))
		.query(async ({ input, ctx }) => {
			const adFetcher = getAdvertiser(input.page_id).pipe(
				Effect.provideService(SearchAPIService, liveSearchAPI),
				Effect.provideService(R2Storage, stagingR2API(ctx.env)),
				Effect.catchTags({
					GetAdvertisersFetchError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "BAD_GATEWAY",
								message: "Failed to fetch ads",
								cause: error.cause,
							}),
						),
					ConfigError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Server configuration error",
								cause: error,
							}),
						),
					R2FetchError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to read from storage",
								cause: error.cause,
							}),
						),
					R2ParseError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to parse stored data",
								cause: error.cause,
							}),
						),
					R2SaveError: (error) =>
						Effect.fail(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to save to storage",
								cause: error.cause,
							}),
						),
				}),
			);

			return Effect.runPromise(adFetcher);

			// const { page_id } = input;

			// return getAdvertisers({
			// 	page_id: page_id,
			// 	api_key: process.env.SEARCH_API_KEY,
			// });

			// return fakeAdData;
		}),
});
