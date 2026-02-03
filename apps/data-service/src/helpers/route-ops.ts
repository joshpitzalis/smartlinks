import { getLink } from "@repo/data-ops/queries/links";
import {
	type LinkSchemaType,
	linkSchema,
} from "@repo/data-ops/zod-schema/links";
import { Effect } from "effect";
import { CloudFlareContext } from "@/services";
import {
	FetchLinkFromDBError,
	JsonParseError,
	KvFetchError,
	KvNotFoundError,
	NoLinkFoundError,
	SaveLinktoKVError,
	ZodParseError,
} from "./errors";

const getLinkInfoFromKv = (id: string) =>
	Effect.gen(function* () {
		const c = yield* CloudFlareContext;
		const linkInfo = yield* Effect.tryPromise({
			try: () => c.env.CACHE.get(id),
			catch: (error) => new KvFetchError({ cause: error }),
		});

		if (!linkInfo) {
			return yield* new KvNotFoundError({ id });
		}

		const parsedLinkInfo = yield* Effect.try({
			try: () => JSON.parse(linkInfo),
			catch: (error) => new JsonParseError({ cause: error }),
		});

		const LinkInfoFromKv = yield* Effect.try({
			try: () => linkSchema.parse(parsedLinkInfo),
			catch: (error) => new ZodParseError({ cause: error }),
		});

		return LinkInfoFromKv;
	});

const TTL_TIME = 60 * 60 * 24; // 1 day

const saveLinkInfoToKv = (env: Env, id: string, linkInfo: LinkSchemaType) =>
	Effect.tryPromise({
		try: () =>
			env.CACHE.put(id, JSON.stringify(linkInfo), {
				expirationTtl: TTL_TIME,
			}),
		catch: (error) => new SaveLinktoKVError({ cause: error }),
	});

export const getRoutingDestinations = (id: string) =>
	Effect.gen(function* () {
		const c = yield* CloudFlareContext;
		const linkInfo = yield* getLinkInfoFromKv(id).pipe(
			Effect.catchTag("KvNotFoundError", () => Effect.succeed(null)),
		);

		if (linkInfo) return linkInfo;

		const linkInfoFromDb = yield* Effect.tryPromise({
			try: () => getLink(id),
			catch: (error) => new FetchLinkFromDBError({ cause: error }),
		});

		if (!linkInfoFromDb) {
			return yield* new NoLinkFoundError();
		}

		yield* saveLinkInfoToKv(c.env, id, linkInfoFromDb);

		return linkInfoFromDb;
	});

export function getDestinationForCountry(
	linkInfo: LinkSchemaType,
	countryCode?: string,
) {
	if (!countryCode) {
		return linkInfo.destinations.default;
	}

	// Check if the country code exists in destinations
	if (linkInfo.destinations[countryCode]) {
		return linkInfo.destinations[countryCode];
	}

	// Fallback to default
	return linkInfo.destinations.default;
}
