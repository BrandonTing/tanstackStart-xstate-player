import { ResourceApi, resourceRuntime } from "@/services/resourceApi";
// app/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect, Schema } from "effect";
const contentTypeSchema = Schema.Literal("tv", "movie");
const mainRouteSearchParam = Schema.Struct({
	contentType: contentTypeSchema,
});

export type ContentType = typeof mainRouteSearchParam.Type.contentType;
const program = Effect.gen(function* () {
	const resourceApi = yield* ResourceApi;
	return yield* resourceApi.getPopular;
}).pipe(
	Effect.catchTags({
		FetchError: (e) => Effect.succeed(`Fetch error: ${e.message}`),
		JsonError: (e) => Effect.succeed(`Json error: ${e.message}`),
		ParseError: (e) => Effect.succeed(`Parse error: ${e.message}`),
	}),
);

const getTrendingContent = createServerFn({
	method: "GET",
})
	.validator((data: string) => {
		return Effect.runSync(Schema.decodeUnknown(contentTypeSchema)(data));
	})
	.handler((ctx) => {
		return resourceRuntime.runPromise(
			Effect.gen(function* () {
				const resourceApi = yield* ResourceApi;
				return yield* resourceApi.getTrending(ctx.data);
			}).pipe(
				Effect.catchTags({
					FetchError: (e) => Effect.succeed(`Fetch error: ${e.message}`),
					JsonError: (e) => Effect.succeed(`Json error: ${e.message}`),
					ParseError: (e) => Effect.succeed(`Parse error: ${e.message}`),
				}),
			),
		);
	});

export const Route = createFileRoute("/_main/")({
	component: Home,
	loaderDeps: ({ search: { contentType } }) => ({ contentType: contentType }),
	loader: async ({ deps: { contentType } }) =>
		await getTrendingContent({
			data: contentType,
		}),
	validateSearch: (
		search: Record<string, unknown>,
	): typeof mainRouteSearchParam.Type => {
		// validate and parse the search params into a typed state
		return Effect.runSync(Schema.decodeUnknown(mainRouteSearchParam)(search));
	},
});

function Home() {
	const state = Route.useLoaderData();
	if (typeof state === "string") {
		return <h1>{state}</h1>;
	}

	return <div className="pt-20 text-white">{state.results[0].title}</div>;
}
