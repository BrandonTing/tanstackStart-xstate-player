import { Schema } from "effect";
import { BaseContentSchema, BaseDetailSchema, imgSchema } from "./base";

export const MovieSchema = Schema.transform(
	Schema.Struct({
		id: Schema.Number,
		title: Schema.String,
		overview: Schema.String,
		poster_path: imgSchema,
		release_date: Schema.String,
	}),
	BaseContentSchema,
	{
    strict: false,
		encode: (to) => {
			return {
				id: to.id,
				title: to.title,
				overview: to.overview,
				poster_path: to.posterPath ?? "",
				release_date: to.releaseDate,
			};
		},
		decode: (from) => {
			return {
				id: from.id,
				title: from.title,
				overview: from.overview,
				posterPath: from.poster_path,
				releaseDate: from.release_date,
				type: "movies",
			};
		},
	},
);
export class MovieList extends Schema.Class<MovieList>("MovieList")({
	results: Schema.Array(MovieSchema),
}) {}

export const decodeMovieList = Schema.decodeUnknown(MovieList);

export const MovieDetailSchema = Schema.transform(
	Schema.Struct({
		id: Schema.Number,
		title: Schema.String,
		overview: Schema.String,
		poster_path: imgSchema,
		release_date: Schema.String,
		genres: Schema.Array(
			Schema.Struct({
				id: Schema.Number,
				name: Schema.String,
			}),
		),
		vote_average: Schema.Number,
	}),
	BaseDetailSchema,
	{
		encode: (to) => {
			return {
				id: to.id,
				title: to.title,
				overview: to.overview,
				poster_path: to.posterPath ?? "",
				release_date: to.releaseDate,
				vote_average: to.voteScore,
				genres: to.categories,
			};
		},
		decode: (from) => {
			return {
				id: from.id,
				title: from.title,
				overview: from.overview,
				posterPath: from.poster_path,
				releaseDate: from.release_date,
				seasons: [],
				categories: from.genres,
				voteScore: from.vote_average,
			};
		},
	},
);

export const decodeMovieDetail = Schema.decodeUnknown(MovieDetailSchema);
