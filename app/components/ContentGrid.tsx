import type { DeepReadonly } from "@/lib/type";
import type { ContentType } from "@/schema/base";
import { Link } from "@tanstack/react-router";
import { Match } from "effect";

interface Content {
  id: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  type: ContentType;
}

interface ContentGridProps {
  title: string;
  contents: DeepReadonly<Content[]>;
  limit?: number;
}

export function ContentGrid({ title, contents }: ContentGridProps) {
  return Match.value(contents).pipe(
    Match.when((matchesContents) => matchesContents.length === 0, (matchesContents) => null),
    Match.orElse((matchesContents) => {
      return <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold ">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {matchesContents.map((content) => (
            <Link
              viewTransition
              key={content.id}
              to={`/detail/${content.type}/${content.id}`}
              className="group"
              preload="intent"
            >
              {
                content.posterPath ? <div className="relative aspect-[2/3] overflow-hidden rounded-md">
                  <img
                    src={content.posterPath}
                    alt={content.title}
                    className="transition-transform duration-200 group-hover:scale-105"
                  />
                </div> : null
              }
              <h3 className="mt-2 text-sm font-medium transition-colors group-hover:text-gray-300">
                {content.title}
              </h3>
              <p className="text-xs text-gray-400">{content.releaseDate}</p>
            </Link>
          ))}
        </div>
      </div>
    })
  )
}
