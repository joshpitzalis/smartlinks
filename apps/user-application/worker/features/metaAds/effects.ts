import { Effect } from "effect";
import { SearchAPIService } from "../../services/SearchAPIService";
import { NoResultsError } from "./errors";

export const getPages = (query: string) =>
	Effect.gen(function* () {
		const searchAPI = yield* SearchAPIService;
		const result = yield* searchAPI.searchPages(query);
		if (result.length === 0) {
			return yield* new NoResultsError();
		}
		return result;
	});
