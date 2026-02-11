import { Context, Effect } from "effect";
import {
	KVFetchError,
	KVSaveError,
	NoResultsError,
} from "../features/metaAds/errors";

export class KVStore extends Context.Tag("KVStore")<
	KVStore,
	{
		readonly getPageId: (
			query: string,
		) => Effect.Effect<string | null, KVFetchError, never>;
		savePagename: (
			pagename: string,
			page_id: string,
		) => Effect.Effect<void, KVSaveError, never>;
	}
>() {}

export const testKVAPI = {
	getPageId: (_query: string) =>
		Effect.succeed(null as string | null) as Effect.Effect<
			string | null,
			KVFetchError,
			never
		>,
	savePagename: (_pagename: string, _page_id: string) =>
		Effect.void as Effect.Effect<void, KVSaveError, never>,
};

export const stagingKVAPI = (env: Env) => ({
	getPageId: (query: string) =>
		Effect.gen(function* () {
			const pageId = yield* Effect.tryPromise({
				try: () => env.CACHE.get(query),
				catch: (error) => new KVFetchError({ cause: error, id: "QUERY-CACHE" }),
			});
			return pageId;
		}),
	savePagename: (pagename: string, page_id: string) =>
		Effect.tryPromise({
			try: () => env.CACHE.put(pagename, page_id),
			catch: (error) => new KVSaveError({ cause: error, id: "QUERY-CACHE" }),
		}),
});
