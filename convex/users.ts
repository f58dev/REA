import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getPreferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .unique();
  },
});

export const updatePreferences = mutation({
  args: {
    preferredType: v.optional(v.union(v.literal("sale"), v.literal("rent"))),
    preferredPropertyTypes: v.array(v.string()),
    preferredCities: v.array(v.string()),
    priceRange: v.object({
      min: v.number(),
      max: v.number()
    }),
    preferredFeatures: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", q => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        searchHistory: existing.searchHistory || []
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        ...args,
        searchHistory: []
      });
    }
  },
});

export const addSearchHistory = mutation({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", q => q.eq("userId", userId))
      .unique();

    if (preferences) {
      const updatedHistory = [args.searchTerm, ...(preferences.searchHistory || [])].slice(0, 10);
      await ctx.db.patch(preferences._id, {
        searchHistory: updatedHistory
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        searchHistory: [args.searchTerm],
        preferredPropertyTypes: [],
        preferredCities: [],
        priceRange: { min: 0, max: 1000000 },
        preferredFeatures: []
      });
    }
  },
});
