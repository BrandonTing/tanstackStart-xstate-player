import type { FetchError, JsonError } from "@/errors/error";
import { Console, Effect } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type { ParseError } from "effect/ParseResult";

export const commonErrorHandling = Effect.catchTags<
	FetchError | JsonError | ParseError | ConfigError,
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
