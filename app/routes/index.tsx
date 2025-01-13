import { FeaturedMovie } from "@/components/FeaturedMovie";
import { HomeContentRow } from "@/components/HomeContentRow";
import { ResourceApi, resourceRuntime } from "@/services/resourceApi";
import { resourceErrorHandling } from "@/services/util";
import { queryOptions, useQuery } from "@tanstack/react-query";
// app/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect, Match } from "effect";

const getTrendingContent = createServerFn({
  method: "GET",
}).handler(() => {
  return resourceRuntime.runPromise(
    Effect.gen(function* () {
      const resourceApi = yield* ResourceApi;
      const { trendingMovies, trendingTvShows } =
        yield* resourceApi.getTrending;
      return {
        tvShows: trendingTvShows,
        movies: trendingMovies,
      };
    }).pipe(resourceErrorHandling),
  );
});

export function trendingQueryOptions() {
  return queryOptions({
    queryKey: ["trending"],
    queryFn: async () => await getTrendingContent(),
    staleTime: Number.POSITIVE_INFINITY,
  })
};

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(trendingQueryOptions())
  },
});

function Home() {
  const { data, isFetching } = useQuery(trendingQueryOptions());
  return matcher({ data, isFetching })
}

const matcher = Match.type<{
  isFetching: boolean,
  data: Awaited<ReturnType<typeof getTrendingContent>> | undefined
}>().pipe(
  Match.when({
    isFetching: true
  }, () => <p className="pt-20 text-center">Loading...</p>),
  Match.not({ data: Match.defined }, () => {
    return <p className="pt-20 text-center">Failed to fetch trending info</p>
  }),
  Match.orElse(({ data }) => {
    const { movies, tvShows } = data;
    const featuredMovie = movies.results[0];

    return (
      <>
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
      </>
    );
  })
)