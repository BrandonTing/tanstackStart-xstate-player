import { Console, Data, Effect } from "effect";
// biome-ignore lint/complexity/noBannedTypes: use {} in error class is fine
export class ConvexError extends Data.TaggedError("ConvexError")<{}> {}

export const convexErrorHandling = Effect.catchTags<
	ConvexError,
	{
		ConvexError: (e: ConvexError) => Effect.Effect<null, never>;
	}
>({
	ConvexError: (e) => {
		Effect.runSync(Console.error(`ConvexError error: ${e.message}`));
		return Effect.succeed(null);
	},
});
