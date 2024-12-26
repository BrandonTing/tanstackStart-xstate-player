import { Config, Context, Effect, Layer, Redacted } from "effect";
import type { ConfigError } from "effect/ConfigError";

export class GetResourceEndpoint extends Context.Tag("GetResourceEndpoint")<
  GetResourceEndpoint,
  (url: string) => Effect.Effect<string, ConfigError, never>
>() {
  static readonly Live = Layer.succeed(
    this,
    (url) => Effect.gen(function* () {
      const baseUrl = yield* Config.string("base_url").pipe(
        Config.validate({
          message: "Expected a string start with https:// and end with /",
          validation: (s) => s.startsWith("https://") && s.endsWith("/")
        })
      )
      const apiKey = yield* Config.redacted("api_key");
      const apiKeyValue = Redacted.value(apiKey)
      const hasQS = url.includes("?")
      return `${baseUrl}${url}${hasQS ? "&" : "?"}api_key=${apiKeyValue}`
    })
  )
};
