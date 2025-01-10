import Favorite from '@/components/favorite/favorite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ContentType } from '@/schema/base'
import { useUser } from '@clerk/tanstack-start'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/userInfo')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): {
    type: ContentType
  } => {
    return {
      type: search.type as ContentType ?? "movies"
    }
  }
})

function RouteComponent() {
  const { user } = useUser()
  const { type } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  if (!user) {
    return null
  }
  return <>
    <h1 className="mb-8 text-4xl font-bold">My List</h1>
    <Tabs defaultValue={type} className="w-full" onValueChange={(value) => {
      navigate({
        search: () => {
          return {
            type: value as ContentType
          }
        },
      })
    }}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="movies">Movies</TabsTrigger>
        <TabsTrigger value="tvShows">TV Shows</TabsTrigger>
      </TabsList>
      <TabsContent value="movies">
        <Favorite userId={user.id} type="movies" />
      </TabsContent>
      <TabsContent value="tvShows">
        <Favorite userId={user.id} type="tvShows" />
      </TabsContent>
    </Tabs>
  </>
}
