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

		console.log({ cleanQuery });
		// if no cached pagename then search for pages
		const pageResults = yield* searchAPI.searchPages(cleanQuery.toLowerCase());

		console.log({ pageResults });
		if (pageResults.length === 0) {
			// todo - save null values but then attach a lastUpdated field so that you can recheck them every week = we dont want to miss any new pages created underpage names we have marked as null
			return yield* new NoResultsError();
		}

		// todo - save pageIds to KV Store, along with a lastupdated field

		yield* Effect.forEach(
			pageResults,
			(page) => {
				const pagename = page.page_alias || page.ig_username;
				// const pagename = page.page_name;
				const pageId = page.page_id;

				if (!pagename?.trim() || !pageId?.trim()) {
					return Effect.void;
				}
				return cache.savePagename(pagename.toLowerCase(), pageId);
			},
			{ concurrency: 20 },
		);

		return pageResults;
	});

// type = AdvertiserResultSchema
export const getAdvertiser = (pageId?: string) =>
	Effect.gen(function* () {
		console.log({ pageId, location: "getAdvertiser route" });
		const searchAPI = yield* SearchAPIService;
		const R2 = yield* R2Storage;
		const D1 = yield* D1Database;

		// if no pageId then return all advertisers to populate the dashboard
		if (!pageId?.trim()) {
			console.log("no page id");
			const allAdvertisers = yield* D1.getAdvertiserData();
			return {
				advertiserData: allAdvertisers,
				ads: [],
			};
		}

		console.log("there is a page id");
		// check DB first
		const adsLessThan30DaysOld = yield* R2.getAds(pageId);
		const advertiserData = yield* D1.getAdvertiserData(pageId);
		// at this point D1.getAdvertiserData(pageId) throws a NoResultsError. I don't want it to stop excecution. I
		console.log({ advertiserData });
		// if exists and is less than 30 days old then early return them
		if (adsLessThan30DaysOld.length > 0) {
			console.log("adsLessThan30DaysOld");
			return {
				advertiserData,
				ads: adsLessThan30DaysOld,
			};
		}
		console.log("fetching fresh data...");
		// if not fetch fresh data
		const freshAds = yield* searchAPI.getAds(pageId);

		// then save Data to DB

		// todo - these should happen at the same time.
		const freshAdvertiserData = extactAdvertiserData(freshAds);
		console.log({ freshAdvertiserData, freshAds });
		yield* D1.saveAdvertiserData(freshAdvertiserData);
		yield* R2.saveAds(freshAds);

		return {
			advertiserData,
			ads: freshAds,
		};
	});
