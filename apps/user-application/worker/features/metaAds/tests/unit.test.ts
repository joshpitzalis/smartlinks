// import {
// 	QueryClient,
// 	// QueryClientProvider
// } from "@tanstack/react-query";
// import { render, screen, waitFor } from "@testing-library/react";
import { Effect } from "effect";
import {
	// beforeEach,
	describe,
	expect,
	it,
	test,
	// vi
} from "vitest";
import { getAdvertiser, getPages } from "@/worker/features/metaAds/effects";
import { NoResultsError } from "@/worker/features/metaAds/errors";

import { KVStore, testKVAPI } from "@/worker/services/KVStore";
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
				Effect.provideService(KVStore, testKVAPI),
			),
		);

		expect(result).toEqual(teslaPages.page_results);
	});
	it("should tell you if no page Ids are available", async () => {
		const URLtoPageIDHandler = getPages("test query").pipe(
			Effect.provideService(SearchAPIService, {
				...testSearchAPI,
				searchPages: (_query: string) => Effect.succeed([]),
			}),
			Effect.provideService(KVStore, testKVAPI),
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
});

describe("how query validation works", () => {
	// todo- confirm it writes and reads in lowercase
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

describe("Advertiser Page frontend", () => {
	// let queryClient: QueryClient;

	// beforeEach(() => {
	// 	// Create a fresh QueryClient for each test
	// 	queryClient = new QueryClient({
	// 		defaultOptions: {
	// 			queries: {
	// 				retry: false,
	// 			},
	// 		},
	// 	});
	// });

	// it("show ads on homepage by default", async () => {
	// 	// Import the RouteComponent
	// 	const { Route } = await import("@/routes/app/_authed/advertisers");
	// 	const RouteComponent = Route.options.component as React.ComponentType;

	// 	// Mock the trpc getAllAdvertisers query to return ads
	// 	const mockAds = fakeAdData.ads;

	// 	// Mock queryClient.fetchQuery to return featured page data
	// 	vi.spyOn(queryClient, 'fetchQuery').mockResolvedValue(mockAds);

	// 	// Render the component with QueryClientProvider
	// 	const { container } = render(
	// 		<QueryClientProvider client={queryClient}>
	// 			<RouteComponent />
	// 		</QueryClientProvider>
	// 	);

	// 	// Wait for the component to load and show ads
	// 	// The component should automatically load ads for a featured/default page
	// 	await waitFor(() => {
	// 		// Check if the Gantt chart or ad content is rendered
	// 		// We're looking for either "Loading..." or actual ad content
	// 		const hasContent = container.textContent;
	// 		expect(hasContent).toBeTruthy();
	// 	});

	// 	// Verify that ads are displayed (the Gantt component should be rendered)
	// 	// This will fail initially because the component doesn't load ads by default
	// 	const ganttChart = await waitFor(() => {
	// 		// Look for elements that indicate ads are showing
	// 		return screen.queryByText(/Loading.../) || container.querySelector('[data-testid="gantt"]');
	// 	});

	// 	expect(ganttChart).toBeTruthy();
	// });
	// minimum acceptable UI
	it.todo("show no results if no results", async () => {});
	it.todo("loading spinner", async () => {});
	it.todo("best performing ad in homepage results ", async () => {});
	it.todo("should remove the Gannt chart when I enter a new page search", async () => {});
	it.todo("let me filter by sector, spend and impressions", async () => {});
});

describe("Payments", () => {
	it.todo("dont load more than 5 companies for free accounts", async () => {});
});

describe("How ads work under the hood", () => {
	// todo - test the caching and call mechanism works as expected
	it.todo("show all the ads stored in the data base for a query", () => {});
	it.todo("queues a query for search if it is not in the database", () => {});
});
