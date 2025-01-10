import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	favorite: defineTable({
		contentId: v.number(),
		userId: v.string(),
		imgPath: v.string(),
		name: v.string(),
		type: v.union(v.literal("movies"), v.literal("tvShows")),
	}),
	rating: defineTable({
		contentId: v.number(),
		userId: v.string(),
		rating: v.number(),
	}),
});
