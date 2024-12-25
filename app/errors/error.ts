import { Data } from "effect";
// biome-ignore lint/complexity/noBannedTypes: use {} in error class is fine 
export class FetchError extends Data.TaggedError("FetchError")<{}> { }
// biome-ignore lint/complexity/noBannedTypes: use {} in error class is fine 
export class JsonError extends Data.TaggedError("JsonError")<{}> { }
