import { advertiserTrpcRoutes } from "@/worker/trpc/routers/advertisers";
import { evaluationsTrpcRoutes } from "@/worker/trpc/routers/evaluations";
import { linksTrpcRoutes } from "@/worker/trpc/routers/links";
import { t } from "@/worker/trpc/trpc-instance";

export const appRouter = t.router({
	links: linksTrpcRoutes,
	evaluations: evaluationsTrpcRoutes,
	advertisers: advertiserTrpcRoutes,
});

export type AppRouter = typeof appRouter;
