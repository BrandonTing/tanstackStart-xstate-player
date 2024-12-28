import { ContentGrid } from "@/components/ContentGrid";
import {
	type MovieApiKetType,
	MoviesApi,
	decodeMovieApiKey,
	moviesRuntime,
} from "@/services/movieApi";
import { Await, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Console, Effect } from "effect";

const getMoviesProgram = (type: MovieApiKetType) => {
	return Effect.gen(function* () {
		const movieApi = yield* MoviesApi;
		const list = yield* movieApi[type];
		return list;
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
	.validator((type: MovieApiKetType) => Effect.runSync(decodeMovieApiKey(type)))
	.handler((ctx) => moviesRuntime.runPromise(getMoviesProgram(ctx.data)));

export const Route = createFileRoute("/_main/movies")({
	component: RouteComponent,
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
	return (
		<main className="container px-4 pt-24 mx-auto">
			<h1 className="mb-8 text-4xl font-bold ">Movies</h1>
			{nowPlaying ? (
				<ContentGrid
					title="Now Playing"
					contents={nowPlaying.results}
					limit={5}
				/>
			) : null}
			<Await promise={popular} fallback={<div>Loading...</div>}>
				{(data) => {
					if (!data) {
						return null;
					}
					return (
						<ContentGrid title="Popular" contents={data.results} limit={5} />
					);
				}}
			</Await>
			<Await promise={topRated} fallback={<div>Loading...</div>}>
				{(data) => {
					if (!data) {
						return null;
					}
					return (
						<ContentGrid title="Top Rated" contents={data.results} limit={5} />
					);
				}}
			</Await>
			<Await promise={upcoming} fallback={<div>Loading...</div>}>
				{(data) => {
					if (!data) {
						return null;
					}
					return (
						<ContentGrid title="Upcoming" contents={data.results} limit={5} />
					);
				}}
			</Await>
		</main>
	);
}
