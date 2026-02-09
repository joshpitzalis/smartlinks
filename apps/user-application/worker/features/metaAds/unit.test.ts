import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { getPages } from "@/worker/features/metaAds/effects";
import { SearchAPIService, testSearchAPI } from "../../services/getPages";

describe("URL to Page Id", () => {
	it.only("should return pageIds when given a URL ", async () => {
		const result = await Effect.runPromise(
			getPages("test query").pipe(
				Effect.provideService(SearchAPIService, testSearchAPI),
			),
		);

		expect(result).toEqual([
			{
				page_id: "123",
				name: "Test Page",
				category: "Business",
				likes: 1000,
			},
		]);
	});
	it("should tell you if no page Ids are available", async () => {});
	it("should validate the URL", async () => {
		// not a location
	});
	it("should accept variations on the url", async () => {
		// just the username
		// a company name
		// a url with a bunch of parameters
	});
	it("cache results to a database", async () => {});
	it("search the database for a cache result before triggering the API", async () => {});
});

describe.skip("Advertiser Page Logic", () => {
	it("should remove the Gannt chart when I enter a new page search", async () => {});
});
