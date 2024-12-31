import { Schema } from "effect"
import { BaseContentSchema, BaseDetailSchema, posterSchema } from "./base"

export const TVSchema = Schema.transform(Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  overview: Schema.String,
  poster_path: posterSchema,
  first_air_date: Schema.String
}),BaseContentSchema, {
  encode: (to) => {
    return {
      id: to.id,
      name: to.title,
      overview: to.overview,
      poster_path: to.posterPath,
      first_air_date: to.releaseDate
    }
  },
  decode: (from) => {
    return {
      id: from.id,
      title: from.name,
      overview: from.overview,
      posterPath: from.poster_path,
      releaseDate: from.first_air_date
    }
  }
})

export class TVShowsList extends Schema.Class<TVShowsList>("TVShowsList")({
  results: Schema.Array(TVSchema),
}) { }

export const decodeTVShowsList = Schema.decodeUnknown(TVShowsList)

export const TVShowDetailSchema = Schema.transform(Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  overview: Schema.String,
  poster_path: posterSchema,
  first_air_date: Schema.String,
  genres: Schema.Array(Schema.Struct({
    id: Schema.Number,
    name: Schema.String
  })),
  vote_average: Schema.Number,
  seasons: Schema.Array(Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    overview: Schema.String,
    air_date: Schema.NullOr(Schema.String),
    vote_average: Schema.Number,
  }))
}),BaseDetailSchema, {
  encode: (to) => {
    return {
      id: to.id,
      name: to.title,
      overview: to.overview,
      poster_path: to.posterPath,
      first_air_date: to.releaseDate,
      vote_average: to.voteScore,
      seasons: to.seasons.map(season => {
        return {
          id: season.id,
          name: season.title,
          overview: season.overview,
          air_date: season.releaseDate,
          vote_average: season.voteScore,
        }
      }),
      genres: to.categories,
    }
  },
  decode: (from) => {
    return {
      id: from.id,
      title: from.name,
      overview: from.overview,
      posterPath: from.poster_path,
      releaseDate: from.first_air_date,
      seasons: from.seasons.map(season => {
        return {
          id: season.id,
          title: season.name,
          overview: season.overview,
          releaseDate: season.air_date ?? "TBD",
          voteScore: season.vote_average,
        }
      }),
      categories: from.genres,
      voteScore: from.vote_average
    }
  }
})

export const decodeTVShowsDetail = Schema.decodeUnknown(TVShowDetailSchema)