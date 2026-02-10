import { getDb} from "@repo/data-ops/database"
import { and, count, desc, eq, gt, max, sql } from "drizzle-orm";
import { Context, Effect } from "effect";
import type { AdSchemaType } from "../features/metaAds/schemas";
import { fakeAdData } from "../features/metaAds/tests/dummy-data";

export class D1Database extends Context.Tag("D1Database")<
	D1Database,
	{
		readonly getAds: (
			pageId: string,
		) => Effect.Effect<AdSchemaType[], never, never>;
		saveAds: (ads: AdSchemaType) => Effect.Effect<void, never, never>;
	}
>() {}

export const testDBAPI = {
	getAds: (_pageId: string) => Effect.succeed(fakeAdData.ads),
	saveAds: (ads: AdSchemaType) =>
		Effect.succeed(console.log("saving ads to DB...")),
};

export const stagingDBAPI = {
	getAds: (_pageId: string) => Effect.succeed(fakeAdData.ads),
	saveAds: (ads: AdSchemaType) => {

      getDb()


	const result = await db
		.select({
			linkId: links.linkId,
			destinations: links.destinations,
			created: links.created,
			name: links.name,
		})
		.from(links)
		// .where(and(...conditions))
		// .orderBy(desc(links.created))
		.limit(25);

	return result.map((link) => ({
		...link,
		lastSixHours: Array.from({ length: 6 }, () =>
			Math.floor(Math.random() * 100),
		),
		linkClicks: 6,
		destinations: Object.keys(JSON.parse(link.destinations as string)).length,
  }));

	Effect.succeed(console.log("saving ads to DB...")),
  }
};
