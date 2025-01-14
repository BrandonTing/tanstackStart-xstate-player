import { Context, Effect, Layer } from "effect";
import type { EnvValidateError } from "vite/envValidationPlugin";
import { getServerEnvProgram } from "./env";

export class GetResourceEndpoint extends Context.Tag("GetResourceEndpoint")<
	GetResourceEndpoint,
	(url: string) => Effect.Effect<string, EnvValidateError, never>
>() {
	static readonly Live = Layer.succeed(this, (url) =>
		Effect.gen(function* () {
			const { apiKey, baseUrl } = yield* getServerEnvProgram;
			const hasQS = url.includes("?");
			return `${baseUrl}${url}${hasQS ? "&" : "?"}api_key=${apiKey}`;
		}),
	);
}
