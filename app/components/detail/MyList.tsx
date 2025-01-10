import { Button } from "@/components/ui/button";
import type { Detail } from "@/schema/base";
import type { useUser } from "@clerk/tanstack-start";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ConvexError, convexErrorHandling } from "convex/error";
import { useMutation, useQuery } from "convex/react";
import { Console, Effect, Match } from "effect";
import { Loader2, Minus, Plus } from "lucide-react";
import { useActionState } from "react";

export function MyListButton({
  user,
  content,
}: {
  user: NonNullable<ReturnType<typeof useUser>["user"]>;
  content: Detail;
}) {
  const setFavorite = useMutation(
    api.favorite.setFavoriteList,
  ).withOptimisticUpdate((localStore, args) => {
    const { userId, contentId } = args;
    localStore.setQuery(
      api.favorite.checkContentIsUserFavorite,
      { userId, contentId },
      "optimistic id" as Id<"favorite">,
    );
  });
  const cancelFavorite = useMutation(
    api.favorite.cancelFavorite,
  ).withOptimisticUpdate((localStore) => {
    localStore.setQuery(
      api.favorite.checkContentIsUserFavorite,
      { userId: user.id, contentId: content.id },
      null,
    );
  });
  const existingFavoriteId = useQuery(api.favorite.checkContentIsUserFavorite, {
    userId: user.id,
    contentId: content.id,
  });
  const [_, formAction, isPending] = useActionState(async () => {
    await Effect.gen(function* () {
      const match = Match.type<typeof existingFavoriteId>().pipe(
        Match.when(Match.string, (id) => {
          return Effect.tryPromise({
            try: () => cancelFavorite({ id }),
            catch: () => new ConvexError(),
          });
        }),
        Match.when(Match.null, () => {
          return Effect.tryPromise({
            try: () =>
              setFavorite({
                userId: user.id,
                contentId: content.id,
                name: content.title,
                imgPath: content.posterPath,
              }),
            catch: () => new ConvexError(),
          });
        }),
        Match.when(Match.undefined, () => {
          // existingFavoriteId is still loading
          Effect.runSync(
            Console.warn(
              "User should not be able to submit form before existingFavoriteId is loaded",
            ),
          );
          return new ConvexError();
        }),
        Match.exhaustive,
      );
      yield* match(existingFavoriteId);
    }).pipe(convexErrorHandling, Effect.runPromise);
  }, null);
  return (
    <form action={formAction}>
      <Button
        variant="outline"
        type="submit"
        disabled={isPending}
        className="flex items-center space-x-2"
      >
        {Match.value(existingFavoriteId).pipe(
          Match.whenOr(
            Match.undefined,
            () => isPending,
            () => <Loader2 className="w-4 h-4 animate-spin" />,
          ),
          Match.when(Match.nonEmptyString, () => <Minus className="w-4 h-4" />),
          Match.orElse(() => <Plus className="w-4 h-4" />),
        )}
        <span>My List</span>
      </Button>
    </form>
  );
}
