import { Schema } from "effect"
import { TVSchema } from "./base"

export class TVShowsList extends Schema.Class<TVShowsList>("TVShowsList")({
  results: Schema.Array(TVSchema),
}) { }

export const decodeTVShowsList = Schema.decodeUnknown(TVShowsList)