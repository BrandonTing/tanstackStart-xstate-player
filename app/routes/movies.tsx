import { ContentGrid } from "@/components/ContentGrid";
import {
	type MovieApiKeyType,
	MoviesApi,
	decodeMovieApiKey,
	moviesRuntime,
} from "@/services/movieApi";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Chunk, Console, Effect, Sink, Stream } from "effect";
import { use } from "react";

const getMoviesProgram = (type: MovieApiKeyType) => {
	return Effect.gen(function* () {
		const movieApi = yield* MoviesApi;
		const list = yield* movieApi[type];
		const stream = Stream.fromIterable(list.results);
		const castsChunk = yield* stream.pipe(Stream.run(Sink.take(5)));
		return Chunk.toReadonlyArray(castsChunk);
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
const getMovies = createServerFn({
	method: "GET",
})
	.validator((type: MovieApiKeyType) => Effect.runSync(decodeMovieApiKey(type)))
	.handler((ctx) => moviesRuntime.runPromise(getMoviesProgram(ctx.data)));

export const Route = createFileRoute("/movies")({
	component: RouteComponent,
	staleTime: 30_000,
	loader: async () => {
		const nowPlaying = await getMovies({
			data: "getNowPlaying",
		});
		const popular = getMovies({
			data: "getPopular",
		});
		const topRated = getMovies({
			data: "getTopRated",
		});
		const upcoming = getMovies({
			data: "getUpcoming",
		});
		return {
			nowPlaying,
			popular,
			topRated,
			upcoming,
		};
	},
});

function RouteComponent() {
	const { nowPlaying, popular, topRated, upcoming } = Route.useLoaderData();
	const popularData = use(popular);
	const topRatedData = use(topRated);
	const upcomingData = use(upcoming);
	return (
		<main className="container px-4 pt-24 mx-auto">
			<h1 className="mb-8 text-4xl font-bold ">Movies</h1>
			{nowPlaying ? (
				<ContentGrid title="Now Playing" contents={nowPlaying} />
			) : null}
			{popularData ? (
				<ContentGrid title="Popular" contents={popularData} />
			) : null}
			{topRatedData ? (
				<ContentGrid title="Top Rated" contents={topRatedData} />
			) : null}
			{upcomingData ? (
				<ContentGrid title="Upcoming" contents={upcomingData} />
			) : null}
		</main>
	);
}
