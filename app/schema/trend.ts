import { Schema } from "effect"
import { MovieSchema, TVSchema } from "./base"

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