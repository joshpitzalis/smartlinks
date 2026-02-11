import { HttpResponse, http } from "msw";
import { teslaPages, fakeAdData } from "./dummy-data";

/**
 * MSW handlers for mocking SearchAPI network requests
 */
export const handlers = [
	// Mock the searchPages API call
	http.get("https://www.searchapi.io/api/v1/search", ({ request }) => {
		const url = new URL(request.url);
		const query = url.searchParams.get("q");
		const engine = url.searchParams.get("engine");

		if (engine === "meta_ad_library_page_search") {
			// Return mock page results
			return HttpResponse.json(teslaPages);
		}

		return HttpResponse.json({ page_results: [] });
	}),

	// Mock the getAdvertisers API call (if needed)
	http.get("*/advertisers", () => {
		return HttpResponse.json(fakeAdData);
	}),
];
