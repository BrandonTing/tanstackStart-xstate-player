import { ContentGrid } from "@/components/ContentGrid";
import { CreditList } from "@/components/CreditList";
import { Button } from "@/components/ui/button";
import {
	getMovieDeferredDataProgram,
	getMoviesDetailProgram,
	moviesByidApiRuntime,
} from "@/services/movieApi";
import {
	getTVSeriesDeferredDataProgram,
	getTVSeriesDetailProgram,
	tvShowsByidApiRuntime,
} from "@/services/tvShowsApi";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Match } from "effect";
import { Play, Plus, ThumbsUp } from "lucide-react";
import { use } from "react";

const getDetail = createServerFn({
	method: "GET",
})
	.validator(({ id, type }: { id: number; type: "movies" | "tvShows" }) => ({
		id,
		type,
	}))
	.handler((ctx) => {
		const { id, type } = ctx.data;
		if (type === "movies") {
			return moviesByidApiRuntime.runPromise(getMoviesDetailProgram(id));
		}
		return tvShowsByidApiRuntime.runPromise(getTVSeriesDetailProgram(id));
	});
const getDeferred = createServerFn({
	method: "GET",
})
	.validator(({ id, type }: { id: number; type: "movies" | "tvShows" }) => ({
		id,
		type,
	}))
	.handler((ctx) => {
		const { id, type } = ctx.data;
		if (type === "movies") {
			return moviesByidApiRuntime.runPromise(getMovieDeferredDataProgram(id));
		}
		return tvShowsByidApiRuntime.runPromise(getTVSeriesDeferredDataProgram(id));
	});

export const Route = createFileRoute("/detail/$type/$id")({
	component: RouteComponent,
	staleTime: 60 * 1000 * 10,
	loader: async ({ params: { type, id } }) => {
		return Match.value(type).pipe(
			Match.when("movies", async () => {
				const data = await getDetail({
					data: { id: Number(id), type: "movies" },
				});
				const deferred = getDeferred({
					data: { id: Number(id), type: "movies" },
				});
				return { data, deferred };
			}),
			Match.when("tvShows", async () => {
				const data = await getDetail({
					data: { id: Number(id), type: "tvShows" },
				});
				const deferred = getDeferred({
					data: { id: Number(id), type: "movies" },
				});
				return { data, deferred };
			}),
			Match.orElse(() => {
				console.log(type);
				throw redirect({ to: "/" });
			}),
		);
	},
});

function resetScrollToTop(node: HTMLDivElement | null) {
	if (node) {
		node.scrollTo({ top: 0 });
	}
}

function RouteComponent() {
	const { data, deferred } = Route.useLoaderData();
	const { type } = Route.useParams();
	const deferredData = use(deferred);
	if (!data) {
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
							src={data.posterPath}
							alt={data.title}
							className="w-full h-auto rounded-lg shadow-lg"
						/>
					</div>
					<div
						className="overflow-y-auto md:w-2/3 h-[85vh]"
						ref={resetScrollToTop}
					>
						<h1 className="mb-4 text-4xl font-bold text-white">{data.title}</h1>
						<p className="mb-4 text-gray-400">{data.overview}</p>
						<p className="mb-4 text-gray-400">
							Release Date: {data.releaseDate}
						</p>
						<div className="flex mb-6 space-x-4 text-black">
							<Link href={`/watch/${data.id}`}>
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
								{data.categories.map((category) => (
									<span
										key={category.id}
										className="px-3 py-1 text-sm text-white bg-gray-700 rounded-full"
									>
										{category.name}
									</span>
								))}
							</div>
						</div>
						{deferredData ? (
							<div className="mr-4">
								<div className="mx-auto mb-8">
									<CreditList creditList={deferredData.credits} />
								</div>
								<ContentGrid
									title="Recommendations"
									contents={deferredData.recommendations}
								/>
								<ContentGrid title="Similar" contents={deferredData.similar} />
							</div>
						) : null}
					</div>
				</div>
			</div>
		</main>
	);
}
