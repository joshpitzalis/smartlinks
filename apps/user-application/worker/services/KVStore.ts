// import { getDb } from "@repo/data-ops/database";
import { Context, type Effect } from "effect";

export class KVStore extends Context.Tag("KVStore")<
	KVStore,
	{
		readonly getPageId: (
			query: string,
		) => Effect.Effect<[string, string], never, never>;
		savePagename: (
			pagename: string,
			page_id: string,
		) => Effect.Effect<[string, string], never, never>;
	}
>() {}
