import { Effect, Layer, ManagedRuntime } from "effect";
import type { ContentType } from "../routes/_main/";
import { decodeTrend } from "../schema/schema";
import { GetResourceEndpoint } from "./buildResourceEndpoint";
import { GetResource } from "./getResource";

const GetResourceLayer = Layer.mergeAll(GetResource.Live, GetResourceEndpoint.Live)

const make = {
  getPopular: Effect.gen(function* () {
    const getResource = yield* GetResource
    const getResourceProgram = getResource("popular")
    const json = yield* getResourceProgram
    return yield* decodeTrend(json);
  }).pipe(Effect.provide(GetResourceLayer)),
  getTrending: (contentType: ContentType) => Effect.gen(function* () {
    const getResource = yield* GetResource
    const getResourceProgram = getResource(`trending/${contentType}/day?language=en-US`)
    const json = yield* getResourceProgram
    return yield* decodeTrend(json);
  }).pipe(Effect.provide(GetResourceLayer)),
}

export class ResourceApi extends Effect.Service<ResourceApi>()(
  "ResourceApi",
  {
    succeed: make,
  }
) { }

export const resourceRuntime = ManagedRuntime.make(ResourceApi.Default)
