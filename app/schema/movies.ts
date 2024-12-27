import { Schema } from "effect"
import { MovieSchema } from "./base"

export class NowPlayingMovies extends Schema.Class<NowPlayingMovies>("NowPlayingMovies")({
  results: Schema.Array(MovieSchema),
}) { }

export const decodeNowPlayingMovies = Schema.decodeUnknown(NowPlayingMovies)