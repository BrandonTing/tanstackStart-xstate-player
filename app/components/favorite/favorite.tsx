import type { ContentType } from "@/schema/base"
import { api } from "convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { X } from "lucide-react"
import { Button } from "../ui/button"

interface Props {
  type: ContentType,
  userId: string
}

export default function Favorite({ type, userId }: Props) {
  const list = useQuery(api.favorite.getFavoriteListByType, {
    userId,
    type
  })
  const cancelFavorite = useMutation(api.favorite.cancelFavorite).withOptimisticUpdate((localStore, args) => {
    const { id } = args;
    localStore.setQuery(api.favorite.getFavoriteListByType, { userId, type }, list?.filter(content => content._id !== id));
  },)
  if (!list) {
    return <p>Loading...</p>
  }
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    {list.map((content) => (
      <div key={content._id} className="relative overflow-hidden rounded-lg bg-zinc-800">
        <img src={content.imgPath} alt={content.name} className="w-full" />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{content.name}</h3>
          <p className="text-sm text-gray-400">Added: {new Date(content._creationTime).toISOString()}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute text-white top-2 right-2 hover:text-red-500"
          onClick={() => cancelFavorite({
            id: content._id
          })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ))}
  </div>

}