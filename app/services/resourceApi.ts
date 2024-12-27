import { Effect, ManagedRuntime } from "effect";
import { decodeTrend } from "../schema/trend";
import { GetResource, GetResourceLayer } from "./getResource";

const make = {
  getTrending: Effect.gen(function* () {
    const getResource = yield* GetResource
    const getTVTrendingProgram = getResource("trending/tv/day?language=en-US")
    const tvTrendingJson = yield* getTVTrendingProgram
    const trendingTvShows =  yield* decodeTrend(tvTrendingJson);
    const getMovieTrendingProgram = getResource("trending/movie/day?language=en-US")
    const movieTrendingJson = yield* getMovieTrendingProgram
    const trendingMovies =  yield* decodeTrend(movieTrendingJson);
    return {
      trendingTvShows,
      trendingMovies
    }
  }).pipe(Effect.provide(GetResourceLayer)),
}

export class ResourceApi extends Effect.Service<ResourceApi>()(
  "ResourceApi",
  {
    succeed: make,
  }
) { }

export const resourceRuntime = ManagedRuntime.make(ResourceApi.Default)
