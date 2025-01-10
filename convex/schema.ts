import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	favorite: defineTable({
		contentId: v.number(),
		userId: v.string(),
		imgPath: v.string(),
		name: v.string(),
	}),
	rating: defineTable({
		contentId: v.number(),
		userId: v.string(),
		rating: v.number(),
	}),
});
