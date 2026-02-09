import { Effect } from "effect";
import { SearchAPIService } from "../../services/getPages";

export const getPages = (query: string) =>
	Effect.gen(function* () {
		const searchAPI = yield* SearchAPIService;
		return yield* searchAPI.searchPages(query);
	});
