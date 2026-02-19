import { resolve } from "node:path";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	test: {
		poolOptions: {
			workers: {
				wrangler: {
					configPath: "./wrangler.jsonc",
					environment: "staging"
				},
				singleWorker: true,
				isolatedStorage: false,
			},
		},
	},
});
