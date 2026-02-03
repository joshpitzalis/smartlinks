import { Context as EffectContext } from "effect";
import type { Context } from "hono";

export class CloudFlareContext extends EffectContext.Tag("CloudFlareContext")<
	CloudFlareContext,
	Context<{ Bindings: Env }>
>() {}
