import type { FetchError, JsonError } from "@/errors/error";
import { decodeCreditList } from "@/schema/base";
import {
	type MovieList,
	decodeMovieDetail,
	decodeMovieList,
} from "@/schema/movies";
import {
	Chunk,
	Console,
	Effect,
	ManagedRuntime,
	Schema,
	Sink,
	Stream,
} from "effect";
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
	getMovieDetail: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const movies = yield* getResource(`movie/${id}?language=en-US&page=1`);
			return yield* decodeMovieDetail(movies);
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getCredits: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const movies = yield* getResource(
				`movie/${id}/credits?language=en-US&page=1`,
			);
			const { cast } = yield* decodeCreditList(movies);
			const stream = Stream.fromIterable(cast);
			const castsChunk = yield* stream.pipe(Stream.run(Sink.take(10)));
			return Chunk.toReadonlyArray(castsChunk);
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getRecommendations: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const tvShows = yield* getResource(
				`movie/${id}/recommendations?language=en-US&page=1`,
			);
			const { results } = yield* decodeMovieList(tvShows);
			const stream = Stream.fromIterable(results);
			const castsChunk = yield* stream.pipe(Stream.run(Sink.take(5)));
			return Chunk.toReadonlyArray(castsChunk);
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getSimilar: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const tvShows = yield* getResource(
				`movie/${id}/similar?language=en-US&page=1`,
			);
			const { results } = yield* decodeMovieList(tvShows);
			const stream = Stream.fromIterable(results);
			const castsChunk = yield* stream.pipe(Stream.run(Sink.take(5)));
			return Chunk.toReadonlyArray(castsChunk);
		}).pipe(Effect.provide(GetResourceLayer));
	},
};

export class MoviesByIdApi extends Effect.Service<MoviesByIdApi>()(
	"MoviesByIdApi",
	{
		succeed: makeMoviesByIdApi,
	},
) {}

export const moviesByidApiRuntime = ManagedRuntime.make(MoviesByIdApi.Default);

export const getMoviesDetailProgram = (id: number) => {
	return Effect.gen(function* () {
		const moviesByIdApi = yield* MoviesByIdApi;
		const detail = yield* moviesByIdApi.getMovieDetail(id);
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

export const getMovieDeferredDataProgram = (id: number) => {
	return Effect.gen(function* () {
		const moviesByIdApi = yield* MoviesByIdApi;
		const credits = yield* moviesByIdApi.getCredits(id);
		const recommendations = yield* moviesByIdApi.getRecommendations(id);
		const similar = yield* moviesByIdApi.getSimilar(id);
		return { credits, recommendations, similar };
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
