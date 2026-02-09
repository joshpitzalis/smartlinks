import { Data } from "effect";

export class SearchAPIError extends Data.TaggedError("SearchAPIError")<{
	cause: unknown;
}> {}

export class ParseError extends Data.TaggedError("ParseError")<{
	cause: unknown;
}> {}

export class NoResultsError extends Data.TaggedError("NoResultsError")<{}> {}
