import { Effect } from "effect";
import { describe, expect, it, test } from "vitest";
import { getPages } from "@/worker/features/metaAds/effects";
import { NoResultsError } from "@/worker/features/metaAds/errors";
import {
	SearchAPIService,
	testSearchAPI,
} from "@/worker/services/SearchAPIService";
import { cleanQuery } from "../utils";
import { teslaPages } from "./dummy-data";

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

	it.todo("cache results to a database", async () => {});
	it.todo("search the database for a cache result before triggering the API", async () => {});
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
		const result = cleanQuery(input);
		expect(result).toBe(expected);
	});
});

describe("how advertiser Pages work", () => {
	it.todo("should remove the Gannt chart when I enter a new page search", async () => {});
});

describe("hows ads work", () => {
	it.todo("not sure yet...", async () => {});
});
