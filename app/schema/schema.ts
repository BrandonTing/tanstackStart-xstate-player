import { Schema } from "effect";

/** Schema **/
export class Trend extends Schema.Class<Trend>("Trend")({
  page: Schema.Number,
  results: Schema.Array(
    Schema.Struct({
      id: Schema.Number,
      title: Schema.String
    })
),
}) { }

export const decodeTrend = Schema.decodeUnknown(Trend)