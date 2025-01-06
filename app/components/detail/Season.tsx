import { seasonDetailQueryOption } from "@/routes/detail/$type/$id";
import type { SeasonType } from "@/schema/base";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Season({ seriesId, season }: {
  seriesId: number,
  season: SeasonType,
}) {
  const { data } = useSuspenseQuery(seasonDetailQueryOption(seriesId, season.seasonNumber))
  return (
    <div key={`${season.id}`} className="mb-6">
      <h3 className="mb-2 text-xl font-semibold">Season {season.title}</h3>
      <ul className="space-y-2">
        {data?.map((episode) => (
          <li key={episode.id} className="pb-2 border-b border-gray-700">
            <h4 className="font-medium">Episode {episode.episodeNumber}: {episode.name}</h4>
            <p className="text-sm text-gray-400">{episode.overview}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}