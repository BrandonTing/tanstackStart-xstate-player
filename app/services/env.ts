import { Config, Effect, Redacted, Schema } from "effect";
import { EnvValidateError } from "vite/envValidationPlugin";

const clientEnvSchema = Schema.Struct({
	VITE_CONVEX_URL: Schema.String,
});

export const getClientEnvProgram = Effect.gen(function* () {
	const env = yield* Schema.decodeUnknown(clientEnvSchema)(import.meta.env);
	return env;
}).pipe(
	Effect.catchTag("ParseError", (e) =>
		Effect.fail(new EnvValidateError({ message: `Client Env Error: ${e}` })),
	),
);

export const getServerEnvProgram = Effect.gen(function* () {
	const baseUrl = yield* Config.string("base_url").pipe(
		Config.validate({
			message: "Expected a string start with https:// and end with /",
			validation: (s) => s.startsWith("https://") && s.endsWith("/"),
		}),
	);
	const apiKey = yield* Config.redacted("api_key");
	const apiKeyValue = Redacted.value(apiKey);
	return {
		baseUrl,
		apiKey: apiKeyValue,
	};
}).pipe(
	Effect.catchTag("ConfigError", (e) =>
		Effect.fail(new EnvValidateError({ message: `Server Env Error: ${e}` })),
	),
);
