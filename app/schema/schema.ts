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

const TVSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  overview: Schema.String,
  poster_path: posterSchema
})

const MovieSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  overview: Schema.String,
  poster_path: posterSchema
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
          encode: ({title, ...to}) => {
            return {
              ...to,
              name: title,
            }
          },
          decode: ({name, ...from}) => {
            return {
              ...from,
              title: name,
            }
          }
        }
      ),
      MovieSchema      
    )
),
}) { }

export const decodeTrend = Schema.decodeUnknown(Trend)