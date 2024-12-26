import { Config, Effect } from "effect"

export const getBaseUrl = Effect.gen(function* () {
  const config = yield* Config.string("base_url").pipe(
    Config.validate({
      message: "Expected a string start with https:// and end with /",
      validation: (s) => s.startsWith("https://") && s.endsWith("/")
    })
  )
  return config
})
