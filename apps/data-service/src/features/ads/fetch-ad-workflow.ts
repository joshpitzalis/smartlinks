import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { initDatabase } from "@repo/data-ops/database";
import {
	liveSearchAPI,
	SearchAPIService,
} from "@repo/data-ops/services/adsAPIService";
import { D1Database, stagingDBAPI } from "@repo/data-ops/services/D1DB";
import { Effect } from "effect";
import { extactAdvertiserData } from "./utils";

type InputEvent = {
	pageId: string;
};

export class AdDataFetcher extends WorkflowEntrypoint<Env, InputEvent> {
	async run(event: Readonly<WorkflowEvent<InputEvent>>, step: WorkflowStep) {
		const pageId = event.payload.pageId;
		if (!pageId) {
			throw new NonRetryableError("No pageId was provided — cannot proceed");
		}
		initDatabase(this.env.DB);

		// const needsFetching = await step.do(
		// 	"Check if the Page has been updated in the last 30 days",
		// 	async () => {
		// 		return true;
		// 	},
		// );

		// if (needsFetching === false) return;

		const freshAdData = await step.do("Fetch fresh ad data", async () => {
			const getLatestAds = Effect.gen(function* () {
				const searchAPI = yield* SearchAPIService;
				return yield* searchAPI.getAds(pageId);
			}).pipe(
				Effect.provideService(SearchAPIService, liveSearchAPI),
				Effect.catchTags({
					NoInputError: (error) =>
						Effect.die(new NonRetryableError(error.message, error._tag)),
					GetAdvertisersFetchError: (error) =>
						Effect.die(new NonRetryableError(error.message, error._tag)),
					ConfigError: (error) =>
						Effect.die(new NonRetryableError(error.message, error._tag)),
				}),
			);
			return runSafe(getLatestAds);
		});

		await step.do("Save to D1", async () => {
			// todo - why does this run when freshAdDatais []
			const freshAdvertiserData = extactAdvertiserData(freshAdData);
			if (!freshAdvertiserData) return;

			const SaveToDB = Effect.gen(function* () {
				const D1 = yield* D1Database;
				return yield* D1.saveAdvertiserData(freshAdvertiserData);
			}).pipe(
				Effect.provideService(D1Database, stagingDBAPI),
				Effect.catchTags({
					D1WriteError: (error) =>
						Effect.die(new NonRetryableError(error.message, error._tag)),
				}),
			);

			return runSafe(SaveToDB);
		});

		const pageName = freshAdData[0]?.page_name
		return pageName
	}
}

const runSafe = <A>(effect: Effect.Effect<A, never, never>) =>
	Effect.runPromise(effect);
