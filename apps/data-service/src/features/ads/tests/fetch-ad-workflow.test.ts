import { env } from "cloudflare:test";
import { initDatabase } from "@repo/data-ops/database";
import {
	liveSearchAPI,
	type SearchAPIService,
	testSearchAPI,
} from "@repo/data-ops/services/adsAPIService";
import {
	type D1Database,
	stagingDBAPI,
	testD1API,
} from "@repo/data-ops/services/D1DB";
import type { Context } from "effect";
import { Effect } from "effect";
import { beforeAll, describe, expect, it } from "vitest";
import { extactAdvertiserData } from "../utils";
import { fakeAdData } from "./dummy-data";

beforeAll(async () => {
	await env.DB.exec(
		`CREATE TABLE IF NOT EXISTS "advertisers" ("page_id" text PRIMARY KEY NOT NULL, "page_name" text, "categories" text, "is_aaa_eligible" integer, "page_profile_uri" text, "page_profile_picture_url" text, "page_categories" text, "page_like_count" integer, "created_at" text DEFAULT (datetime('now')), "updated_at" text DEFAULT (datetime('now')), "total_ads" integer, "active_ads" integer, "ads_by_format" text, "ads_by_category" text, "platform_distribution" text, "advertising_since" text, "average_ad_lifespan_days" real, "longest_running_ad" text)`,
	);
	initDatabase(env.DB);
});

// ---------------------------------------------------------------------------
// Outgoing Adapter (Contract) Tests
//
// These verify that *both* the test doubles and production implementations
// satisfy the same contract.
// ---------------------------------------------------------------------------

describe("SearchAPIService contract", () => {
	const implementations: {
		name: string;
		impl: Context.Tag.Service<SearchAPIService>;
	}[] = [
		{ name: "testSearchAPI (test double)", impl: testSearchAPI },
		// Uncomment when you have a SEARCH_API_KEY available in the test env:
		{ name: "liveSearchAPI (production)", impl: liveSearchAPI },
	];

	implementations.forEach(({ name, impl }) => {
		describe(name, () => {
			it("getAds returns an array for a valid pageId", async () => {
				const result = await Effect.runPromise(impl.getAds("111454522278222"));
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBeGreaterThan(0);
			}, 10_000);

			it("getAds fails with NoInputError for empty pageId", async () => {
				const error = await Effect.runPromise(
					impl.getAds("").pipe(Effect.flip),
				);
				expect(error._tag).toBe("NoInputError");
			});
		});
	});
});

describe("D1Database contract", () => {
	const implementations: {
		name: string;
		impl: Context.Tag.Service<D1Database>;
	}[] = [
		{ name: "testD1API (test double)", impl: testD1API },
		{ name: "stagingDBAPI (production)", impl: stagingDBAPI },
	];

	implementations.forEach(({ name, impl }) => {
		describe(name, () => {
			it("saveAdvertiserData returns the pageId on success", async () => {
				const advertiserData = extactAdvertiserData(fakeAdData.ads);
				if (!advertiserData) throw new Error("No advertiser data");
				const result = await Effect.runPromise(
					impl
						.saveAdvertiserData(advertiserData)
						.pipe(
							Effect.tapError((e) =>
								Effect.sync(() => console.log("cause:", e.cause)),
							),
						),
				);
				expect(typeof result).toBe("string");
				expect(result).toBe(advertiserData.pageId);
			});

			it("getAdvertiserData returns an array", async () => {
				const result = await Effect.runPromise(impl.getAdvertiserData());
				expect(Array.isArray(result)).toBe(true);
			});

			it("getAdvertiserData with a pageId returns results for that page", async () => {
				const result = await Effect.runPromise(
					impl.getAdvertiserData("111454522278222"),
				);
				expect(result).not.toBeNull();
				expect(Array.isArray(result)).toBe(true);
				expect(result!.length).toBeGreaterThan(0);
			});
		});
	});
});
