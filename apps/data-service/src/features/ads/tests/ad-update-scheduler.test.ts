/// <reference types="@cloudflare/vitest-pool-workers" />
import { env, SELF, runDurableObjectAlarm, runInDurableObject } from "cloudflare:test";
import { describe, it, expect, vi } from "vitest";
import { AdDataUpdateScheduler } from "../ad-update-scheduler";

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

	it.skip("should not add duplicate pageIds", async () => {
		const id = env.AD_UPDATE_SCHEDULER.idFromName("dedup-test");
		const stub = env.AD_UPDATE_SCHEDULER.get(id);

		await stub.addPageIds(["page1", "page2"]);
		await stub.addPageIds(["page1", "page3"]); // page1 already exists

		const status = await stub.showStatus();
		// page1, page2, page3 — page1 was not duplicated
		expect(status.size).toBe(3);
		expect(status.get("page1")).toEqual(
			expect.objectContaining({ pageId: "page1", processed: false })
		);
	});

	it.skip("should set an alarm after adding pageIds", async () => {
		const id = env.AD_UPDATE_SCHEDULER.idFromName("alarm-test");
		const stub = env.AD_UPDATE_SCHEDULER.get(id);

		// No alarm should be set initially
		const noAlarm = await runDurableObjectAlarm(stub);
		expect(noAlarm).toBe(false);

		await stub.addPageIds(["page1"]);

		// addPageIds should have scheduled an alarm
		const alarmRan = await runDurableObjectAlarm(stub);
		expect(alarmRan).toBe(true);

		// Alarm consumed — running again returns false
		const alarmRanAgain = await runDurableObjectAlarm(stub);
		expect(alarmRanAgain).toBe(false);
	});

	it.skip("alarm processes up to 2 unprocessed pages", async () => {
		const id = env.AD_UPDATE_SCHEDULER.idFromName("alarm-process-test");
		const stub = env.AD_UPDATE_SCHEDULER.get(id);

		await stub.addPageIds(["page1", "page2", "page3"]);

		// Mock the workflow binding before triggering the alarm
		await runInDurableObject(stub, async (instance: AdDataUpdateScheduler) => {
			(instance.env as any).FETCH_AD_WORKFLOW = {
				create: vi.fn().mockResolvedValue("Mock Page Name"),
			};
		});

		// All 3 should be unprocessed
		let status = await stub.showStatus();
		const pages = [...status.values()] as { pageId: string; processed: boolean }[];
		const unprocessedBefore = pages.filter(p => p.processed === false);
		expect(unprocessedBefore).toHaveLength(3);

		// Trigger the alarm immediately without waiting for the timer
		const alarmRan = await runDurableObjectAlarm(stub);
		expect(alarmRan).toBe(true);

		// After alarm, only 2 should be processed (LIMIT = 2)
		status = await stub.showStatus();
		const pagesAfter = [...status.values()] as { pageId: string; processed: boolean }[];
		const processedAfter = pagesAfter.filter(p => p.processed === true);
		const unprocessedAfter = pagesAfter.filter(p => p.processed === false);
		expect(processedAfter).toHaveLength(2);
		expect(unprocessedAfter).toHaveLength(1);
	});

	it.skip("what happens if there are no more ids left to process", async () => { })
});
