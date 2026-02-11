import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.staging") });

export default defineConfig({
	projectId: "o4pnqt",
	allowCypressEnv: true,
	chromeWebSecurity: false,
	env: {
		googleClientId: process.env.GOOGLE_CLIENT_ID,
		googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
		googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
	},
	e2e: {
		experimentalPromptCommand: true,
		setupNodeEvents(on, config) {},
	},
});
