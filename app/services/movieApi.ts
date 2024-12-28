import { decodeMovieList } from "@/schema/movies";
import { Effect, ManagedRuntime, Schema } from "effect";
import { GetResource, GetResourceLayer } from "./getResource";

const keySchema = Schema.Literal("getNowPlaying", "getPopular", "getTopRated", "getUpcoming")
export const decodeMovieApiKey = Schema.decode(keySchema)
export type MovieApiKetType = typeof keySchema.Type
const make = {
  getNowPlaying: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("movie/now_playing?language=en-US&page=1")
    return yield* decodeMovieList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
  getPopular: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("movie/popular?language=en-US&page=1")
    return yield* decodeMovieList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
  getTopRated: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("movie/top_rated?language=en-US&page=1")
    return yield* decodeMovieList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
  getUpcoming: Effect.gen(function* () {
    const getResource = yield* GetResource
    const movies = yield* getResource("movie/upcoming?language=en-US&page=1")
    return yield* decodeMovieList(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
}
export class MoviesApi extends Effect.Service<MoviesApi>()(
  "MoviesApi",
  {
    succeed: make,
  }
) { }

export const moviesRuntime = ManagedRuntime.make(MoviesApi.Default)
