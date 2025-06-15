import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { PropertyFilters } from "./PropertyFilters";
import { toast } from "sonner";

interface PropertyListProps {
  language: 'ar' | 'en';
}

export function PropertyList({ language }: PropertyListProps) {
  const [filters, setFilters] = useState({
    type: undefined as "sale" | "rent" | undefined,
    propertyType: undefined as string | undefined,
    city: undefined as string | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
  });

  const properties = useQuery(api.properties.list, {
    ...filters,
    limit: 20
  });

  const featuredProperties = useQuery(api.properties.list, {
    featured: true,
    limit: 6
  });

  const seedSampleData = useMutation(api.sampleData.seedSampleData);

  const t = {
    ar: {
      featuredProperties: "العقارات المميزة",
      allProperties: "جميع العقارات",
      noProperties: "لا توجد عقارات متاحة",
      tryChanging: "جرب تغيير معايير البحث أو تصفح العقارات المميزة",
      addSampleData: "إضافة بيانات تجريبية للاختبار",
      sampleDataError: "حدث خطأ في إضافة البيانات التجريبية"
    },
    en: {
      featuredProperties: "Featured Properties",
      allProperties: "All Properties",
      noProperties: "No properties available",
      tryChanging: "Try changing search criteria or browse featured properties",
      addSampleData: "Add sample data for testing",
      sampleDataError: "Error adding sample data"
    }
  };

  const handleSeedData = async () => {
    try {
      const result = await seedSampleData({});
      toast.success(result.message);
    } catch (error) {
      toast.error(t[language].sampleDataError);
    }
  };

  if (properties === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Properties */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t[language].featuredProperties}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} featured language={language} />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <PropertyFilters filters={filters} onFiltersChange={setFilters} language={language} />

      {/* All Properties */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {t[language].allProperties} ({properties.length})
          </h3>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t[language].noProperties}
            </h3>
            <p className="text-gray-600 mb-4">
              {t[language].tryChanging}
            </p>
            <button
              onClick={handleSeedData}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t[language].addSampleData}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} language={language} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
