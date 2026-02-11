describe("template spec", () => {
	beforeEach(() => {
		cy.loginByGoogleApi();
	});
	it("passes", () => {
		cy.visit("http://localhost:3000/app");
	});
});
