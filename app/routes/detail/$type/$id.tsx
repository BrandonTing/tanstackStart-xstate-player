import { ContentGrid } from "@/components/ContentGrid";
import { CreditList } from "@/components/CreditList";
import { SeasonDialog } from "@/components/detail/SeasonDialog";
import { Button } from "@/components/ui/button";
import type { Detail } from "@/schema/base";
import {
  getMovieDeferredDataProgram,
  getMoviesDetailProgram,
  moviesByidApiRuntime,
} from "@/services/movieApi";
import {
  getTVSeasonDetailProgram,
  getTVSeriesDeferredDataProgram,
  getTVSeriesDetailProgram,
  tvShowsByidApiRuntime,
} from "@/services/tvShowsApi";
import { useUser } from "@clerk/tanstack-start";
import { queryOptions } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Match } from "effect";
import { Loader2, Minus, Play, Plus, Star, ThumbsUp } from "lucide-react";
import { use, useActionState } from "react";

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

const getSeasonDetail = createServerFn({
  method: "GET"
}).validator(({ seriesId, seasonNumber }: { seriesId: number, seasonNumber: number }) => ({
  seriesId, seasonNumber
})).handler(ctx => {
  const { seriesId, seasonNumber } = ctx.data;

  return tvShowsByidApiRuntime.runPromise(getTVSeasonDetailProgram(seriesId, seasonNumber))
})

export function seasonDetailQueryOption(seriesId: number, seasonNumber: number) {
  return queryOptions({
    queryKey: ["seasonDetail", seriesId, seasonNumber] as [string, number, number],
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: async ({ queryKey }) => {
      const [_, seriesId, seasonNumber] = queryKey
      return await getSeasonDetail({ data: { seriesId, seasonNumber } })
    },
  })
}

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
          data: { id: Number(id), type: "tvShows" },
        });
        return { data, deferred };
      }),
      Match.orElse(() => {
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
  const deferredData = use(deferred);
  const { user } = useUser()
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
            <div className="flex items-center mb-4">
              <Star className="w-5 h-5 mr-1 text-yellow-400" />
              <span className="text-lg text-white">{data.voteScore ? data.voteScore.toFixed(1) : 'N/A'}</span>
            </div>
            <p className="mb-4 text-gray-400">{data.overview}</p>
            <p className="mb-4 text-gray-400">
              Release Date: {data.releaseDate}
            </p>
            <div className="flex mb-6 space-x-4 text-black">
              <Link
                to={`/video/${data.id}`}
                search={{
                  title: data.title,
                }}
                viewTransition
              >
                <Button className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Play</span>
                </Button>
              </Link>
              {
                user && data ? (
                  <MyListButton user={user} content={data} />
                ) : null
              }
              <Button variant="outline" className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4" />
                <span>Rate</span>
              </Button>
              {
                data.seasons.length ? (
                  <SeasonDialog seasons={data.seasons} id={data.id} title={data.title} />
                ) : null
              }
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

function MyListButton({ user, content }: {
  user: NonNullable<ReturnType<typeof useUser>["user"]>,
  content: Detail
}) {
  const setFavorite = useMutation(api.favorite.setFavoriteList).withOptimisticUpdate(
    (localStore, args) => {
      const { userId, contentId } = args;
      localStore.setQuery(api.favorite.checkContentIsUserFavorite, { userId, contentId }, "optimistic id" as Id<"favorite">);
    },
  );
  const cancelFavorite = useMutation(api.favorite.cancelFavorite).withOptimisticUpdate(
    (localStore) => {
      localStore.setQuery(api.favorite.checkContentIsUserFavorite, { userId: user.id, contentId: content.id }, "" as Id<"favorite">);
    },
  )
  const existingFavoriteId = useQuery(api.favorite.checkContentIsUserFavorite, {
    userId: user.id,
    contentId: content.id
  })
  const [_, formAction, isPending] = useActionState(() => {
    // TODO adopt debounce machine
    if (existingFavoriteId) {
      cancelFavorite({ id: existingFavoriteId })
      return
    }
    setFavorite({
      userId: user.id,
      contentId: content.id,
      name: content.title,
      imgPath: content.posterPath
    })
  }, null)
  return <form action={formAction}><Button variant="outline" className="flex items-center space-x-2">
    {
      existingFavoriteId === undefined || isPending ? <Loader2 className="w-4 h-4 animate-spin" />
        : existingFavoriteId ? <Minus className="w-4 h-4" />
          : <Plus className="w-4 h-4" />
    }
    <span>My List</span>
  </Button>
  </form>
}