declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}

import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";

describe("Counter Durable Object", () => {
  // Each test gets isolated storage automatically
  it("should increment the counter", async () => {
    const id = env.COUNTER.idFromName("test-counter");
    const stub = env.COUNTER.get(id);

    // Call RPC methods directly on the stub
    const count1 = await stub.increment();
    expect(count1).toBe(1);

    const count2 = await stub.increment();
    expect(count2).toBe(2);

    const count3 = await stub.increment();
    expect(count3).toBe(3);
  });

  it("should track separate counters independently", async () => {
    const id = env.COUNTER.idFromName("test-counter");
    const stub = env.COUNTER.get(id);

    await stub.increment("counter-a");
    await stub.increment("counter-a");
    await stub.increment("counter-b");

    expect(await stub.getCount("counter-a")).toBe(2);
    expect(await stub.getCount("counter-b")).toBe(1);
    expect(await stub.getCount("counter-c")).toBe(0);
  });

  it("should reset a counter", async () => {
    const id = env.COUNTER.idFromName("test-counter");
    const stub = env.COUNTER.get(id);

    await stub.increment("my-counter");
    await stub.increment("my-counter");
    expect(await stub.getCount("my-counter")).toBe(2);

    await stub.reset("my-counter");
    expect(await stub.getCount("my-counter")).toBe(0);
  });

  it("should isolate different Durable Object instances", async () => {
    const id1 = env.COUNTER.idFromName("counter-1");
    const id2 = env.COUNTER.idFromName("counter-2");

    const stub1 = env.COUNTER.get(id1);
    const stub2 = env.COUNTER.get(id2);

    await stub1.increment();
    await stub1.increment();
    await stub2.increment();

    // Each Durable Object instance has its own storage
    expect(await stub1.getCount()).toBe(2);
    expect(await stub2.getCount()).toBe(1);
  });
});
