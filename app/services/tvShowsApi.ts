import type { FetchError, JsonError } from "@/errors/error";
import { decodeCreditList } from "@/schema/base";
import {
	type TVShowsList,
	decodeSeasonDetail,
	decodeTVShowsDetail,
	decodeTVShowsList,
} from "@/schema/tvShows";
import { Chunk, Effect, ManagedRuntime, Schema, Sink, Stream } from "effect";
import type { ConfigError } from "effect/ConfigError";
import type { ParseError } from "effect/ParseResult";
import { GetResource, GetResourceLayer } from "./getResource";
import { commonErrorHandling } from "./util";

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
	getDetail: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const tvShows = yield* getResource(`tv/${id}?language=en-US&page=1`);
			return yield* decodeTVShowsDetail(tvShows);
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getCredits: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const tvShows = yield* getResource(
				`tv/${id}/credits?language=en-US&page=1`,
			);
			const { cast } = yield* decodeCreditList(tvShows);
			const stream = Stream.fromIterable(cast);
			const castsChunk = yield* stream.pipe(Stream.run(Sink.take(10)));
			return Chunk.toReadonlyArray(castsChunk);
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getRecommendations: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const tvShows = yield* getResource(
				`tv/${id}/recommendations?language=en-US&page=1`,
			);
			const { results } = yield* decodeTVShowsList(tvShows);
			const stream = Stream.fromIterable(results);
			const castsChunk = yield* stream.pipe(Stream.run(Sink.take(5)));
			return Chunk.toReadonlyArray(castsChunk);
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getSimilar: (id: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const tvShows = yield* getResource(
				`tv/${id}/similar?language=en-US&page=1`,
			);
			const { results } = yield* decodeTVShowsList(tvShows);
			const stream = Stream.fromIterable(results);
			const castsChunk = yield* stream.pipe(Stream.run(Sink.take(5)));
			return Chunk.toReadonlyArray(castsChunk);
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getSeasonDetail: (seriesId: number, seasonNumber: number) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const detail = yield* getResource(
				`tv/${seriesId}/season/${seasonNumber}?language=en-US`,
			);
			const seasons = yield* decodeSeasonDetail(detail);
			return seasons;
		}).pipe(Effect.provide(GetResourceLayer));
	},
};

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
		const detail = yield* tvShowsByIdApi.getDetail(id);
		return detail;
	}).pipe(commonErrorHandling);
};

export const getTVSeriesDeferredDataProgram = (id: number) => {
	return Effect.gen(function* () {
		const tvShowsByIdApi = yield* TVShowsByIdApi;
		const credits = yield* tvShowsByIdApi.getCredits(id);
		const recommendations = yield* tvShowsByIdApi.getRecommendations(id);
		const similar = yield* tvShowsByIdApi.getSimilar(id);
		return { credits, recommendations, similar };
	}).pipe(commonErrorHandling);
};

export const getTVSeasonDetailProgram = (
	seriesId: number,
	seasonNumber: number,
) => {
	return Effect.gen(function* () {
		const tvShowsByIdApi = yield* TVShowsByIdApi;
		const detail = yield* tvShowsByIdApi.getSeasonDetail(
			seriesId,
			seasonNumber,
		);
		return detail;
	}).pipe(commonErrorHandling);
};
