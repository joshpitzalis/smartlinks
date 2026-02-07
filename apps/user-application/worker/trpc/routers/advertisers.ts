import { getAdvertisers } from "@repo/data-ops/queries/advertisers";
import { t } from "@/worker/trpc/trpc-instance";

export const advertiserTrpcRoutes = t.router({
	getAllAdvertisers: t.procedure.query(async () => {
		return getAdvertisers();
	}),
});
