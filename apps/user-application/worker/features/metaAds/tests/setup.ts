import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw-server";

/**
 * Setup MSW server lifecycle for all tests
 */
beforeAll(() => {
	// Start MSW server before running tests
	server.listen({ onUnhandledRequest: "warn" });
});

afterEach(() => {
	// Reset handlers after each test to avoid state leakage
	server.resetHandlers();
});

afterAll(() => {
	// Clean up MSW server after all tests
	server.close();
});
