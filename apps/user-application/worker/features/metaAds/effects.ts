import { Effect } from "effect";
import { R2Storage } from "@/worker/services/R2Storage";
import { D1Database } from "../../services/D1Database";
import { KVStore } from "../../services/KVStore";
import { SearchAPIService } from "../../services/SearchAPIService";
import { NoResultsError } from "./errors";
import { extactAdvertiserData, santize } from "./utils";

export const getPages = (query: string) =>
	Effect.gen(function* () {
		const cache = yield* KVStore;
		const searchAPI = yield* SearchAPIService;

		// santize the query
		const cleanQuery = santize(query);

		const existingPageId = yield* cache.getPageId(cleanQuery);

		if (existingPageId) {
			return existingPageId;
		}

		console.log("no pageid stored in cache");
		// if no cached pagename then search for pages
		const pageResults = yield* searchAPI.searchPages(cleanQuery.toLowerCase());
		if (pageResults.length === 0) {
			// todo - save null values but then attach a lastUpdated field so that you can recheck them every week = we dont want to miss any new pages created underpage names we have marked as null
			return yield* new NoResultsError();
		}

		// todo - save pageIds to KV Store, along with a lastupdated field

		yield* Effect.forEach(
			pageResults,
			(page) => {
				const pagename = page.page_alias || page.ig_username;

				if (!pagename?.trim()) {
					return Effect.void;
				}
				return cache.savePagename(pagename.toLowerCase(), page.page_id);
			},
			{ concurrency: 20 },
		);

		return pageResults;
	});

// type = AdvertiserResultSchema
export const getAdvertiser = (pageId?: string) =>
	Effect.gen(function* () {
		const searchAPI = yield* SearchAPIService;
		const R2 = yield* R2Storage;
		const D1 = yield* D1Database;

		if (!pageId?.trim()) {
			const allAdvertisers = yield* D1.getAdvertiserData();
			return allAdvertisers;
		}

		// check DB first
		const adsLessThan30DaysOld = yield* R2.getAds(pageId);
		const advertiserData = yield* D1.getAdvertiserData(pageId);

		// if exists and is less than 30 days old then early return them
		if (adsLessThan30DaysOld.length > 0)
			return {
				advertiserData,
				ads: adsLessThan30DaysOld,
			};

		// if not fetch fresh data
		const freshAds = yield* searchAPI.getAds(pageId);

		// then save Data to DB
		// todo - these should happen at the same time.
		const freshAdvertiserData = extactAdvertiserData(freshAds);
		yield* D1.saveAdvertiserData(freshAdvertiserData);
		yield* R2.saveAds(freshAds);

		return {
			advertiserData,
			ads: freshAds,
		};
	});
