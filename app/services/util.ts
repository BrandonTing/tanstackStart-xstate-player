import type { FetchError, JsonError } from "@/errors/error";
import { Console, Effect } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type { ParseError } from "effect/ParseResult";

export type ResourceError = ParseError | FetchError | JsonError | ConfigError;

export const resourceErrorHandling = Effect.catchTags<
	ResourceError,
	{
		FetchError: (e: FetchError) => Effect.Effect<null, never>;
		JsonError: (e: JsonError) => Effect.Effect<null, never>;
		ParseError: (e: ParseError) => Effect.Effect<null, never>;
	}
>({
	FetchError: (e) => {
		Effect.runSync(Console.error(`Fetch error: ${e.message}`));
		return Effect.succeed(null);
	},
	JsonError: (e) => {
		Effect.runSync(Console.error(`Json error: ${e.message}`));
		return Effect.succeed(null);
	},
	ParseError: (e) => {
		Effect.runSync(Console.error(`Parse error: ${e.message}`));
		return Effect.succeed(null);
	},
});
