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

const BaseContentSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  overview: Schema.String,
  posterPath: posterSchema,
  releaseDate: Schema.String
})

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

export const MovieSchema = Schema.transform(Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  overview: Schema.String,
  poster_path: posterSchema,
  release_date: Schema.String
}), BaseContentSchema, {
  encode: (to) => {
    return {
      id: to.id,
      title: to.title,
      overview: to.overview,
      poster_path: to.posterPath,
      release_date: to.releaseDate
    }
  },
  decode: (from) => {
    return {
      id: from.id,
      title: from.title,
      overview: from.overview,
      posterPath: from.poster_path,
      releaseDate: from.release_date
    }
  }
})
