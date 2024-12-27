import { Schema } from "effect";

const posterSchema = Schema.transform(Schema.String, Schema.String, {
  strict: true,
  encode: (to) => {
    return to.split("original")[1] ?? ""
  },
  decode: (from) => {
    return `https://image.tmdb.org/t/p/original${from}`
  }
})

export const TVSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  overview: Schema.String,
  poster_path: posterSchema,
  first_air_date: Schema.String
})

export const MovieSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  overview: Schema.String,
  poster_path: posterSchema,
  release_date: Schema.String
})
