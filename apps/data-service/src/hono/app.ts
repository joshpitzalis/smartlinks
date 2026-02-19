import { cloudflareInfoSchema } from "@repo/data-ops/zod-schema/links";
import type { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";
import { Data, Effect } from "effect";
import { type Context, Hono } from "hono";
import {
	captureLinkClickInBackground,
	getDestinationForCountry,
	getRoutingDestinations,
} from "@/helpers/route-ops";
import { CloudFlareContext } from "@/services";
import type {FacebookAdvertiserPages} from '../features/ads/ad-update-scheduler'

class InvalidCloudflareHeaders extends Data.TaggedError(
	"InvalidCloudflareHeaders",
) {}

export const App = new Hono<{ Bindings: Env }>();

App.get("/do/status", async (c) => {
	const doId = c.env.AD_UPDATE_SCHEDULER.idFromName("ad_update_scheduler");
  const stub = c.env.AD_UPDATE_SCHEDULER.get(doId);
	const pageIds = await stub.showStatus()
  const  pages = [...pageIds.values()]
  return c.json({pages})
});

App.post("/do/add", async (c ) => {

	const { pageIds } = await c.req.json<{ pageIds: string[] }>();


	const doId = c.env.AD_UPDATE_SCHEDULER.idFromName("ad_update_scheduler");
	console.log({doId})
  const stub = c.env.AD_UPDATE_SCHEDULER.get(doId);
await stub.addPageIds(pageIds);

return c.json({ success: true });
});

App.get("/click-socket", async (c) => {
	const upgradeHeader = c.req.header("Upgrade");
	if (!upgradeHeader || upgradeHeader !== "websocket") {
		return c.text("Expected Upgrade: websocket", 426);
	}

	const accountId = c.req.header("account-id");
	// const accountId = "1234567890";
	if (!accountId) return c.text("No Headers", 404);
	const doId = c.env.LINK_CLICK_TRACKER_OBJECT.idFromName(accountId);
	const stub = c.env.LINK_CLICK_TRACKER_OBJECT.get(doId);
	return await stub.fetch(c.req.raw);
});
App.get("/:id", async (c: Context<{ Bindings: Env }>) => {
	return Effect.runPromise(
		program.pipe(
			Effect.provideService(CloudFlareContext, c),
			Effect.match({
				onFailure: (error) => {
					switch (error._tag) {
						case "KvFetchError":
						case "JsonParseError":
						case "ZodParseError":
						case "NoLinkFoundError":
						case "FetchLinkFromDBError":
						case "SaveLinktoKVError":
							return c.text(`Routing destination error: ${error._tag}`, 500);
						// case "NoLinkInfo":
						// 	return c.text("Destination not found", 404);
						case "InvalidCloudflareHeaders":
							return c.text("Invalid Cloudflare headers", 400);

						default: {
							// This will error if you don't handle all cases
							const _exhaustive: never = error;
							return _exhaustive;
						}
					}
				},
				onSuccess: (destination) => c.redirect(destination),
			}),
		),
	);
});

const program = Effect.gen(function* () {
	const c = yield* CloudFlareContext;
	const id = c.req.param("id");

	const linkInfo = yield* getRoutingDestinations(id);

	// if (!linkInfo) {
	// 	return yield* new NoLinkInfo();
	// }

	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if (!cfHeader.success) {
		return yield* new InvalidCloudflareHeaders();
	}

	const headers = cfHeader.data;
	const destination = getDestinationForCountry(linkInfo, headers.country);

	if (destination) {
		const queueMessage: LinkClickMessageType = {
			type: "LINK_CLICK",
			data: {
				id: id,
				country: headers.country,
				destination: destination,
				accountId: linkInfo.accountId,
				latitude: headers.latitude,
				longitude: headers.longitude,
				timestamp: new Date().toISOString(),
			},
		};

		yield* sendMessageToQueue(c, queueMessage).pipe(
			Effect.catchTag("QueueError", () => Effect.succeed(null)),
		);
	}

	return destination;
});

class QueueError extends Data.TaggedError("QueueError")<{
	cause: unknown;
}> {}

const sendMessageToQueue = (
	c: Context<{ Bindings: Env }>,
	queueMessage: LinkClickMessageType,
) => {
	// const sendPromise = c.env.QUEUE.send(queueMessage);
	const sendPromise = captureLinkClickInBackground(c.env, queueMessage);
	c.executionCtx.waitUntil(sendPromise);
	return Effect.tryPromise({
		try: () => sendPromise,
		catch: (cause) => new QueueError({ cause }),
	});
};
