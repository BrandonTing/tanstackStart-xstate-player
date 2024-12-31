import type { FetchError, JsonError } from "@/errors/error";
import { type MovieList, decodeMovieDetail, decodeMovieList } from "@/schema/movies";
import { Console, Effect, ManagedRuntime, Schema } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type { ParseError } from "effect/ParseResult";
import { GetResource, GetResourceLayer } from "./getResource";

const keySchema = Schema.Literal(
	"getNowPlaying",
	"getPopular",
	"getTopRated",
	"getUpcoming",
);
export const decodeMovieApiKey = Schema.decode(keySchema);
export type MovieApiKeyType = typeof keySchema.Type;
const make = {
	getNowPlaying: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const movies = yield* getResource(
			"movie/now_playing?language=en-US&page=1",
		);
		return yield* decodeMovieList(movies);
	}).pipe(Effect.provide(GetResourceLayer)),
	getPopular: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const movies = yield* getResource("movie/popular?language=en-US&page=1");
		return yield* decodeMovieList(movies);
	}).pipe(Effect.provide(GetResourceLayer)),
	getTopRated: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const movies = yield* getResource("movie/top_rated?language=en-US&page=1");
		return yield* decodeMovieList(movies);
	}).pipe(Effect.provide(GetResourceLayer)),
	getUpcoming: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const movies = yield* getResource("movie/upcoming?language=en-US&page=1");
		return yield* decodeMovieList(movies);
	}).pipe(Effect.provide(GetResourceLayer)),
} satisfies Record<
	MovieApiKeyType,
	Effect.Effect<
		MovieList,
		ParseError | FetchError | JsonError | ConfigError,
		never
	>
>;
export class MoviesApi extends Effect.Service<MoviesApi>()("MoviesApi", {
	succeed: make,
}) {}

export const moviesRuntime = ManagedRuntime.make(MoviesApi.Default);

const makeMoviesByIdApi = {
  getMovieDetail: (id:number) => {
    return Effect.gen(function* () {
      const getResource = yield* GetResource;
      const movies = yield* getResource(`movie/${id}?language=en-US&page=1`);
      return yield* decodeMovieDetail(movies);
    }).pipe(Effect.provide(GetResourceLayer))
  }
}

export class MoviesByIdApi extends Effect.Service<MoviesByIdApi>()(
  "MoviesByIdApi",
  {
    succeed: makeMoviesByIdApi,
  },
) {}

export const moviesByidApiRuntime = ManagedRuntime.make(
  MoviesByIdApi.Default,
);

export const getMoviesDetailProgram = (id: number) => {
  return Effect.gen(function* () {
    const moviesByIdApi = yield* MoviesByIdApi;
    const detail = yield* moviesByIdApi.getMovieDetail(id)
    return detail;
  }).pipe(
    Effect.catchTags({
      FetchError: (e) => {
        Effect.runSync(Console.error(`Fetch error: ${e.message}`));
        return Effect.succeed(null);
      },
      JsonError: (e) => {
        Effect.runSync(Console.error(`Json error: ${e.message}`));
        return Effect.succeed(null);
      },
      ParseError: (e) => {
        Effect.runSync(Console.error(`Parse error: ${e.message}`));
        return Effect.succeed(null);
      },
    }),
  );
};
