import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_property", q => q.eq("propertyId", args.propertyId))
      .collect();

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonymous User"
        };
      })
    );

    return reviewsWithUsers.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    rating: v.number(),
    comment: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to leave a review");
    }

    // Check if user already reviewed this property
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_property", q => q.eq("propertyId", args.propertyId))
      .filter(q => q.eq(q.field("userId"), userId))
      .unique();

    if (existing) {
      throw new Error("You have already reviewed this property");
    }

    return await ctx.db.insert("reviews", {
      ...args,
      userId,
      helpful: 0
    });
  },
});

export const getStats = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_property", q => q.eq("propertyId", args.propertyId))
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution: {
        1: ratingDistribution[1] || 0,
        2: ratingDistribution[2] || 0,
        3: ratingDistribution[3] || 0,
        4: ratingDistribution[4] || 0,
        5: ratingDistribution[5] || 0
      }
    };
  },
});
