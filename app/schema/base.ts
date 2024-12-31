import { Schema } from "effect";

export const posterSchema = Schema.transform(Schema.String, Schema.String, {
  strict: true,
  encode: (to) => {
    return to.split("original")[1] ?? ""
  },
  decode: (from) => {
    return `https://image.tmdb.org/t/p/original${from}`
  }
})

export const BaseContentSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  overview: Schema.String,
  posterPath: posterSchema,
  releaseDate: Schema.String
})

export const BaseDetailSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  overview: Schema.String,
  posterPath: posterSchema,
  releaseDate: Schema.String,
  categories: Schema.Array(Schema.Struct({
    id: Schema.Number,
    name: Schema.String
  })),
  voteScore: Schema.Number,
  seasons: Schema.Array(Schema.Struct({
    id: Schema.Number,
    title: Schema.String,
    overview: Schema.String,
    releaseDate: Schema.String,  
    voteScore: Schema.Number
  }))
})