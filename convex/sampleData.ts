import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Sample data seeding function for testing
export const seedSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to seed data");
    }

    // Check if data already exists
    const existing = await ctx.db.query("properties").take(1);
    if (existing.length > 0) {
      return { message: "Sample data already exists" };
    }

    const sampleProperties = [
      {
        title: "شقة فاخرة في المنامة",
        description: "شقة حديثة مع إطلالة رائعة على البحر، تحتوي على جميع وسائل الراحة الحديثة",
        price: 85000,
        type: "sale" as const,
        propertyType: "apartment" as const,
        location: {
          city: "المنامة",
          area: "الجفير",
          address: "شارع الملك فيصل، المنامة"
        },
        features: {
          bedrooms: 2,
          bathrooms: 2,
          area: 120,
          parking: true,
          furnished: true,
          balcony: true,
          garden: false,
          pool: true,
          gym: true,
          security: true
        },
        images: [],
        ownerId: userId,
        status: "approved" as const,
        featured: true,
        views: 45,
        contactInfo: {
          phone: "+973 1234 5678",
          email: "owner@example.com",
          whatsapp: "+973 1234 5678"
        }
      },
      {
        title: "فيلا عائلية في الرفاع",
        description: "فيلا واسعة مع حديقة كبيرة، مثالية للعائلات الكبيرة",
        price: 2500,
        type: "rent" as const,
        propertyType: "villa" as const,
        location: {
          city: "الرفاع",
          area: "الرفاع الشرقي",
          address: "شارع الأمير سلمان، الرفاع"
        },
        features: {
          bedrooms: 4,
          bathrooms: 3,
          area: 300,
          parking: true,
          furnished: false,
          balcony: true,
          garden: true,
          pool: true,
          gym: false,
          security: true
        },
        images: [],
        ownerId: userId,
        status: "approved" as const,
        featured: true,
        views: 32,
        contactInfo: {
          phone: "+973 2345 6789",
          email: "villa@example.com"
        }
      },
      {
        title: "مكتب تجاري في المحرق",
        description: "مكتب حديث في موقع استراتيجي قريب من المطار",
        price: 45000,
        type: "sale" as const,
        propertyType: "office" as const,
        location: {
          city: "المحرق",
          area: "المحرق الجديدة",
          address: "شارع الشيخ عيسى، المحرق"
        },
        features: {
          bedrooms: 0,
          bathrooms: 2,
          area: 80,
          parking: true,
          furnished: true,
          balcony: false,
          garden: false,
          pool: false,
          gym: false,
          security: true
        },
        images: [],
        ownerId: userId,
        status: "approved" as const,
        featured: false,
        views: 18,
        contactInfo: {
          phone: "+973 3456 7890",
          email: "office@example.com"
        }
      },
      {
        title: "منزل عائلي في مدينة عيسى",
        description: "منزل مريح في حي هادئ، مناسب للعائلات",
        price: 1800,
        type: "rent" as const,
        propertyType: "house" as const,
        location: {
          city: "مدينة عيسى",
          area: "مدينة عيسى الجنوبية",
          address: "شارع 42، مدينة عيسى"
        },
        features: {
          bedrooms: 3,
          bathrooms: 2,
          area: 180,
          parking: true,
          furnished: false,
          balcony: false,
          garden: true,
          pool: false,
          gym: false,
          security: false
        },
        images: [],
        ownerId: userId,
        status: "approved" as const,
        featured: false,
        views: 28,
        contactInfo: {
          phone: "+973 4567 8901",
          email: "house@example.com"
        }
      },
      {
        title: "أرض للبيع في سترة",
        description: "قطعة أرض في موقع ممتاز للاستثمار أو البناء",
        price: 120000,
        type: "sale" as const,
        propertyType: "land" as const,
        location: {
          city: "سترة",
          area: "سترة الشمالية",
          address: "منطقة 15، سترة"
        },
        features: {
          bedrooms: 0,
          bathrooms: 0,
          area: 500,
          parking: false,
          furnished: false,
          balcony: false,
          garden: false,
          pool: false,
          gym: false,
          security: false
        },
        images: [],
        ownerId: userId,
        status: "approved" as const,
        featured: false,
        views: 12,
        contactInfo: {
          phone: "+973 5678 9012",
          email: "land@example.com"
        }
      }
    ];

    const insertedIds = [];
    for (const property of sampleProperties) {
      const id = await ctx.db.insert("properties", property);
      insertedIds.push(id);
    }

    return { 
      message: "Sample data seeded successfully", 
      count: insertedIds.length,
      ids: insertedIds 
    };
  },
});
