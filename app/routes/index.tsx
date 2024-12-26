// app/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect } from "effect";
import { ResourceApi, resourceRuntime } from "../services/resourceApi";

const program = Effect.gen(function*( ){
  const resourceApi = yield* ResourceApi
  return yield* resourceApi.getPopular
}).pipe(
  Effect.catchTags({
    FetchError: (e) => Effect.succeed(`Fetch error: ${e.message}`),
    JsonError: (e) => Effect.succeed(`Json error: ${e.message}`),
    ParseError: (e) => Effect.succeed(`Parse error: ${e.message}`),
  })
);

const getPopularMovies = createServerFn({
	method: "GET",
}).handler(() => {
	return resourceRuntime.runPromise(program)
});

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => await getPopularMovies(),
});

function Home() {
	const state = Route.useLoaderData();
	return <div>
    {JSON.stringify(state, null, 2)}
  </div>
}
