import { Schema } from "effect";

export const imgSchema = Schema.transform(
	Schema.NullOr(Schema.String),
	Schema.String,
	{
		strict: true,
		encode: (to) => {
			return to.split("original")[1] ?? "";
		},
		decode: (from) => {
			return from ? `https://image.tmdb.org/t/p/original${from}` : "";
		},
	},
);

export const contentTypeSchema = Schema.Literal("movies", "tvShows");
export type ContentType = typeof contentTypeSchema.Type;

export const BaseContentSchema = Schema.Struct({
	id: Schema.Number,
	title: Schema.String,
	overview: Schema.String,
	posterPath: imgSchema,
	releaseDate: Schema.String,
	type: contentTypeSchema,
});
const seasonSchema = Schema.Struct({
	id: Schema.Number,
	title: Schema.String,
	overview: Schema.String,
	releaseDate: Schema.String,
	voteScore: Schema.Number,
	seasonNumber: Schema.Number,
	isUpcoming: Schema.Boolean,
});
export type SeasonType = typeof seasonSchema.Type;
export const BaseDetailSchema = Schema.Struct({
	id: Schema.Number,
	title: Schema.String,
	overview: Schema.String,
	posterPath: imgSchema,
	releaseDate: Schema.String,
	categories: Schema.Array(
		Schema.Struct({
			id: Schema.Number,
			name: Schema.String,
		}),
	),
	voteScore: Schema.Number,
	seasons: Schema.Array(seasonSchema),
});
export type Detail = typeof BaseDetailSchema.Type;
const BaseCreditSchema = Schema.transform(
	Schema.Struct({
		id: Schema.Number,
		name: Schema.String,
		profile_path: Schema.NullOr(imgSchema),
	}),
	Schema.Struct({
		id: Schema.Number,
		name: Schema.String,
		profilePath: Schema.NullOr(imgSchema),
	}),
	{
		encode: (to) => {
			return {
				id: to.id,
				name: to.name,
				profile_path: to.profilePath,
			};
		},
		decode: (from) => {
			return {
				id: from.id,
				name: from.name,
				profilePath: from.profile_path,
			};
		},
	},
);

export const decodeCreditList = Schema.decodeUnknown(
	Schema.Struct({
		cast: Schema.Array(BaseCreditSchema),
	}),
);

export type Credit = typeof BaseCreditSchema.Type;
