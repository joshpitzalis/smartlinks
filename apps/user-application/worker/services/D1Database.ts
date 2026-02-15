import { addAdvertiser } from "@repo/data-ops/queries/advertisers";
import { Context, Effect } from "effect";
import { D1WriteError } from "../features/metaAds/errors";
import type { AdSchemaType } from "../features/metaAds/schemas";
import { fakeAdData } from "../features/metaAds/tests/dummy-data";
import type { AdvertiserData } from "../features/metaAds/utils";

export class D1Database extends Context.Tag("D1Database")<
	D1Database,
	{
		readonly getAdvertiserData: (
			pageId: string,
		) => Effect.Effect<AdSchemaType[], never, never>;
		saveAdvertiserData: (
			ads: AdvertiserData,
		) => Effect.Effect<string, D1WriteError, never>;
	}
>() {}

export const testD1API = {
	getAdvertiserData: (_pageId: string) => Effect.succeed(fakeAdData.ads),
	saveAdvertiserData: (_advertiserData: AdvertiserData) => Effect.void,
};

export const stagingDBAPI = {
	getAdvertiserData: (_pageId: string) => Effect.succeed([] as AdSchemaType[]),
	saveAdvertiserData: (advertiserData: AdvertiserData) =>
		Effect.gen(function* () {
			yield* Effect.tryPromise({
				try: () => addAdvertiser(advertiserData),
				catch: (error) => new D1WriteError({ cause: error }),
			});

			return advertiserData.pageId;
		}),
};
