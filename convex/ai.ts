import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getPropertyRecommendations = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<any[]> => {
    // Get user preferences
    const preferences = await ctx.runQuery(api.users.getPreferences, { userId: args.userId });
    
    // Get user's favorite properties to understand preferences
    const favorites: any[] = await ctx.runQuery(api.properties.getFavorites, {});
    
    // Get all properties
    const allProperties: any[] = await ctx.runQuery(api.properties.list, { limit: 100 });
    
    // Create AI prompt for recommendations
    const prompt: string = `
    Based on the following user data, recommend the best properties from the list:
    
    User Preferences:
    - Preferred Type: ${preferences?.preferredType || "any"}
    - Preferred Cities: ${preferences?.preferredCities?.join(", ") || "any"}
    - Price Range: ${preferences?.priceRange?.min || 0} - ${preferences?.priceRange?.max || "unlimited"}
    - Preferred Features: ${preferences?.preferredFeatures?.join(", ") || "none specified"}
    
    User's Favorite Properties (to understand taste):
    ${favorites.map((p: any) => `- ${p?.title}: ${p?.propertyType} in ${p?.location.city}, ${p?.price} price`).join("\n")}
    
    Available Properties:
    ${allProperties.map((p: any, i: number) => `${i+1}. ${p.title} - ${p.propertyType} in ${p.location.city} - Price: ${p.price} - Features: ${p.features.bedrooms}BR, ${p.features.bathrooms}BA, ${p.features.area}sqm`).slice(0, 20).join("\n")}
    
    Please recommend the top 5 properties with brief explanations why they match the user's preferences. Return as JSON array with property indices and reasons.
    `;

    try {
      const response: Response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      const data: any = await response.json();
      const aiResponse: string = data.choices[0].message.content;
      
      // Try to parse JSON response, fallback to text analysis
      try {
        const recommendations = JSON.parse(aiResponse);
        return recommendations;
      } catch {
        // Fallback: return top properties based on simple matching
        return allProperties.slice(0, 5).map((p: any, i: number) => ({
          propertyIndex: i,
          reason: "Matches your general preferences"
        }));
      }
    } catch (error) {
      console.error("AI recommendation error:", error);
      // Fallback recommendations
      return allProperties.slice(0, 5).map((p: any, i: number) => ({
        propertyIndex: i,
        reason: "Popular property in your area"
      }));
    }
  },
});

export const analyzeMarket = action({
  args: { 
    city: v.string(),
    propertyType: v.optional(v.string())
  },
  handler: async (ctx, args): Promise<any> => {
    // Get properties in the specified city
    const properties: any[] = await ctx.runQuery(api.properties.list, { 
      city: args.city,
      limit: 100
    });

    if (properties.length === 0) {
      return {
        analysis: "No sufficient data available for this market",
        averagePrice: 0,
        totalListings: 0,
        insights: []
      };
    }

    // Filter by property type if specified
    const filteredProperties: any[] = args.propertyType 
      ? properties.filter((p: any) => p.propertyType === args.propertyType)
      : properties;

    // Calculate basic statistics
    const prices: number[] = filteredProperties.map((p: any) => p.price);
    const averagePrice: number = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const minPrice: number = Math.min(...prices);
    const maxPrice: number = Math.max(...prices);

    // Group by property type for analysis
    const typeGroups: Record<string, any[]> = filteredProperties.reduce((acc: Record<string, any[]>, p: any) => {
      acc[p.propertyType] = acc[p.propertyType] || [];
      acc[p.propertyType].push(p);
      return acc;
    }, {} as Record<string, any[]>);

    const prompt: string = `
    Analyze this real estate market data for ${args.city}:
    
    Market Statistics:
    - Total Listings: ${filteredProperties.length}
    - Average Price: ${averagePrice.toLocaleString()}
    - Price Range: ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
    - Property Types: ${Object.keys(typeGroups).join(", ")}
    
    Property Type Breakdown:
    ${Object.entries(typeGroups).map(([type, props]: [string, any[]]) => 
      `- ${type}: ${props.length} listings, avg price: ${(props.reduce((sum: number, p: any) => sum + p.price, 0) / props.length).toLocaleString()}`
    ).join("\n")}
    
    Provide a comprehensive market analysis including:
    1. Market trends and insights
    2. Investment opportunities
    3. Price predictions
    4. Best property types to invest in
    5. Market comparison with similar cities
    
    Keep the analysis professional and data-driven.
    `;

    try {
      const response: Response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      });

      const data: any = await response.json();
      const analysis: string = data.choices[0].message.content;

      // Store analysis in database
      await ctx.runMutation(api.market.saveAnalysis, {
        city: args.city,
        area: "General",
        propertyType: args.propertyType || "All",
        averagePrice,
        priceChange: 0, // Would need historical data
        totalListings: filteredProperties.length,
        aiInsights: analysis
      });

      return {
        analysis,
        averagePrice,
        totalListings: filteredProperties.length,
        priceRange: { min: minPrice, max: maxPrice },
        typeBreakdown: Object.entries(typeGroups).map(([type, props]: [string, any[]]) => ({
          type,
          count: props.length,
          averagePrice: props.reduce((sum: number, p: any) => sum + p.price, 0) / props.length
        }))
      };
    } catch (error) {
      console.error("Market analysis error:", error);
      return {
        analysis: "Unable to generate AI analysis at this time. Basic statistics are available.",
        averagePrice,
        totalListings: filteredProperties.length,
        insights: ["Market data collected successfully"]
      };
    }
  },
});

export const smartSearch = action({
  args: { query: v.string() },
  handler: async (ctx, args): Promise<any> => {
    const prompt: string = `
    Parse this natural language real estate search query and extract structured search parameters:
    
    Query: "${args.query}"
    
    Extract and return JSON with these fields:
    {
      "type": "sale" or "rent" or null,
      "propertyType": "apartment", "house", "villa", "office", "land" or null,
      "city": string or null,
      "minPrice": number or null,
      "maxPrice": number or null,
      "bedrooms": number or null,
      "features": array of strings or null
    }
    
    Examples:
    - "شقة للبيع في المنامة بأقل من 100 ألف" → {"type": "sale", "propertyType": "apartment", "city": "المنامة", "maxPrice": 100000}
    - "villa for rent with pool and garden" → {"type": "rent", "propertyType": "villa", "features": ["pool", "garden"]}
    - "3 bedroom house in Dubai" → {"propertyType": "house", "city": "Dubai", "bedrooms": 3}
    
    Return only valid JSON.
    `;

    try {
      const response: Response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      });

      const data: any = await response.json();
      const aiResponse: string = data.choices[0].message.content;
      
      try {
        const searchParams = JSON.parse(aiResponse);
        
        // Use the extracted parameters to search properties
        const properties: any[] = await ctx.runQuery(api.properties.list, {
          type: searchParams.type,
          propertyType: searchParams.propertyType,
          city: searchParams.city,
          minPrice: searchParams.minPrice,
          maxPrice: searchParams.maxPrice,
          limit: 20
        });

        return {
          searchParams,
          results: properties,
          query: args.query
        };
      } catch (parseError) {
        // Fallback to regular text search
        const results: any[] = await ctx.runQuery(api.properties.search, {
          searchTerm: args.query,
          limit: 10
        });
        
        return {
          searchParams: null,
          results,
          query: args.query
        };
      }
    } catch (error) {
      console.error("Smart search error:", error);
      // Fallback to regular search
      const results: any[] = await ctx.runQuery(api.properties.search, {
        searchTerm: args.query,
        limit: 10
      });
      
      return {
        searchParams: null,
        results,
        query: args.query
      };
    }
  },
});

export const chatWithAI = action({
  args: { 
    message: v.string(),
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args): Promise<{ message: string }> => {
    // Get user context if available
    let userContext = "";
    if (args.userId) {
      const preferences = await ctx.runQuery(api.users.getPreferences, { userId: args.userId });
      const favorites = await ctx.runQuery(api.properties.getFavorites, {});
      
      userContext = `
      User Context:
      - Preferred Type: ${preferences?.preferredType || "not specified"}
      - Preferred Cities: ${preferences?.preferredCities?.join(", ") || "not specified"}
      - Price Range: ${preferences?.priceRange?.min || 0} - ${preferences?.priceRange?.max || "unlimited"}
      - Favorite Properties: ${favorites.length} properties
      `;
    }

    // Get recent properties for context
    const recentProperties = await ctx.runQuery(api.properties.list, { limit: 10 });
    const propertyContext = recentProperties.map(p => 
      `${p.title} - ${p.propertyType} in ${p.location.city} - ${p.price} BHD`
    ).join("\n");

    const systemPrompt = `
    You are a helpful AI assistant for a real estate platform in Bahrain. You help users with:
    - Property search and recommendations
    - Real estate investment advice
    - Market analysis and trends
    - Property valuation guidance
    - Buying/renting process assistance

    Always respond in Arabic when the user writes in Arabic, and in English when they write in English.
    Be helpful, professional, and knowledgeable about real estate matters.
    
    ${userContext}
    
    Recent Properties Available:
    ${propertyContext}
    
    User Message: "${args.message}"
    
    Provide a helpful, informative response. If the user is asking about specific properties, you can reference the ones listed above.
    `;

    try {
      const response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      return { message: aiMessage };
    } catch (error) {
      console.error("AI chat error:", error);
      return { 
        message: "عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى لاحقاً." 
      };
    }
  },
});
