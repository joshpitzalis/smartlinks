import { Context, Effect, Schema } from "effect";
import {
	R2FetchError,
	R2ParseError,
	R2SaveError,
} from "../features/metaAds/errors";
import {
	AdSchema,
	type AdSchemaType,
	// type MetaAdLibraryResponse, MetaAdLibraryResponseSchema
} from "../features/metaAds/schemas";
import { fakeAdData } from "../features/metaAds/tests/dummy-data";

export class R2Storage extends Context.Tag("R2Storage")<
	R2Storage,
	{
		readonly getAds: (
			pageId: string,
		) => Effect.Effect<AdSchemaType[], R2FetchError | R2ParseError, never>;

		saveAds: (
			advertisers: AdSchemaType[],
		) => Effect.Effect<void, R2SaveError, never>;
	}
>() {}

export const testR2API = () => ({
	getAds: (_pageId: string) => Effect.succeed(fakeAdData.ads),
	saveAds: (_advertiserData: AdSchemaType[]) => Effect.void,
});

export const stagingR2API = (env: Env) => ({
	getAds: (pageId: string) =>
		Effect.gen(function* () {
			const listed = yield* Effect.tryPromise({
				try: () =>
					env.ADVERTISER_STORAGE.list({ prefix: `advertisers/${pageId}/` }),
				catch: (error) =>
					new R2FetchError({ cause: error, id: "ADVERTISER_STORAGE" }),
			});

			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
			const recentObjects = listed.objects.filter(
				(obj) => obj.uploaded > thirtyDaysAgo,
			);

			const objects = yield* Effect.forEach(
				recentObjects,
				(obj) =>
					Effect.gen(function* () {
						const r2Obj = yield* Effect.tryPromise({
							try: () => env.ADVERTISER_STORAGE.get(obj.key),
							catch: (error) =>
								new R2FetchError({ cause: error, id: "ADVERTISER_STORAGE" }),
						});
						if (!r2Obj) return null;
						const text = yield* Effect.tryPromise({
							try: () => r2Obj.text(),
							catch: (error) =>
								new R2ParseError({ cause: error, id: "ADVERTISER_STORAGE" }),
						});
						return yield* Schema.decodeUnknown(Schema.parseJson(AdSchema))(
							text,
						).pipe(
							Effect.mapError(
								(e) => new R2ParseError({ cause: e, id: "ADVERTISER_STORAGE" }),
							),
						);
					}),
				{ concurrency: 10 },
			);

			return objects.filter((obj) => obj !== null);
		}),
	saveAds: (ads: AdSchemaType[]) =>
		Effect.forEach(
			ads,
			(ad) =>
				Effect.gen(function* () {
					const advertiserPageId = ad.page_id;
					const r2path = `advertisers/${advertiserPageId}/${Date.now()}`;
					yield* Effect.tryPromise({
						try: () => env.ADVERTISER_STORAGE.put(r2path, JSON.stringify(ad)),
						catch: (error) =>
							new R2SaveError({ cause: error, id: "ADVERTISER_STORAGE" }),
					});
				}),
			{ concurrency: 10 },
		),
});
