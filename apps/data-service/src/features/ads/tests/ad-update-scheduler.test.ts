import { env, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("Durable Object", () => {

  it("should show the status", async () => {
    const id = env.AD_UPDATE_SCHEDULER.idFromName("test-counter");
    const stub = env.AD_UPDATE_SCHEDULER.get(id);
    const status = await stub.showStatus();
    expect(status).toEqual(new Map());
	});

  it("should add pageIds via HTTP POST", async () => {
      await SELF.fetch("http://example.com/do/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageIds: ["153778988806898", "106209678561381", ] }),
      });

      const response = await SELF.fetch("http://example.com/do/status");
      const data = await response.json<{ pages: string[] }>();
		expect(data.pages).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ pageId: "106209678561381", processed: false }),
				expect.objectContaining({ pageId: "153778988806898", processed: false }),
			])
		);
		expect(data.pages).toHaveLength(2);
    });


});
