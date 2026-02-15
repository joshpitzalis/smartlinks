import { Data } from "effect";

export class SearchAPIError extends Data.TaggedError("SearchAPIError")<{
	cause: unknown;
}> {}

export class ParseError extends Data.TaggedError("ParseError")<{
	cause: unknown;
}> {}

export class NoResultsError extends Data.TaggedError("NoResultsError")<{}> {}

export class R2SaveError extends Data.TaggedError("R2SaveError")<{
	cause: unknown;
	id: "ADVERTISER_STORAGE";
}> {}

export class R2FetchError extends Data.TaggedError("R2FetchError")<{
	cause: unknown;
	id: "ADVERTISER_STORAGE";
}> {}

export class R2ParseError extends Data.TaggedError("R2ParseError")<{
	cause: unknown;
	id: "ADVERTISER_STORAGE";
}> {}

export class GetAdvertisersFetchError extends Data.TaggedError(
	"GetAdvertisersFetchError",
)<{
	cause: unknown;
}> {}

export class KVFetchError extends Data.TaggedError("KVFetchError")<{
	cause: unknown;
	id: "QUERY-CACHE";
}> {}

export class KVSaveError extends Data.TaggedError("KVSaveError")<{
	cause: unknown;
	id: "QUERY-CACHE";
}> {}

export class D1WriteError extends Data.TaggedError("ParseError")<{
	cause: unknown;
}> {}
