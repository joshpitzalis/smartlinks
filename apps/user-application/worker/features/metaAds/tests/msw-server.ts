import { setupServer } from "msw/node";
import { handlers } from "./msw-handlers";

/**
 * MSW server instance for intercepting network requests in tests
 */
export const server = setupServer(...handlers);
