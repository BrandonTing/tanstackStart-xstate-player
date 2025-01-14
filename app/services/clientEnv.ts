import { Effect, Schema } from "effect";
import { EnvValidateError } from "vite/envValidationPlugin";

const clientEnvSchema = Schema.Struct({
	VITE_CONVEX_URL: Schema.String,
});

export const getClientEnvProgram = Effect.gen(function* () {
	const env = yield* Schema.decodeUnknown(clientEnvSchema)(import.meta.env);
	return env;
})
