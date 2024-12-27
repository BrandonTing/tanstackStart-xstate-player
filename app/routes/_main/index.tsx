import { FeaturedMovie } from "@/components/FeaturedMovie";
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

type Fail = {
	success: false;
	message: string;
};
const getTrendingContent = createServerFn({
	method: "GET",
}).handler(() => {
	return resourceRuntime.runPromise(
		Effect.gen(function* () {
			const resourceApi = yield* ResourceApi;
			const trendingTvShows = yield* resourceApi.getTrending("tv");
			const trendingMovies = yield* resourceApi.getTrending("movie");
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
				ParseError: (e) =>
					Effect.succeed({
						success: false,
						message: `Parse error: ${e.message}`,
					} as Fail),
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
		return <p className="pt-20 text-white">{state.message}</p>;
	}
	const featuredMovie = state.movies.results[0];

	return (
		<>
			{featuredMovie ? (
				<FeaturedMovie
					id={featuredMovie.id}
					title={featuredMovie.title}
					description={featuredMovie.overview}
					imageUrl={featuredMovie.poster_path}
				/>
			) : null}
		</>
	);
}
