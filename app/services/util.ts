import type { FetchError, JsonError } from "@/errors/error";
import { Console, Effect } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { EnvValidateError } from "vite/envValidationPlugin";

export type ResourceError =
	| ParseError
	| FetchError
	| JsonError
	| EnvValidateError;

export function resourceErrorHandlingWithDefault<T>(defaultVal: T) {
	return Effect.catchTags<
		ResourceError,
		{
			FetchError: (e: FetchError) => Effect.Effect<T, never>;
			JsonError: (e: JsonError) => Effect.Effect<T, never>;
			ParseError: (e: ParseError) => Effect.Effect<T, never>;
		}
	>({
		FetchError: (e) => {
			Effect.runSync(Console.error(`Fetch error: ${e.message}`));
			return Effect.succeed(defaultVal);
		},
		JsonError: (e) => {
			Effect.runSync(Console.error(`Json error: ${e.message}`));
			return Effect.succeed(defaultVal);
		},
		ParseError: (e) => {
			Effect.runSync(Console.error(`Parse error: ${e.message}`));
			return Effect.succeed(defaultVal);
		},
	});
}

export const resourceErrorHandling = resourceErrorHandlingWithDefault(null);
