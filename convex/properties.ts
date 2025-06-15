import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.union(v.literal("sale"), v.literal("rent"))),
    propertyType: v.optional(v.string()),
    city: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    featured: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("properties").withIndex("by_status", q => 
      q.eq("status", "approved")
    );

    const properties = await query.collect();
    
    // Filter properties based on args
    let filteredProperties = properties;
    
    if (args.type) {
      filteredProperties = filteredProperties.filter(p => p.type === args.type);
    }
    
    if (args.propertyType) {
      filteredProperties = filteredProperties.filter(p => p.propertyType === args.propertyType);
    }
    
    if (args.city) {
      filteredProperties = filteredProperties.filter(p => 
        p.location.city.toLowerCase().includes(args.city!.toLowerCase())
      );
    }
    
    if (args.minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= args.minPrice!);
    }
    
    if (args.maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= args.maxPrice!);
    }
    
    if (args.featured) {
      filteredProperties = filteredProperties.filter(p => p.featured);
    }

    // Get images URLs
    const propertiesWithImages = await Promise.all(
      filteredProperties.map(async (property) => ({
        ...property,
        imageUrls: await Promise.all(
          property.images.map(async (imageId) => await ctx.storage.getUrl(imageId))
        )
      }))
    );

    // Sort by featured first, then by creation time
    propertiesWithImages.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b._creationTime - a._creationTime;
    });

    return propertiesWithImages.slice(0, args.limit || 20);
  },
});

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id);
    if (!property) return null;

    // Get image URLs
    const imageUrls = await Promise.all(
      property.images.map(async (imageId) => await ctx.storage.getUrl(imageId))
    );

    // Get owner info
    const owner = await ctx.db.get(property.ownerId);

    return {
      ...property,
      imageUrls,
      owner: owner ? { name: owner.name, email: owner.email } : null
    };
  },
});

export const search = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("properties")
      .withSearchIndex("search_properties", q => 
        q.search("title", args.searchTerm).eq("status", "approved")
      )
      .take(args.limit || 10);

    const propertiesWithImages = await Promise.all(
      results.map(async (property) => ({
        ...property,
        imageUrls: await Promise.all(
          property.images.slice(0, 1).map(async (imageId) => await ctx.storage.getUrl(imageId))
        )
      }))
    );

    return propertiesWithImages;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.union(v.literal("sale"), v.literal("rent")),
    propertyType: v.union(
      v.literal("apartment"),
      v.literal("house"),
      v.literal("villa"),
      v.literal("office"),
      v.literal("land")
    ),
    location: v.object({
      city: v.string(),
      area: v.string(),
      address: v.string()
    }),
    features: v.object({
      bedrooms: v.number(),
      bathrooms: v.number(),
      area: v.number(),
      parking: v.boolean(),
      furnished: v.boolean(),
      balcony: v.boolean(),
      garden: v.boolean(),
      pool: v.boolean(),
      gym: v.boolean(),
      security: v.boolean()
    }),
    images: v.array(v.id("_storage")),
    contactInfo: v.object({
      phone: v.string(),
      email: v.string(),
      whatsapp: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create property");
    }

    return await ctx.db.insert("properties", {
      ...args,
      ownerId: userId,
      status: "pending",
      featured: false,
      views: 0
    });
  },
});

export const addToFavorites = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_property", q => 
        q.eq("userId", userId).eq("propertyId", args.propertyId)
      )
      .unique();

    if (existing) {
      // Remove from favorites
      await ctx.db.delete(existing._id);
      return { favorited: false };
    } else {
      // Add to favorites
      await ctx.db.insert("favorites", {
        userId,
        propertyId: args.propertyId
      });
      return { favorited: true };
    }
  },
});

export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const properties = await Promise.all(
      favorites.map(async (fav) => {
        const property = await ctx.db.get(fav.propertyId);
        if (!property) return null;
        
        const imageUrls = await Promise.all(
          property.images.slice(0, 1).map(async (imageId) => await ctx.storage.getUrl(imageId))
        );
        
        return { ...property, imageUrls };
      })
    );

    return properties.filter(Boolean);
  },
});

export const incrementViews = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (property) {
      await ctx.db.patch(args.propertyId, { views: property.views + 1 });
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to upload images");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
