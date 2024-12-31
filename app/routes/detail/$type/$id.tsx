import { Button } from "@/components/ui/button";
import {
	getMoviesDetailProgram,
	moviesByidApiRuntime,
} from "@/services/movieApi";
import {
	getTVSeriesDetailProgram,
	tvShowsByidApiRuntime,
} from "@/services/tvShowsApi";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Match } from "effect";
import { Play, Plus, ThumbsUp } from "lucide-react";

const getTvShowDetail = createServerFn({
	method: "GET",
})
	.validator((id: number) => id)
	.handler((ctx) =>
		tvShowsByidApiRuntime.runPromise(getTVSeriesDetailProgram(ctx.data)),
	);
const getMoviesDetail = createServerFn({
	method: "GET",
})
	.validator((id: number) => id)
	.handler((ctx) =>
		moviesByidApiRuntime.runPromise(getMoviesDetailProgram(ctx.data)),
	);
export const Route = createFileRoute("/detail/$type/$id")({
	component: RouteComponent,
	loader: async ({ params: { type, id } }) => {
		return Match.value(type).pipe(
			Match.when("movies", async () => {
				const data = await getMoviesDetail({ data: Number(id) });
				return data;
			}),
			Match.when("tvShows", async () => {
				const data = await getTvShowDetail({ data: Number(id) });
				return data;
			}),
			Match.orElse(() => {
				throw redirect({ to: "/" });
			}),
		);
	},
});

function RouteComponent() {
	const state = Route.useLoaderData();
	if (!state) {
		return (
			<div className="flex items-center justify-center min-h-screen text-white bg-black">
				Content not found
			</div>
		);
	}
	return (
		<main className="pt-24">
			<div className="container px-4 mx-auto mb-8">
				<div className="flex flex-col gap-8 md:flex-row">
					<div className="md:w-1/3">
						<img
							src={state.posterPath}
							alt={state.title}
							className="w-full h-auto rounded-lg shadow-lg"
						/>
					</div>
					<div className="overflow-y-auto md:w-2/3 h-[80vh]">
						<h1 className="mb-4 text-4xl font-bold text-white">
							{state.title}
						</h1>
						<p className="mb-4 text-gray-400">{state.overview}</p>
						<p className="mb-4 text-gray-400">
							Release Date: {state.releaseDate}
						</p>
						<div className="flex mb-6 space-x-4 text-black">
							<Link href={`/watch/${state.id}`}>
								<Button className="flex items-center space-x-2">
									<Play className="w-4 h-4" />
									<span>Play</span>
								</Button>
							</Link>
							<Button variant="outline" className="flex items-center space-x-2">
								<Plus className="w-4 h-4" />
								<span>My List</span>
							</Button>
							<Button variant="outline" className="flex items-center space-x-2">
								<ThumbsUp className="w-4 h-4" />
								<span>Rate</span>
							</Button>
						</div>
						<div className="mb-6">
							<h2 className="mb-2 text-2xl font-semibold text-white">
								Categories
							</h2>
							<div className="flex flex-wrap gap-2">
								{state.categories.map((category) => (
									<span
										key={category.id}
										className="px-3 py-1 text-sm text-white bg-gray-700 rounded-full"
									>
										{category.name}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* <div className="container px-4 mx-auto mb-8">
				<ActorList actorIds={content.actors} />
			</div>

			<div className="w-full py-8 bg-zinc-900">
				<div className="container px-4 mx-auto">
					<MovieList
						title={
							contentType === "movies" ? "Related Movies" : "Related Shows"
						}
						movieIds={
							contentType === "movies"
								? "relatedMovies" in content
									? content.relatedMovies
									: []
								: "relatedShows" in content
									? content.relatedShows
									: []
						}
						contentType={contentType}
					/>
				</div>
			</div>

			<div className="w-full py-8 bg-zinc-800">
				<div className="container px-4 mx-auto">
					<MovieList
						title="Others Also Watched"
						movieIds={content.othersWatched}
						contentType={contentType}
					/>
				</div>
			</div> */}
		</main>
	);
}
