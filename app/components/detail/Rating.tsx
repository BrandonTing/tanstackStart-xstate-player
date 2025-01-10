import { ratingMachine } from "@/machines/ratingMachine";
import { useMachine } from "@xstate/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Star } from "lucide-react";
import { useCallback } from "react";
import { fromPromise } from "xstate";
import { RatingDialog } from "./RatingDialog";
const userRating = 8.2

export function Rating({
  contentId,
  userId
}: {
  contentId: number,
  userId: string
}) {
  const userRating = useQuery(api.rating.getRating, {
    userId,
    contentId
  })
  const setRemoteRating = useMutation(api.rating.setRating).withOptimisticUpdate(
    (localStore, args) => {
      const { userId, contentId } = args;
      localStore.setQuery(api.rating.getRating, { userId, contentId, }, {
        userId, contentId,
        rating: args.rating,
        _creationTime: userRating?._creationTime ?? Date.now(),
        _id: userRating?._id ?? "optimistic id" as Id<"rating">
      });
    },
  )

  const [snapshot, send] = useMachine(ratingMachine.provide({
    actors: {
      "Setting Rating": fromPromise(async ({ input: { rating } }) => {
        await setRemoteRating({
          id: userRating?._id,
          rating,
          contentId,
          userId
        })
      })
    }
  }))
  const closeRatingDialog = useCallback(() => {
    send({ type: "Dialog.Cancel" })
  }, [send])
  const setTempRating = useCallback((rating: number) => {
    send({ type: "Rating.SetTemp", rating })
  }, [send])
  const setRating = useCallback(() => {
    send({ type: "Rating.Set" })
  }, [send])
  const userCurrentRating = userRating?.rating ?? 0
  return (
    <>
      <div className="flex items-center mb-4 cursor-pointer" onMouseDown={() => {
        send({ type: "Dialog.Show", initialRating: userCurrentRating })
      }}>
        <span className="mr-2 text-sm text-white">Your rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= userCurrentRating / 2 ? 'text-yellow-400' : 'text-gray-400'}`}
            fill={star <= userCurrentRating / 2 ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <RatingDialog isOpen={snapshot.matches("Dialog")} close={closeRatingDialog} setTempRating={setTempRating} rating={snapshot.context.tempRating} setRating={setRating} />
    </>
  )
}