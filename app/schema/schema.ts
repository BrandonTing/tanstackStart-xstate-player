import { Schema } from "effect";

const TVSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})

const MovieSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String
})

/** Schema **/
export class Trend extends Schema.Class<Trend>("Trend")({
  page: Schema.Number,
  results: Schema.Array(
    Schema.Union(
      Schema.transform(
        TVSchema,
        MovieSchema,
        {
          strict: true,
          encode: (to) => {
            return {
              id: to.id,
              name: to.title
            }
          },
          decode: (from) => {
            return {
              id: from.id,
              title: from.name
            }
          }
        }
      ),
      MovieSchema      
    )
),
}) { }

export const decodeTrend = Schema.decodeUnknown(Trend)