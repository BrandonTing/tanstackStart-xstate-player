import { ContentGrid } from "@/components/ContentGrid";
import type { Fail } from "@/lib/type";
import { MoviesApi, moviesRuntime } from "@/services/movieApi";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect } from "effect";

const getMovies = createServerFn({
	method: "GET",
}).handler(() => {
	return moviesRuntime.runPromise(
		Effect.gen(function* () {
			const movieApi = yield* MoviesApi;
			const nowPlaying = yield* movieApi.getNowPlaying;
			return {
				success: true as true,
				nowPlaying,
			};
		}).pipe(
			Effect.catchTags({
				FetchError: (e) =>
					Effect.succeed({
						success: false,
						message: `Fetch error: ${e.message}`,
					} as Fail),
				JsonError: (e) =>
					Effect.succeed({
						success: false,
						message: `Json error: ${e.message}`,
					} as Fail),
				ParseError: (e) =>
					Effect.succeed({
						success: false,
						message: `Parse error: ${e.message}`,
					} as Fail),
			}),
		),
	);
});

export const Route = createFileRoute("/_main/movies")({
	component: RouteComponent,
	loader: async () => {
		const nowPlaying = await getMovies();
		return nowPlaying;
	},
});

function RouteComponent() {
	const state = Route.useLoaderData();
	if (!state.success) {
		return <p className="pt-20 text-white">{state.message}</p>;
	}

	return (
		<main className="container px-4 pt-24 mx-auto">
			<h1 className="mb-8 text-4xl font-bold text-white">Movies</h1>
			<ContentGrid
				title="Now Playing"
				contents={state.nowPlaying.results}
				limit={5}
			/>
			{/* <ContentGrid title="Popular" contents={popular} limit={5} />
			<ContentGrid title="Top Rated" contents={topRated} limit={5} />
			<ContentGrid title="Upcoming" contents={upcoming} limit={5} /> */}
		</main>
	);
}
