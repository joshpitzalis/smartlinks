/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add("loginByGoogleApi", () => {
	cy.log("Logging in to Google");
	cy.env(["googleClientId", "googleClientSecret", "googleRefreshToken"]).then(
		({ googleClientId, googleClientSecret, googleRefreshToken }) => {
			cy.request({
				method: "POST",
				url: "https://www.googleapis.com/oauth2/v4/token",
				body: {
					grant_type: "refresh_token",
					client_id: googleClientId,
					client_secret: googleClientSecret,
					refresh_token: googleRefreshToken,
				},
			}).then(({ body }) => {
				const { access_token, id_token } = body;

				cy.request({
					method: "GET",
					url: "https://www.googleapis.com/oauth2/v3/userinfo",
					headers: { Authorization: `Bearer ${access_token}` },
				}).then(({ body: userInfo }) => {
					cy.log(userInfo);

					// Call Better Auth's social sign-in endpoint with the Google id_token.
					// This creates a server-side session and sets the session cookie.
					cy.request({
						method: "POST",
						url: "http://localhost:3000/api/auth/sign-in/social",
						body: {
							provider: "google",
							idToken: {
								token: id_token,
								accessToken: access_token,
							},
							callbackURL: "/app",
						},
					}).then((resp) => {
						cy.log("Better Auth session created", resp.body);
						cy.visit("http://localhost:3000/app");
					});
				});
			});
		},
	);
});

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("clearKVCache", (key: string) => {
	cy.request({
		method: "DELETE",
		url: `http://localhost:3000/api/test/cache/${encodeURIComponent(key)}`,
		failOnStatusCode: false,
	}).then((response) => {
		cy.log(`Cleared cache for key: ${key} (status: ${response.status})`);
	});
});

declare global {
	namespace Cypress {
		interface Chainable {
			loginByGoogleApi(): Chainable<void>;
			clearKVCache(key: string): Chainable<void>;
		}
	}
}
