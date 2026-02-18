import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import { fetchAdData } from "@repo/data-ops/features/ads";
import { Effect } from "effect";

type inputEvent = {
	pageid: string;
};

export class AdDataFetcher extends WorkflowEntrypoint<Env, inputEvent> {
	async run(event: Readonly<WorkflowEvent<unknown>>, step: WorkflowStep) {
		const needsFetching = await step.do(
			"Check if the Page has been updated in the last 30 days",
			async () => {
				return true;
			},
		);

		if (needsFetching === false) return;

		const adData = await step.do("Fetch fresh ad data", async () => {
			const getLatestAds = fetchAdData(event.payload);
			return runSafe(getLatestAds);
		});

		await step.do("Save to D1", async () => {
			return {
				dummydata: "dummydata",
			};
		});
	}
}

const runSafe = <A>(effect: Effect.Effect<A, never, never>) =>
	Effect.runPromise(effect);

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
