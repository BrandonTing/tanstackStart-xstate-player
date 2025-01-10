import { v } from "convex/values";
import { Effect } from "effect";
import { mutation, query } from "./_generated/server";
import { ConvexError, convexErrorHandling } from "./error";

export const setFavoriteList = mutation({
	args: {
		contentId: v.number(),
		userId: v.string(),
		imgPath: v.string(),
		name: v.string(),
		type: v.union(v.literal("movies"), v.literal("tvShows")),
	},
	handler: async (ctx, { contentId, userId, imgPath, name, type }) => {
		return Effect.gen(function* () {
			const createTime = new Date().toISOString();
			const data = yield* Effect.tryPromise({
				try: () =>
					ctx.db.insert("favorite", {
						contentId,
						userId,
						imgPath,
						name,
						type,
					}),
				catch: () => new ConvexError(),
			});
			return data;
		}).pipe(convexErrorHandling, Effect.runPromise);
	},
});

export const checkContentIsUserFavorite = query({
	args: {
		contentId: v.number(),
		userId: v.string(),
	},
	handler: async (ctx, { contentId, userId }) => {
		return Effect.gen(function* () {
			const data = yield* Effect.tryPromise({
				try: () =>
					ctx.db
						.query("favorite")
						.filter(({ and, eq, field }) => {
							return and(
								eq(field("userId"), userId),
								eq(field("contentId"), contentId),
							);
						})
						.unique(),
				catch: () => new ConvexError(),
			});
			return data?._id;
		}).pipe(convexErrorHandling, Effect.runPromise);
	},
});

export const cancelFavorite = mutation({
	args: {
		id: v.id("favorite"),
	},
	handler: async (ctx, { id }) => {
		return Effect.gen(function* () {
			const data = yield* Effect.tryPromise({
				try: () => ctx.db.delete(id),
				catch: () => new ConvexError(),
			});
			return data;
		}).pipe(convexErrorHandling, Effect.runPromise);
	},
});

export const getFavoriteListByType = query({
	args: {
		userId: v.string(),
		type: v.union(v.literal("movies"), v.literal("tvShows")),
	},
	handler: async (ctx, { userId, type }) => {
		return Effect.gen(function* () {
			const data = yield* Effect.tryPromise({
				try: () =>
					ctx.db
						.query("favorite")
						.filter(({ and, eq, field }) => {
							return and(eq(field("userId"), userId), eq(field("type"), type));
						})
						.collect(),
				catch: () => new ConvexError(),
			});
			return data;
		}).pipe(convexErrorHandling, Effect.runPromise);
	},
});
