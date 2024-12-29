import { ContentGrid } from "@/components/ContentGrid";
import {
	TVShowsApi,
	type TVShowsApiKeyType,
	decodeTVShowsApiKey,
	tvShowsApiRuntime,
} from "@/services/tvShowsApi";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Console, Effect } from "effect";
import { use } from "react";
const getTVShowsProgram = (type: TVShowsApiKeyType) => {
	return Effect.gen(function* () {
		const tvShowsApi = yield* TVShowsApi;
		const list = yield* tvShowsApi[type];
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
const getTvShows = createServerFn({
	method: "GET",
})
	.validator((type: TVShowsApiKeyType) =>
		Effect.runSync(decodeTVShowsApiKey(type)),
	)
	.handler((ctx) => tvShowsApiRuntime.runPromise(getTVShowsProgram(ctx.data)));

export const Route = createFileRoute("/_main/tvShows")({
	component: RouteComponent,
	loader: async () => {
		const airingToday = await getTvShows({
			data: "getAiringToday",
		});
		const onTheAir = getTvShows({
			data: "getOnTheAir",
		});
		const popular = getTvShows({
			data: "getPopular",
		});
		const topRated = getTvShows({
			data: "getTopRated",
		});
		return {
			airingToday,
			onTheAir,
			popular,
			topRated,
		};
	},
});

function RouteComponent() {
	const { airingToday, onTheAir, popular, topRated } = Route.useLoaderData();
	const onTheAirData = use(onTheAir);
	const popularData = use(popular);
	const topRatedData = use(topRated);
	return (
		<main className="container px-4 pt-24 mx-auto">
			<h1 className="mb-8 text-4xl font-bold ">TV Shows</h1>
			{airingToday ? (
				<ContentGrid
					title="Airing Today"
					contents={airingToday.results}
					limit={5}
				/>
			) : null}
			{onTheAirData ? (
				<ContentGrid
					title="On The Air"
					contents={onTheAirData.results}
					limit={5}
				/>
			) : null}
			{popularData ? (
				<ContentGrid title="Popular" contents={popularData.results} limit={5} />
			) : null}
			{topRatedData ? (
				<ContentGrid
					title="Top Rated"
					contents={topRatedData.results}
					limit={5}
				/>
			) : null}
		</main>
	);
}
