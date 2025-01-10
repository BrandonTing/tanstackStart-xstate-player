import { v } from "convex/values";
import { Effect, Match } from "effect";
import { mutation, query } from "./_generated/server";
import { ConvexError, convexErrorHandling } from "./error";

export const setRating = mutation({
	args: {
		contentId: v.number(),
		userId: v.string(),
		rating: v.number(),
		id: v.optional(v.id("rating")),
	},
	handler: async (ctx, { contentId, userId, id, rating }) => {
		return Effect.gen(function* () {
			const data = yield* Effect.tryPromise({
				try: () =>
					Match.value(id).pipe(
						Match.when(Match.undefined, (id) => {
							return ctx.db.insert("rating", {
								contentId,
								userId,
								rating,
							});
						}),
						Match.orElse(async (id) => {
							await ctx.db.patch(id, {
								rating,
							});
							return id;
						}),
					),
				catch: () => new ConvexError(),
			});
			return data;
		}).pipe(convexErrorHandling, Effect.runPromise);
	},
});

export const getRating = query({
	args: {
		contentId: v.number(),
		userId: v.string(),
	},
	handler: async (ctx, { contentId, userId }) => {
		return Effect.gen(function* () {
			const data = yield* Effect.tryPromise({
				try: () =>
					ctx.db
						.query("rating")
						.filter(({ and, eq, field }) => {
							return and(
								eq(field("userId"), userId),
								eq(field("contentId"), contentId),
							);
						})
						.unique(),
				catch: () => new ConvexError(),
			});
			return data;
		}).pipe(convexErrorHandling, Effect.runPromise);
	},
});
