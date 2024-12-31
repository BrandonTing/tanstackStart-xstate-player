import { Schema } from "effect"
import { TVSchema } from "./tvShows"
import { MovieSchema } from "./movies"

/** Schema **/
export class Trend extends Schema.Class<Trend>("Trend")({
  page: Schema.Number,
  results: Schema.Array(
    Schema.Union(
      TVSchema,
      MovieSchema      
    )
),
}) { }

export const decodeTrend = Schema.decodeUnknown(Trend)