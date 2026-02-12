describe("template spec", () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
	});

	afterEach(() => {
		// Clean up KV cache after each test
	});

	it("caches a query", () => {
		const testKey = "tesla";
		cy.clearKVCache(testKey);
		cy.visit("http://localhost:3000/app/advertisers");
		cy.findByRole("searchbox").click().type(`${testKey}{enter}`);
		// assert the user shows up
		cy.findAllByTestId("advertiser-card").should("exist");

		cy.visit("http://localhost:3000/app/advertisers");

		cy.findByRole("searchbox").click().type(`${testKey}{enter}`);

		cy.findAllByText(/active-carousel/i);
	});
});
