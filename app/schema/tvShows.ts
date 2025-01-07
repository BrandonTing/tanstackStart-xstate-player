import { Schema } from "effect";
import { BaseContentSchema, BaseDetailSchema, imgSchema } from "./base";

export const TVSchema = Schema.transform(
	Schema.Struct({
		id: Schema.Number,
		name: Schema.String,
		overview: Schema.String,
		poster_path: imgSchema,
		first_air_date: Schema.String,
	}),
	BaseContentSchema,
	{
		strict: false,
		encode: (to) => {
			return {
				id: to.id,
				name: to.title,
				overview: to.overview,
				poster_path: to.posterPath ?? "",
				first_air_date: to.releaseDate,
			};
		},
		decode: (from) => {
			return {
				id: from.id,
				title: from.name,
				overview: from.overview,
				posterPath: from.poster_path,
				releaseDate: from.first_air_date,
				type: "tvShows",
			};
		},
	},
);

export class TVShowsList extends Schema.Class<TVShowsList>("TVShowsList")({
	results: Schema.Array(TVSchema),
}) {}

export const decodeTVShowsList = Schema.decodeUnknown(TVShowsList);

export const TVShowDetailSchema = Schema.transform(
	Schema.Struct({
		id: Schema.Number,
		name: Schema.String,
		overview: Schema.String,
		poster_path: imgSchema,
		first_air_date: Schema.String,
		genres: Schema.Array(
			Schema.Struct({
				id: Schema.Number,
				name: Schema.String,
			}),
		),
		vote_average: Schema.Number,
		seasons: Schema.Array(
			Schema.Struct({
				id: Schema.Number,
				name: Schema.String,
				overview: Schema.String,
				air_date: Schema.NullOr(Schema.String),
				vote_average: Schema.Number,
				season_number: Schema.Number,
			}),
		),
	}),
	BaseDetailSchema,
	{
		strict: false,
		encode: (to) => {
			return {
				id: to.id,
				name: to.title,
				overview: to.overview,
				poster_path: to.posterPath ?? "",
				first_air_date: to.releaseDate,
				vote_average: to.voteScore,
				seasons: to.seasons.map((season) => {
					return {
						id: season.id,
						name: season.title,
						overview: season.overview,
						air_date: season.releaseDate,
						vote_average: season.voteScore,
						season_number: season.seasonNumber,
					};
				}),
				genres: to.categories,
			};
		},
		decode: (from) => {
			return {
				id: from.id,
				title: from.name,
				overview: from.overview,
				posterPath: from.poster_path,
				releaseDate: from.first_air_date,
				seasons: from.seasons.map((season) => {
					return {
						id: season.id,
						title: season.name,
						overview: season.overview,
						releaseDate: season.air_date ?? "TBD",
						voteScore: season.vote_average,
						seasonNumber: season.season_number,
						isUpcoming:
							!season.air_date ||
							new Date(season.air_date).getTime() > Date.now(),
					};
				}),
				categories: from.genres,
				voteScore: from.vote_average,
			};
		},
	},
);

export const decodeTVShowsDetail = Schema.decodeUnknown(TVShowDetailSchema);

const seasonDetailSchema = Schema.transform(
	Schema.Struct({
		episodes: Schema.Array(
			Schema.Struct({
				air_date: Schema.String,
				episode_number: Schema.Number,
				id: Schema.Number,
				name: Schema.String,
				overview: Schema.String,
				still_path: imgSchema,
			}),
		),
	}),
	Schema.Array(
		Schema.Struct({
			airDate: Schema.String,
			episodeNumber: Schema.Number,
			id: Schema.Number,
			name: Schema.String,
			overview: Schema.String,
			posterPath: imgSchema,
		}),
	),
	{
		strict: false,
		encode: (to) => {
			return {
				episodes: to.map(({ id, name, overview, ...toEpisode }) => {
					return {
						air_date: toEpisode.airDate,
						episode_number: toEpisode.episodeNumber,
						still_path: toEpisode.posterPath,
						id,
						name,
						overview,
					};
				}),
			};
		},
		decode: (from) => {
			return from.episodes.map(({ name, overview, id, ...fromEpisode }) => {
				return {
					name,
					overview,
					id,
					airDate: fromEpisode.air_date,
					episodeNumber: fromEpisode.episode_number,
					posterPath: fromEpisode.still_path,
				};
			});
		},
	},
);

export const decodeSeasonDetail = Schema.decodeUnknown(seasonDetailSchema);
