import { Context, Effect, Layer } from "effect";
import type { ConfigError } from "effect/ConfigError";
import { FetchError, JsonError } from "../errors/error";
import { GetResourceEndpoint } from "./buildResourceEndpoint";

export class GetResource extends Context.Tag("GetResource")<
  GetResource,
  (url: string) => Effect.Effect<unknown, JsonError | FetchError | ConfigError, never>
>() {
  static readonly Live = Layer.succeed(
    this,
    (url) => Effect.gen(function* () {
      const getResourceEndpoint = yield* GetResourceEndpoint
      const endpoint = yield* getResourceEndpoint(url)
      const response = yield* Effect.tryPromise({
        try: () => fetch(endpoint),
        catch: () => new FetchError()
      });

      if (!response.ok) {
        return yield* new FetchError();
      }

      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: () => new JsonError(),
      });;
      return json
    }).pipe(Effect.provide(GetResourceEndpoint.Live))
  )
};

export const GetResourceLayer = Layer.mergeAll(GetResource.Live, GetResourceEndpoint.Live)
