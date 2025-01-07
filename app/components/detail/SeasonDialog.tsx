import { Season } from "@/components/detail/Season";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DeepReadonly } from "@/lib/type";
import { Route, seasonDetailQueryOption } from "@/routes/detail/$type/$id";
import type { SeasonType } from "@/schema/base";
import { Info } from "lucide-react";
import { Suspense } from "react";
interface ISeasonDialog {
  seasons: DeepReadonly<Array<SeasonType>>
  id: number,
  title: string
}
export function SeasonDialog({ seasons, id, title }: ISeasonDialog) {
  const { queryClient } = Route.useRouteContext()
  return <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="flex items-center space-x-2" ref={(node) => {
        if (node) {
          const abortController = new AbortController()
          node.addEventListener("mouseenter", () => {
            for (let i = 0; i < seasons.length; i++) {
              const season = seasons[i]
              if (!season) {
                return
              }
              const { seasonNumber } = season
              queryClient.prefetchQuery(seasonDetailQueryOption(id, seasonNumber))
            }
          }, {
            signal: abortController.signal
          })
          return () => {
            abortController.abort()
          }
        }
      }}>
        <Info className="w-4 h-4" />
        <span>Seasons</span>
      </Button>
    </DialogTrigger>
    <DialogContent className="w-11/12 max-w-4xl text-white bg-zinc-900">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Seasons</DialogTitle>
        <DialogDescription className="text-gray-400">
          Information about all seasons of {title}
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[70vh] pr-4">
        {seasons.map((season) => (
          <Suspense key={`season_${season.id}`}>
            <Season seriesId={id} season={season} />
          </Suspense>
        ))}
      </ScrollArea>
    </DialogContent>
  </Dialog>
}