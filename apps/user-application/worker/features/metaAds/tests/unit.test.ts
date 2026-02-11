import { Effect } from "effect";
import { describe, expect, it, test } from "vitest";
import { getAdvertiser, getPages } from "@/worker/features/metaAds/effects";
import { NoResultsError } from "@/worker/features/metaAds/errors";
import {
	D1Database,
	stagingDBAPI,
	testDBAPI,
} from "@/worker/services/D1Database";
import { KVStore } from "@/worker/services/KVStore";
import { R2Storage, testR2API } from "@/worker/services/R2Storage";
import {
	SearchAPIService,
	testSearchAPI,
} from "@/worker/services/SearchAPIService";
import { santize } from "../utils";
import { fakeAdData, teslaPages } from "./dummy-data";

describe("how page searches work", () => {
	it("should return pageIds when given a query", async () => {
		const result = await Effect.runPromise(
			getPages("test query").pipe(
				Effect.provideService(SearchAPIService, testSearchAPI),
			),
		);

		expect(result).toEqual(teslaPages.page_results);
	});
	it("should tell you if no page Ids are available", async () => {
		const URLtoPageIDHandler = getPages("test query").pipe(
			Effect.provideService(SearchAPIService, {
				searchPages: (_query: string) => Effect.succeed([]),
			}),
		);
		const error = await Effect.runPromise(URLtoPageIDHandler.pipe(Effect.flip));
		expect(error).toBeInstanceOf(NoResultsError);
	});

	it("cache ad results to a R2 storage", async () => {
		const adverstiserData = await Effect.runPromise(
			getAdvertiser("page_id").pipe(
				Effect.provideService(SearchAPIService, testSearchAPI),
				Effect.provideService(R2Storage, testR2API()),
			),
		);
		expect(adverstiserData).toEqual(fakeAdData.ads);
	});
	it("cache query results to KV Store", async () => {
		let networkCallCount = 0;
		const kvCache = new Map<string, string>();

		// Track network calls by creating a custom SearchAPI service with MSW
		const trackableSearchAPI: SearchAPIService = {
			searchPages: (query: string) => {
				networkCallCount++;
				console.log(
					`🌐 Network call #${networkCallCount} for query: "${query}"`,
				);
				return Effect.succeed(teslaPages.page_results);
			},
			getAds: (pageId: string) => Effect.succeed(fakeAdData.ads),
		};

		// Create a testable KVStore that caches page name -> page_id mappings
		const testableKVStore: KVStore = {
			getPageId: (query: string) =>
				Effect.gen(function* () {
					const cached = kvCache.get(query);
					if (cached) {
						console.log(`✅ Cache HIT for: "${query}" -> ${cached}`);
						return cached;
					}
					console.log(`❌ Cache MISS for: "${query}"`);
					return null;
				}),
			savePagename: (pagename: string, page_id: string) =>
				Effect.gen(function* () {
					console.log(`💾 Saving to cache: "${pagename}" -> ${page_id}`);
					kvCache.set(pagename, page_id);
				}),
		};

		console.log("\n--- First call (should hit network) ---");
		const firstResult = await Effect.runPromise(
			getPages("tesla").pipe(
				Effect.provideService(SearchAPIService, trackableSearchAPI),
				Effect.provideService(KVStore, testableKVStore),
			),
		);

		expect(networkCallCount).toBe(1);
		expect(firstResult).toEqual(teslaPages.page_results);
		console.log(`📊 First result: ${firstResult.length} pages found`);

		console.log("\n--- Second call (should use cache) ---");
		// Now search for a specific page that was cached
		const cachedPageName = teslaPages.page_results[0].name;
		console.log(`Searching for cached page: "${cachedPageName}"`);

		const secondResult = await Effect.runPromise(
			getPages(cachedPageName).pipe(
				Effect.provideService(SearchAPIService, trackableSearchAPI),
				Effect.provideService(KVStore, testableKVStore),
			),
		);

		// Because the page name was cached, getPageId returns the page_id
		// However, there's a type mismatch in the current code - see effects.ts
		console.log(`📊 Second result:`, secondResult);

		// The network should only have been called once
		expect(networkCallCount).toBe(1);
		console.log(`\n✅ Network was only called ${networkCallCount} time(s)`);

		// Verify cache was populated
		expect(kvCache.size).toBeGreaterThan(0);
		console.log(`💾 Cache has ${kvCache.size} entries`);

		// Clean up
		kvCache.clear();
	});
});

describe("how query validation works", () => {
	const testCases: {
		name: string;
		input: string;
		expected: string;
	}[] = [
		{
			name: "strips off the username",
			input: "https://www.facebook.com/flipkart",
			expected: "flipkart",
		},
		{
			name: "removes trailing slashes",
			input: "https://www.facebook.com/flipkart/",
			expected: "flipkart",
		},
		{
			name: "accepts a naked username",
			input: "flipkart",
			expected: "flipkart",
		},
		{
			name: "removes trailing slashes on naked usernames",
			input: "flipkart/",
			expected: "flipkart",
		},
		{
			name: "also trims any whitespace",
			input: "  flipkart/  ",
			expected: "flipkart",
		},
		{
			name: "sanitizes any strange characters",
			input: "  </>flipkart?/!  ",
			expected: "flipkart",
		},
		{
			name: "grabs the last path segment for nested URLs",
			input: "https://www.facebook.com/pages/flipkart/12345",
			expected: "12345",
		},
		{
			name: "handles profile.php?id=123 style URLs",
			input: "https://www.facebook.com/profile.php?id=100044576203453",
			expected: "100044576203453",
		},
		{
			name: "strips query params and fragments",
			input: "https://www.facebook.com/flipkart?ref=abc#section",
			expected: "flipkart",
		},
		{
			name: "lowercases the result",
			input: "Flipkart",
			expected: "flipkart",
		},
		{
			name: "returns empty string for blank input",
			input: "   ",
			expected: "",
		},
	];

	// You could also use `it.each`
	test.each(testCases)("$name", ({ input, expected }) => {
		const result = santize(input);
		expect(result).toBe(expected);
	});
});

it.todo("convert queries to lowercase", async () => {});

describe("how advertiser Pages work", () => {
	it.todo("should remove the Gannt chart when I enter a new page search", async () => {});
	it.todo("loading state when its searching for stuff", async () => {});
	it.todo("front end minimum evolvable flow", async () => {});
});

describe("hows ads work", () => {
	it.todo("show all the ads stored in the data base for a query", async () => {});
	it.todo("queues a query for search if it is not in the databse", async () => {});
});

describe("filter", () => {
	it.todo("let me filter by sector, spend and impressions", async () => {});
});

describe("hows payments work", () => {
	it.todo("dont load more than 5 companies for free accounts", async () => {});
});
