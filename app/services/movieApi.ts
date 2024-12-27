import { decodeNowPlayingMovies } from "@/schema/movies";
import { Effect, ManagedRuntime } from "effect";
import { GetResource, GetResourceLayer } from "./getResource";

const make = {
  getNowPlaying: Effect.gen(function* () {
    const getResource = yield* GetResource
    const getNowPlayingMovie = getResource("movie/now_playing?language=en-US&page=1")
    const movies = yield* getNowPlayingMovie
    return yield* decodeNowPlayingMovies(movies);
  }).pipe(Effect.provide(GetResourceLayer)),
}

export class MoviesApi extends Effect.Service<MoviesApi>()(
  "MoviesApi",
  {
    succeed: make,
  }
) { }

export const moviesRuntime = ManagedRuntime.make(MoviesApi.Default)
