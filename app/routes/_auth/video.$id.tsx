import { PlayerBoundary } from '@/components/PlayerBoundary'
import { createFileRoute } from '@tanstack/react-router'
import { Effect, Schema } from 'effect'
// currently using demo video source, id is useless.
const mainRouteSearchParam = Schema.Struct({
  title: Schema.optional(Schema.String),
})

export const Route = createFileRoute('/_auth/video/$id')({
  component: RouteComponent,
  validateSearch: (record: unknown) =>
    Effect.runSync(Schema.decodeUnknown(mainRouteSearchParam)(record)),
})

function RouteComponent() {
  const { title } = Route.useSearch()
  return (
    <>
      <h1 className="mx-auto mt-20 text-4xl font-bold text-white max-w-7xl">
        {title}
      </h1>
      <PlayerBoundary />
    </>
  )
}
