import { getAdvertisers } from "@repo/data-ops/queries/advertisers";
import { TRPCError } from "@trpc/server";
import { Effect, ParseResult } from "effect";
import { z } from "zod";
import { getPages } from "@/worker/features/metaAds/effects";
import { fakeAdData } from "@/worker/trpc/routers/dummy-data";
import { t } from "@/worker/trpc/trpc-instance";
import { liveSearchAPI, SearchAPIService } from "../../services/getPages";

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
		.query(async ({ input }) =>
			Effect.runPromise(
				getPages(input.query).pipe(
					Effect.provideService(SearchAPIService, liveSearchAPI),
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
					}),

					Effect.catchAll((error) => {
						// Handle ParseResult.ParseError here
						if (ParseResult.isParseError(error)) {
							return Effect.fail(
								new TRPCError({
									code: "UNPROCESSABLE_CONTENT",
									message: `Schema validation failed: ${ParseResult.TreeFormatter.formatErrorSync(error)}`,
									cause: error,
								}),
							);
						}

						// Fallback for any other errors
						return Effect.fail(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "An unexpected error occurred",
								cause: error,
							}),
						);
					}),
				),
			),
		),

	getAllAdvertisers: t.procedure
		.input(z.object({ page_id: z.string() }))
		.query(async ({ input }) => {
			const { page_id } = input;
			console.log("Fetching advertisers for page_id:", page_id);

			// return getAdvertisers({
			// 	page_id: page_id,
			// 	api_key: process.env.SEARCH_API_KEY,
			// });
			return fakeAdData;
		}),
});
