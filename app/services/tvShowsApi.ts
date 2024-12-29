import type { FetchError, JsonError } from "@/errors/error";
import { type TVShowsList, decodeTVShowsList } from "@/schema/tvShows";
import { Effect, ManagedRuntime, Schema } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type { ParseError } from "effect/ParseResult";
import { GetResource, GetResourceLayer } from "./getResource";

const keySchema = Schema.Literal("getAiringToday", "getOnTheAir", "getPopular", "getTopRated")
export const decodeTVShowsApiKey = Schema.decode(keySchema)
export type TVShowsApiKeyType = typeof keySchema.Type
const make = {
  getAiringToday: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("tv/airing_today?language=en-US&page=1")
    return yield* decodeTVShowsList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
  getOnTheAir: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("tv/on_the_air?language=en-US&page=1")
    return yield* decodeTVShowsList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
  getPopular: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("tv/popular?language=en-US&page=1")
    return yield* decodeTVShowsList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
  getTopRated: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("tv/top_rated?language=en-US&page=1")
    return yield* decodeTVShowsList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
} satisfies Record<TVShowsApiKeyType, Effect.Effect<TVShowsList, ParseError | FetchError | JsonError | ConfigError, never>>
export class TVShowsApi extends Effect.Service<TVShowsApi>()(
  "TVShowsApi",
  {
    succeed: make,
  }
) { }

export const tvShowsApiRuntime = ManagedRuntime.make(TVShowsApi.Default)
