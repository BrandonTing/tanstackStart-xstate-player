import { Schema } from "effect"
import { MovieSchema, TVSchema } from "./base"

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
          encode: ({title, release_date,...to}) => {
            return {
              ...to,
              name: title,
              first_air_date: release_date
            }
          },
          decode: ({name,first_air_date,...from}) => {
            return {
              ...from,
              title: name,
              release_date: first_air_date
            }
          }
        }
      ),
      MovieSchema      
    )
),
}) { }

export const decodeTrend = Schema.decodeUnknown(Trend)