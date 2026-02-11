# MSW + Effect Testing Setup

This document explains how MSW (Mock Service Worker) is configured for testing Effect-based services with caching behavior.

## Files Created

### 1. `vitest.config.ts` (root of user-application)
Configures Vitest with:
- Path aliases support via `vite-tsconfig-paths`
- Node environment for tests
- Automatic setup file loading

### 2. `tests/setup.ts`
MSW server lifecycle management:
- `beforeAll`: Starts MSW server
- `afterEach`: Resets handlers to prevent test pollution
- `afterAll`: Closes MSW server

### 3. `tests/msw-handlers.ts`
HTTP request interceptors that mock the SearchAPI:
- Intercepts `searchapi.io` API calls
- Returns mock data from `dummy-data.ts`
- Can be customized per-test using `server.use()`

### 4. `tests/msw-server.ts`
MSW server instance shared across all tests.

### 5. `tests/test-config.ts`
ConfigProvider for Effect services in tests:
- Provides mock `SEARCH_API_KEY`
- Add more config values as needed

## How It Works

### MSW Request Interception

```typescript
// When your code makes this fetch call:
fetch("https://www.searchapi.io/api/v1/search?...")

// MSW intercepts it and returns mock data instead:
http.get("https://www.searchapi.io/api/v1/search", () => {
  return HttpResponse.json(teslaPages);
});
```

### Effect Service Mocking

Instead of using live services, provide test implementations:

```typescript
const program = getPages("tesla").pipe(
  Effect.provideService(SearchAPIService, testSearchAPI),
  Effect.provideService(KVStore, testableKVStore),
);

await Effect.runPromise(program);
```

## Testing Cache Behavior

### Current Implementation Issue

The current `getPages` function has a type mismatch:

**Problem:**
- `KVStore.getPageId()` returns `string | null` (a page ID)
- `getPages()` should return `Array<PageResult>` (page objects)
- Lines 19-20 in `effects.ts` try to return a string as an array

**Two Solutions:**

### Option 1: Cache Individual Page Names (Current Approach)
Cache stores: `pageName -> pageId` mappings

```typescript
// Modify getPages to handle cached page IDs properly:
const existingPageId = yield* cache.getPageId(cleanQuery);
if (existingPageId) {
  // Need to fetch full page data using the cached ID
  // This still requires an API call, so cache savings are minimal
  return yield* searchAPI.getPageById(existingPageId);
}
```

**Pros:** Reuses page IDs across queries
**Cons:** Still needs API call for page data

### Option 2: Cache Full Query Results (Recommended)
Cache stores: `query -> Array<PageResult>`

```typescript
// Modify KVStore interface:
export class KVStore extends Context.Tag("KVStore")<
  KVStore,
  {
    readonly getQueryResults: (
      query: string,
    ) => Effect.Effect<Array<PageResult> | null, KVFetchError, never>;
    saveQueryResults: (
      query: string,
      results: Array<PageResult>,
    ) => Effect.Effect<void, KVSaveError, never>;
  }
>() {}

// Modify getPages:
const cachedResults = yield* cache.getQueryResults(cleanQuery);
if (cachedResults) return cachedResults;

const pageResults = yield* searchAPI.searchPages(cleanQuery);
yield* cache.saveQueryResults(cleanQuery, pageResults);
return pageResults;
```

**Pros:**
- Avoids network calls entirely on cache hit
- Simpler logic
- Better performance

**Cons:**
- Stores more data
- Need cache invalidation strategy (TTL)

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test worker/features/metaAds/tests/unit.test.ts

# Run in watch mode
pnpm test -- --watch

# Run with coverage
pnpm test -- --coverage
```

## Verifying Network Calls

The test includes counters and console logs:

```typescript
let networkCallCount = 0;

const trackableSearchAPI = {
  searchPages: (query) => {
    networkCallCount++;  // Track each call
    console.log(`🌐 Network call #${networkCallCount}`);
    return Effect.succeed(mockData);
  },
};

// After test:
expect(networkCallCount).toBe(1); // Verify only 1 network call
```

## Next Steps

1. **Decide on caching strategy**: Choose Option 1 or 2 above
2. **Update KVStore interface**: Modify types to match chosen strategy
3. **Update effects.ts**: Implement proper cache logic
4. **Add TTL**: Consider cache expiration (e.g., 30 days)
5. **Remove @ts-expect-error**: Once types are fixed

## MSW Advanced Usage

### Override handlers per-test

```typescript
it("handles API errors", async () => {
  // Override global handler for this test only
  server.use(
    http.get("https://www.searchapi.io/api/v1/search", () => {
      return HttpResponse.error();
    })
  );

  // Test error handling...
});
```

### Simulate network delays

```typescript
http.get("*/api/search", async () => {
  await delay(2000); // 2 second delay
  return HttpResponse.json(mockData);
});
```

### Verify request details

```typescript
let capturedRequest: Request | null = null;

server.use(
  http.get("*/api/search", ({ request }) => {
    capturedRequest = request;
    return HttpResponse.json(mockData);
  })
);

// Later in test:
expect(capturedRequest?.url).toContain("q=tesla");
```

## Troubleshooting

### Tests fail with "fetch is not defined"
- Check `vitest.config.ts` has `environment: "node"`
- Install `node-fetch` polyfill if needed

### MSW handlers not intercepting
- Verify server.listen() is called in beforeAll
- Check handler URL patterns match actual requests
- Use `onUnhandledRequest: "error"` to catch missed requests

### Type errors in tests
- Ensure all services implement the correct interface
- Use type assertions sparingly: `as unknown as ServiceType`
- Check Effect.gen return types match service contracts
