import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  properties: defineTable({
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
      address: v.string(),
      coordinates: v.optional(v.object({
        lat: v.number(),
        lng: v.number()
      }))
    }),
    features: v.object({
      bedrooms: v.number(),
      bathrooms: v.number(),
      area: v.number(), // in square meters
      parking: v.boolean(),
      furnished: v.boolean(),
      balcony: v.boolean(),
      garden: v.boolean(),
      pool: v.boolean(),
      gym: v.boolean(),
      security: v.boolean()
    }),
    images: v.array(v.id("_storage")),
    ownerId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("sold"),
      v.literal("rented")
    ),
    featured: v.boolean(),
    views: v.number(),
    contactInfo: v.object({
      phone: v.string(),
      email: v.string(),
      whatsapp: v.optional(v.string())
    })
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_property_type", ["propertyType"])
    .index("by_city", ["location.city"])
    .index("by_featured", ["featured"])
    .searchIndex("search_properties", {
      searchField: "title",
      filterFields: ["type", "propertyType", "location.city", "status"]
    }),

  reviews: defineTable({
    propertyId: v.id("properties"),
    userId: v.id("users"),
    rating: v.number(), // 1-5
    comment: v.string(),
    helpful: v.number() // count of helpful votes
  })
    .index("by_property", ["propertyId"])
    .index("by_user", ["userId"]),

  favorites: defineTable({
    userId: v.id("users"),
    propertyId: v.id("properties")
  })
    .index("by_user", ["userId"])
    .index("by_property", ["propertyId"])
    .index("by_user_property", ["userId", "propertyId"]),

  inquiries: defineTable({
    propertyId: v.id("properties"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    message: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("responded"),
      v.literal("closed")
    ),
    response: v.optional(v.string())
  })
    .index("by_property", ["propertyId"])
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"]),

  userPreferences: defineTable({
    userId: v.id("users"),
    preferredType: v.optional(v.union(v.literal("sale"), v.literal("rent"))),
    preferredPropertyTypes: v.array(v.string()),
    preferredCities: v.array(v.string()),
    priceRange: v.object({
      min: v.number(),
      max: v.number()
    }),
    preferredFeatures: v.array(v.string()),
    searchHistory: v.array(v.string())
  })
    .index("by_user", ["userId"]),

  marketAnalysis: defineTable({
    city: v.string(),
    area: v.string(),
    propertyType: v.string(),
    averagePrice: v.number(),
    priceChange: v.number(), // percentage change
    totalListings: v.number(),
    analysisDate: v.number(),
    aiInsights: v.string()
  })
    .index("by_city", ["city"])
    .index("by_area", ["area"])
    .index("by_date", ["analysisDate"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
