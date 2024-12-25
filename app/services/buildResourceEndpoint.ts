import { Config, Context, Effect, Layer, Redacted } from "effect";
import type { ConfigError } from "effect/ConfigError";

export class GetResourceEndpoint extends Context.Tag("GetResourceEndpoint")<
  GetResourceEndpoint,
  (url: string) => Effect.Effect<string, ConfigError, never>
>() {
  static readonly Live = Layer.succeed(
    this,
    (url) => Effect.gen(function* () {
      const apiKey = yield* Config.redacted("api_key");
      const apiKeyValue = Redacted.value(apiKey)
      const hasQS = url.includes("?")
      return `${url}${hasQS ? "" : "?"}api_key=${apiKeyValue}`
    })
  )
};
