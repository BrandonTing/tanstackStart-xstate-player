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
      <h3 className="flex items-center mb-4 text-xl font-semibold">
        Season {season.seasonNumber}
        {season.isUpcoming && (
          <span className="px-2 py-1 ml-2 text-xs font-bold text-black bg-yellow-500 rounded-full">
            Upcoming: {season.releaseDate}
          </span>
        )}
      </h3>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data?.map((episode) => (
          <li key={episode.id} className="flex overflow-hidden rounded-lg bg-zinc-800">
            <img
              src={episode.posterPath}
              alt={`${episode.name} poster`}
              className="object-cover w-[150px] h-[150px]"
            />
            <div className="flex flex-col justify-between flex-grow px-4 py-2">
              <div>
                <h4 className="text-lg font-medium">Episode {episode.episodeNumber}: {episode.name}</h4>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{episode.overview || 'No overview available.'}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500">Air Date: {new Date(episode.airDate).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}