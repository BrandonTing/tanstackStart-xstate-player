import { Data } from "effect";
// biome-ignore lint/complexity/noBannedTypes: use {} in error class is fine
export class ConvexError extends Data.TaggedError("ConvexError")<{}> {}
