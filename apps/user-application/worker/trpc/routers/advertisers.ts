import { getAdvertisers } from "@repo/data-ops/queries/advertisers";
import { z } from "zod";
import { fakeAdData } from "@/worker/trpc/routers/dummy-data";
import { t } from "@/worker/trpc/trpc-instance";

export const advertiserTrpcRoutes = t.router({
	getAllAdvertisers: t.procedure
		.input(
			z.object({
				page_id: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const { page_id } = input;
			console.log("Fetching advertisers for page_id:", page_id);

			// return getAdvertisers({
			// 	page_id: page_id,
			// 	api_key: process.env.SEARCH_API_KEY,
			// });
			return fakeAdData;
		}),
});
