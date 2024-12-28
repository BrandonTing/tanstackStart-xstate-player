import { Schema } from "effect"
import { MovieSchema } from "./base"

export class MovieList extends Schema.Class<MovieList>("MovieList")({
  results: Schema.Array(MovieSchema),
}) { }

export const decodeMovieList = Schema.decodeUnknown(MovieList)