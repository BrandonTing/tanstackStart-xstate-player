import { FeaturedMovie } from "@/components/FeaturedMovie";
import { HomeContentRow } from "@/components/HomeContentRow";
import type { Fail } from "@/lib/type";
import { ResourceApi, resourceRuntime } from "@/services/resourceApi";
// app/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect, Schema } from "effect";
const contentTypeSchema = Schema.Literal("tv", "movie");
const mainRouteSearchParam = Schema.Struct({
	contentType: Schema.optionalWith(contentTypeSchema, {
		default: () => "tv",
	}),
});

export type ContentType = typeof mainRouteSearchParam.Type.contentType;

const getTrendingContent = createServerFn({
	method: "GET",
}).handler(() => {
	return resourceRuntime.runPromise(
		Effect.gen(function* () {
			const resourceApi = yield* ResourceApi;
			const { trendingMovies, trendingTvShows } =
				yield* resourceApi.getTrending;
			return {
				success: true as true,
				tvShows: trendingTvShows,
				movies: trendingMovies,
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
				ParseError: (e) => {
					return Effect.succeed({
						success: false,
						message: `Parse error: ${e.message}`,
					} as Fail);
				},
			}),
		),
	);
});

export const Route = createFileRoute("/_main/")({
	component: Home,
	loader: async () => await getTrendingContent(),
});

function Home() {
	const state = Route.useLoaderData();
	if (!state.success) {
		return <p className="pt-20 ">{state.message}</p>;
	}
	const { movies, tvShows } = state;
	const featuredMovie = movies.results[0];

	return (
		<main>
			{featuredMovie ? (
				<FeaturedMovie
					id={featuredMovie.id}
					title={featuredMovie.title}
					description={featuredMovie.overview}
					imageUrl={featuredMovie.posterPath}
				/>
			) : null}
			<div className="container px-4 py-8 mx-auto">
				<HomeContentRow title="TV Shows" contents={tvShows.results} />
				<HomeContentRow title="Movies" contents={movies.results} />
			</div>
		</main>
	);
}
