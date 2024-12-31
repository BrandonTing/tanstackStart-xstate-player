import { ContentGrid } from "@/components/ContentGrid";
import {
	TVShowsApi,
	type TVShowsApiKeyType,
	decodeTVShowsApiKey,
	tvShowsApiRuntime,
} from "@/services/tvShowsApi";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Chunk, Console, Effect, Sink, Stream } from "effect";
import { use } from "react";
const getTVShowsProgram = (type: TVShowsApiKeyType) => {
	return Effect.gen(function* () {
		const tvShowsApi = yield* TVShowsApi;
		const list = yield* tvShowsApi[type];
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
const getTvShows = createServerFn({
	method: "GET",
})
	.validator((type: TVShowsApiKeyType) =>
		Effect.runSync(decodeTVShowsApiKey(type)),
	)
	.handler((ctx) => tvShowsApiRuntime.runPromise(getTVShowsProgram(ctx.data)));

export const Route = createFileRoute("/tvShows")({
	component: RouteComponent,
	staleTime: 30_000,
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
					type="tvShows"
					title="Airing Today"
					contents={airingToday}
				/>
			) : null}
			{onTheAirData ? (
				<ContentGrid
					type="tvShows"
					title="On The Air"
					contents={onTheAirData}
				/>
			) : null}
			{popularData ? (
				<ContentGrid type="tvShows" title="Popular" contents={popularData} />
			) : null}
			{topRatedData ? (
				<ContentGrid type="tvShows" title="Top Rated" contents={topRatedData} />
			) : null}
		</main>
	);
}
