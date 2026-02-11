import { ConfigProvider, Layer } from "effect";

/**
 * Test configuration provider
 * Provides mock values for Config.string() calls in tests
 */
export const TestConfigProvider = ConfigProvider.fromMap(
	new Map([
		["SEARCH_API_KEY", "test-api-key"],
		// Add other config values as needed
	]),
);

export const TestConfigLayer = Layer.setConfigProvider(TestConfigProvider);
