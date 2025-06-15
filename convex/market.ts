import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveAnalysis = mutation({
  args: {
    city: v.string(),
    area: v.string(),
    propertyType: v.string(),
    averagePrice: v.number(),
    priceChange: v.number(),
    totalListings: v.number(),
    aiInsights: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("marketAnalysis", {
      ...args,
      analysisDate: Date.now()
    });
  },
});

export const getAnalysis = query({
  args: { 
    city: v.string(),
    propertyType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("marketAnalysis")
      .withIndex("by_city", q => q.eq("city", args.city));

    const analyses = await query.collect();
    
    // Filter by property type if specified
    const filtered = args.propertyType 
      ? analyses.filter(a => a.propertyType === args.propertyType)
      : analyses;

    // Return the most recent analysis
    return filtered.sort((a, b) => b.analysisDate - a.analysisDate)[0] || null;
  },
});
