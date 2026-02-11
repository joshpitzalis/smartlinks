// import { getDb} from "@repo/data-ops/database"
// import { and, count, desc, eq, gt, max, sql } from "drizzle-orm";
// import { Context, Effect } from "effect";
// import type { AdSchemaType } from "../features/metaAds/schemas";
// import { fakeAdData } from "../features/metaAds/tests/dummy-data";

// export class D1Database extends Context.Tag("D1Database")<
// 	D1Database,
// 	{
// 		readonly getAds: (
// 			pageId: string,
// 		) => Effect.Effect<AdSchemaType[], never, never>;
// 		saveAds: (ads: AdSchemaType) => Effect.Effect<void, never, never>;
// 	}
// >() {}

// export const testDBAPI = {
// 	getAds: (_pageId: string) => Effect.succeed(fakeAdData.ads),
// 	saveAds: (ads: AdSchemaType) =>
// 		Effect.succeed(console.log("saving ads to DB...")),
// };

// export const stagingDBAPI = {
// 	getAds: (_pageId: string) => Effect.succeed(fakeAdData.ads),
// 	saveAds: (ads: AdSchemaType) => {

//       getDb()


// 	const result = await db
// 		.select({
// 			linkId: links.linkId,
// 			destinations: links.destinations,
// 			created: links.created,
// 			name: links.name,
// 		})
// 		.from(links)
// 		// .where(and(...conditions))
// 		// .orderBy(desc(links.created))
// 		.limit(25);

// 	return result.map((link) => ({
// 		...link,
// 		lastSixHours: Array.from({ length: 6 }, () =>
// 			Math.floor(Math.random() * 100),
// 		),
// 		linkClicks: 6,
// 		destinations: Object.keys(JSON.parse(link.destinations as string)).length,
//   }));

// 	Effect.succeed(console.log("saving ads to DB...")),
//   }
// };

import { SqlClient } from "@effect/sql";
import { D1Client } from "@effect/sql-d1";
import * as SqliteDrizzle from "@effect/sql-drizzle/Sqlite";
import { eq } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// src/services/database.ts
import { Context, Effect } from "effect";

// ── Schema ──
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: text("created_at").default("(datetime('now'))"),
});

// ── Types ──
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ── Errors ──
export class DbFetchError extends Data.TaggedError("DbFetchError")<{
  readonly cause: unknown;
}> {}

export class DbWriteError extends Data.TaggedError("DbWriteError")<{
  readonly cause: unknown;
}> {}

// ── Service definition ──
// Same pattern as your R2Storage: define the interface, swap implementations.
export class Database extends Context.Tag("Database")
  Database,
  {
    readonly getUsers: () => Effect.Effect<User[], DbFetchError, never>;
    readonly getUserByEmail: (email: string) => Effect.Effect<User | undefined, DbFetchError, never>;
    readonly createUser: (user: NewUser) => Effect.Effect<void, DbWriteError, never>;
    readonly createUserWithAudit: (user: NewUser) => Effect.Effect<void, DbWriteError, never>;
  }
>() {}

// ── Test implementation (no DB needed) ──
export const testDbAPI = () => ({
  getUsers: () => Effect.succeed([
    { id: 1, name: "Test User", email: "test@example.com", createdAt: "2026-01-01" }
  ]),
  getUserByEmail: (_email: string) => Effect.succeed(
    { id: 1, name: "Test User", email: "test@example.com", createdAt: "2026-01-01" }
  ),
  createUser: (_user: NewUser) => Effect.void,
  createUserWithAudit: (_user: NewUser) => Effect.void,
});

// ── Real implementation (uses D1 + Drizzle) ──
export const d1DbAPI = (env: { DB: D1Database }) => {
  // Build the Layer stack once — this is the "wiring" for D1 + Drizzle.
  const D1Live = D1Client.layer({ db: env.DB });

  // Helper: run a Drizzle program against D1 and return the result.
  // This is the bridge between your Context.Tag pattern and Effect's Layer system.
  // It creates a Drizzle instance, runs your function, and provides D1 underneath.
  const runDb = <A, E>(
    fn: (db: SqliteDrizzle.SqliteRemoteDatabase) => Effect.Effect<A, E, SqlClient.SqlClient>
  ): Effect.Effect<A, E, never> =>
    Effect.gen(function* () {
      const db = yield* SqliteDrizzle.make();
      return yield* fn(db);
    }).pipe(Effect.provide(D1Live));

  // Helper for operations that need both Drizzle and raw SqlClient (for transactions)
  const runDbWithSql = <A, E>(
    fn: (
      db: SqliteDrizzle.SqliteRemoteDatabase,
      sql: SqlClient.SqlClient
    ) => Effect.Effect<A, E, SqlClient.SqlClient>
  ): Effect.Effect<A, E, never> =>
    Effect.gen(function* () {
      const db = yield* SqliteDrizzle.make();
      const sql = yield* SqlClient.SqlClient;
      return yield* fn(db, sql);
    }).pipe(Effect.provide(D1Live));

  return {
    getUsers: () =>
      runDb((db) =>
        db.select().from(users).pipe(
          Effect.mapError((e) => new DbFetchError({ cause: e }))
        )
      ),

    getUserByEmail: (email: string) =>
      runDb((db) =>
        db.select().from(users).where(eq(users.email, email)).pipe(
          Effect.map((rows) => rows[0]),
          Effect.mapError((e) => new DbFetchError({ cause: e }))
        )
      ),

    createUser: (user: NewUser) =>
      runDb((db) =>
        db.insert(users).values(user).pipe(
          Effect.asVoid,
          Effect.mapError((e) => new DbWriteError({ cause: e }))
        )
      ),

    createUserWithAudit: (user: NewUser) =>
      runDbWithSql((db, sql) =>
        sql.withTransaction(
          Effect.gen(function* () {
            yield* db.insert(users).values(user);
            yield* db.insert(auditLog).values({ action: "user_created" });
          })
        ).pipe(
          Effect.mapError((e) => new DbWriteError({ cause: e }))
        )
      ),
  };
};
