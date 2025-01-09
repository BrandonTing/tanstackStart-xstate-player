import type { Content, ContentType } from "@/schema/base";
import { decodeMovieList } from "@/schema/movies";
import { decodeTVShowsList } from "@/schema/tvShows";
import { Effect, ManagedRuntime, Match } from "effect";
import { GetResource, GetResourceLayer } from "./getResource";
import { resourceErrorHandlingWithDefault } from "./util";

const makeSearchApi = {
	getMovieResult: (keyword: string) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const movies = yield* getResource(
				`search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`,
			);
			const result = yield* decodeMovieList(movies);
			return result.results;
		}).pipe(Effect.provide(GetResourceLayer));
	},
	getTVShowsResult: (keyword: string) => {
		return Effect.gen(function* () {
			const getResource = yield* GetResource;
			const tvShows = yield* getResource(
				`search/tv?query=${keyword}&include_adult=false&language=en-US&page=1`,
			);
			const result = yield* decodeTVShowsList(tvShows);
			return result.results;
		}).pipe(Effect.provide(GetResourceLayer));
	},
};

export class SearchApi extends Effect.Service<SearchApi>()("SearchApi", {
	succeed: makeSearchApi,
}) {}

export const searchApiRuntime = ManagedRuntime.make(SearchApi.Default);

export const getSearchResult = (keyword: string, type: ContentType) => {
	return Effect.gen(function* () {
		const searchApi = yield* SearchApi;
		const results = yield* Match.value(type).pipe(
			Match.when("movies", () => searchApi.getMovieResult(keyword)),
			Match.when("tvShows", () => searchApi.getTVShowsResult(keyword)),
			Match.exhaustive,
		);
		return results;
	}).pipe(resourceErrorHandlingWithDefault([] as Array<Content>));
};
