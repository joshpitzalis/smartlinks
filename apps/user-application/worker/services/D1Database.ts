import type { AdvertiserData } from "@repo/data-ops/DTOs/ads";
import {
	addAdvertiser,
	getAdvertiserData,
} from "@repo/data-ops/queries/advertisers";
import { Context, Effect } from "effect";
import {
	D1ReadError,
	D1WriteError,
	NoInputError,
	type NoResultsError,
} from "../features/metaAds/errors";

export class D1Database extends Context.Tag("D1Database")<
	D1Database,
	{
		readonly getAdvertiserData: (
			pageId?: string,
		) => Effect.Effect<
			Awaited<ReturnType<typeof getAdvertiserData>>,
			NoResultsError | D1ReadError,
			never
		>;
		saveAdvertiserData: (
			ads: AdvertiserData,
		) => Effect.Effect<string, D1WriteError | NoInputError, never>;
	}
>() {}

export const testD1API = {
	getAdvertiserData: (_pageId?: string) =>
		Effect.succeed([
			{
				pageId: "111454522278222",
				pageName: "Bitly",
				categories: JSON.stringify(["UNKNOWN"]),
				isAaaEligible: 1,
				pageProfileUri: "https://www.facebook.com/bitly/",
				pageProfilePictureUrl:
					"https://scontent-atl3-1.xx.fbcdn.net/v/t39.35426-6/497738888_1200326937859589_1955242157429792582_n.jpg?stp=dst-jpg_s60x60_tt6&_nc_cat=106&ccb=1-7&_nc_sid=c53f8f&_nc_ohc=xrOBWIOIou4Q7kNvwFmIP25&_nc_oc=AdktpQc6vSbGL8Qe2Ku9AUfJbaPQ5KeNN2UebWpXNYqWeMFucoIe9J2TIbgrfu0iEdrWWWy6Kugm5UaW8LvMPLjD&_nc_zt=14&_nc_ht=scontent-atl3-1.xx&_nc_gid=5k1fYlAtg2I98xfihq-9MA&oh=00_Afua5L6zQ45hKk2S72WkHJudHm6yFAsg9eH4cPpEFdcgxA&oe=698D06B4",
				pageCategories: JSON.stringify(["Business"]),
				pageLikeCount: 134781,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		]),
	saveAdvertiserData: (_advertiserData: AdvertiserData) =>
		Effect.succeed("string"),
};

export const stagingDBAPI = {
	getAdvertiserData: (pageId?: string) =>
		Effect.gen(function* () {
			if (pageId?.trim()) {
				const results = yield* Effect.tryPromise({
					try: () => getAdvertiserData(pageId),
					catch: (error) => new D1ReadError({ cause: error }),
				});

				// if (!results) return yield* new NoResultsError();
				return results;
			}

			const results = yield* Effect.tryPromise({
				try: () => getAdvertiserData(),
				catch: (error) => new D1ReadError({ cause: error }),
			});

			// if (!results) return yield* new NoResultsError();
			return results;
		}),
	saveAdvertiserData: (advertiserData: AdvertiserData) =>
		Effect.gen(function* () {
			if (!advertiserData) {
				return yield* new NoInputError({
					cause: new Error("Advertiser data is required"),
				});
			}

			yield* Effect.tryPromise({
				try: () => addAdvertiser(advertiserData),
				catch: (error) => new D1WriteError({ cause: error }),
			});

			return advertiserData.pageId;
		}),
};
