describe("template spec", () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
	});

	afterEach(() => {
		// Clean up KV cache after each test
	});

	it("runs a query > caches the results > show ads stored in the R2 the next time the same query is run", () => {
		const testKey = "tesla";
		// clear cache for idempotency
		cy.clearKVCache(testKey);
		cy.visit("http://localhost:3000/app/advertisers");
		cy.findByRole("searchbox").click().type(`${testKey}{enter}`);
		// assert the query results shows up form the API
		cy.findAllByTestId("advertiser-card").should("exist");
		cy.visit("http://localhost:3000/app/advertisers");
		cy.findByRole("searchbox").click().type(`${testKey}{enter}`);
		// assert the API call is skipped and the cache result lets you jump straught to the ads
		cy.findAllByText(/active-carousel/i);
	});
});
