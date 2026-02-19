// import { getAdvertisers } from "@repo/data-ops/queries/advertisers";
import { TRPCError } from "@trpc/server";
import { Effect } from "effect";
import { z } from "zod";
import { getAdvertiser, getPages } from "@/worker/features/metaAds/effects";
import { KVStore, stagingKVAPI } from "@/worker/services/KVStore";
import { t } from "@/worker/trpc/trpc-instance";
import { D1Database, stagingDBAPI } from "../../services/D1Database";
import { R2Storage, stagingR2API } from "../../services/R2Storage";
import {
	liveSearchAPI,
	// testSearchAPI,
	// metaSearchAPI,
	SearchAPIService,
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
				Effect.provideService(
					SearchAPIService,
					liveSearchAPI,
					// metaSearchAPI,
				),
				Effect.provideService(KVStore, stagingKVAPI(ctx.env)),
				Effect.catchTags({
					SearchAPIError: (error) =>
						Effect.die(
							new TRPCError({
								code: "BAD_GATEWAY",
								message: "Search API request failed",
								cause: error.cause,
							}),
						),
					KVFetchError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "KV fetch error",
								cause: error.cause,
							}),
						),
					KVSaveError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "KV Save error",
								cause: error.cause,
							}),
						),

					ConfigError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Server configuration error",
								cause: error,
							}),
						),

					ParseError: (error) =>
						Effect.die(
							new TRPCError({
								code: "UNPROCESSABLE_CONTENT",
								message: "Schema validation failed",
								cause: error.cause,
							}),
						),

					NoResultsError: () =>
						Effect.die(
							new TRPCError({
								code: "NOT_FOUND",
								message: "No results found for the given query",
							}),
						),
				}),
			);
			return runSafe(pageResults);
		}),

	getAllAdvertisers: t.procedure
		.input(z.object({ page_id: z.string().optional() }))
		.query(async ({ input, ctx }) => {
			const adFetcher = getAdvertiser(input.page_id).pipe(
				Effect.provideService(SearchAPIService, liveSearchAPI),
				Effect.provideService(R2Storage, stagingR2API(ctx.env)),
				Effect.provideService(D1Database, stagingDBAPI),
				Effect.catchTags({
					GetAdvertisersFetchError: (error) =>
						Effect.die(
							new TRPCError({
								code: "BAD_GATEWAY",
								message: "Failed to fetch ads",
								cause: error.cause,
							}),
						),
					ConfigError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Server configuration error",
								cause: error,
							}),
						),
					R2FetchError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to read from R2 storage",
								cause: error.cause,
							}),
						),

					R2SaveError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to save to R2 storage",
								cause: error.cause,
							}),
						),

					D1ReadError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to read from D1 storage",
								cause: error.cause,
							}),
						),

					D1WriteError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to write to D1 storage",
								cause: error.cause,
							}),
						),

					R2ParseError: (error) =>
						Effect.die(
							new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: "Failed to parse stored data",
								cause: error.cause,
							}),
						),

					NoResultsError: (error) =>
						Effect.die(
							new TRPCError({
								code: "NOT_FOUND",
								message: "No results found",
								cause: error.cause,
							}),
						),

					NoInputError: (error) =>
						Effect.die(
							new TRPCError({
								code: "BAD_REQUEST",
								message: "No input provided",
								cause: error.cause,
							}),
						),
				}),
			);

			return runSafe(adFetcher);
		}),
});

const runSafe = <A>(effect: Effect.Effect<A, never, never>) =>
	Effect.runPromise(effect);
