import { Effect } from "effect";
import { extactAdvertiserData } from "@/features/ads/utils";
import { SearchAPIService } from "@/services/adsAPIService";
import { D1Database } from "@/services/D1DB";

export const fetchAdData = (pageId: string) =>
	Effect.gen(function* () {
		const searchAPI = yield* SearchAPIService;
		const D1 = yield* D1Database;
		const freshAds = yield* searchAPI.getAds(pageId);
		const freshAdvertiserData = extactAdvertiserData(freshAds);
		return yield* D1.saveAdvertiserData(freshAdvertiserData);
	});
