import { Effect, Layer, ManagedRuntime } from "effect";
import { decodeTrend } from "../schema/schema";
import { GetResourceEndpoint } from "./buildResourceEndpoint";
import { GetResource } from "./getResource";

const make = {
  getPopular: Effect.gen(function* () {
    const getResource = yield* GetResource
    const getResourceProgram = getResource("https://api.themoviedb.org/3/movie/popular")
    const json = yield* getResourceProgram
    return yield* decodeTrend(json);
  }).pipe(Effect.provide(Layer.mergeAll(GetResource.Live, GetResourceEndpoint.Live))),
}

export class ResourceApi extends Effect.Service<ResourceApi>()(
  "ResourceApi",
  {
    succeed: make,
  }
) { }

export const resourceRuntime = ManagedRuntime.make(ResourceApi.Default)
