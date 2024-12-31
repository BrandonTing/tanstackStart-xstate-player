import type { FetchError, JsonError } from "@/errors/error";
import {
  type TVShowsList,
  decodeTVShowsDetail,
  decodeTVShowsList
} from "@/schema/tvShows";
import { Console, Effect, ManagedRuntime, Schema } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type { ParseError } from "effect/ParseResult";
import { GetResource, GetResourceLayer } from "./getResource";

const keySchema = Schema.Literal(
	"getAiringToday",
	"getOnTheAir",
	"getPopular",
	"getTopRated",
);
export const decodeTVShowsApiKey = Schema.decode(keySchema);
export type TVShowsApiKeyType = typeof keySchema.Type;
const make = {
	getAiringToday: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const tvShows = yield* getResource("tv/airing_today?language=en-US&page=1");
		return yield* decodeTVShowsList(tvShows);
	}).pipe(Effect.provide(GetResourceLayer)),
	getOnTheAir: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const tvShows = yield* getResource("tv/on_the_air?language=en-US&page=1");
		return yield* decodeTVShowsList(tvShows);
	}).pipe(Effect.provide(GetResourceLayer)),
	getPopular: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const tvShows = yield* getResource("tv/popular?language=en-US&page=1");
		return yield* decodeTVShowsList(tvShows);
	}).pipe(Effect.provide(GetResourceLayer)),
	getTopRated: Effect.gen(function* () {
		const getResource = yield* GetResource;
		const tvShows = yield* getResource("tv/top_rated?language=en-US&page=1");
		return yield* decodeTVShowsList(tvShows);
	}).pipe(Effect.provide(GetResourceLayer)),
} satisfies Record<
	TVShowsApiKeyType,
	Effect.Effect<
		TVShowsList,
		ParseError | FetchError | JsonError | ConfigError,
		never
	>
>;
export class TVShowsApi extends Effect.Service<TVShowsApi>()("TVShowsApi", {
	succeed: make,
}) {}

export const tvShowsApiRuntime = ManagedRuntime.make(TVShowsApi.Default);

const makeTVShowsByIdApi = {
  getTVSeriesDetail: (id:number) => {
    return Effect.gen(function* () {
      const getResource = yield* GetResource;
      const tvShows = yield* getResource(`tv/${id}?language=en-US&page=1`);
      return yield* decodeTVShowsDetail(tvShows);
    }).pipe(Effect.provide(GetResourceLayer))
  }
}

export class TVShowsByIdApi extends Effect.Service<TVShowsByIdApi>()(
	"TVShowsByIdApi",
	{
		succeed: makeTVShowsByIdApi,
	},
) {}

export const tvShowsByidApiRuntime = ManagedRuntime.make(
	TVShowsByIdApi.Default,
);

export const getTVSeriesDetailProgram = (id: number) => {
  return Effect.gen(function* () {
    const tvShowsByIdApi = yield* TVShowsByIdApi;
    const detail = yield* tvShowsByIdApi.getTVSeriesDetail(id)
    return detail;
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
