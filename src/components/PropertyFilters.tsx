interface PropertyFiltersProps {
  filters: {
    type?: "sale" | "rent";
    propertyType?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  onFiltersChange: (filters: any) => void;
  language: 'ar' | 'en';
}

export function PropertyFilters({ filters, onFiltersChange, language }: PropertyFiltersProps) {
  const t = {
    ar: {
      filterResults: "تصفية النتائج",
      offerType: "نوع العرض",
      propertyType: "نوع العقار",
      city: "المدينة",
      minPrice: "السعر الأدنى",
      maxPrice: "السعر الأعلى",
      all: "الكل",
      forSale: "للبيع",
      forRent: "للإيجار",
      unlimited: "بلا حدود",
      clearFilters: "مسح جميع المرشحات",
      cities: ["المنامة", "المحرق", "الرفاع", "مدينة عيسى", "سترة", "الحد"],
      propertyTypes: [
        { value: "apartment", label: "شقة" },
        { value: "house", label: "منزل" },
        { value: "villa", label: "فيلا" },
        { value: "office", label: "مكتب" },
        { value: "land", label: "أرض" }
      ]
    },
    en: {
      filterResults: "Filter Results",
      offerType: "Offer Type",
      propertyType: "Property Type",
      city: "City",
      minPrice: "Min Price",
      maxPrice: "Max Price",
      all: "All",
      forSale: "For Sale",
      forRent: "For Rent",
      unlimited: "Unlimited",
      clearFilters: "Clear All Filters",
      cities: ["Manama", "Muharraq", "Riffa", "Isa Town", "Sitra", "Hidd"],
      propertyTypes: [
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "villa", label: "Villa" },
        { value: "office", label: "Office" },
        { value: "land", label: "Land" }
      ]
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].filterResults}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t[language].offerType}
          </label>
          <select
            value={filters.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t[language].all}</option>
            <option value="sale">{t[language].forSale}</option>
            <option value="rent">{t[language].forRent}</option>
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t[language].propertyType}
          </label>
          <select
            value={filters.propertyType || ""}
            onChange={(e) => handleFilterChange("propertyType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t[language].all}</option>
            {t[language].propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t[language].city}
          </label>
          <select
            value={filters.city || ""}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t[language].all}</option>
            {t[language].cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t[language].minPrice}
          </label>
          <input
            type="number"
            value={filters.minPrice || ""}
            onChange={(e) => handleFilterChange("minPrice", e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t[language].maxPrice}
          </label>
          <input
            type="number"
            value={filters.maxPrice || ""}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder={t[language].unlimited}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clear Filters */}
      <div className={`mt-4 flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
        <button
          onClick={() => onFiltersChange({})}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t[language].clearFilters}
        </button>
      </div>
    </div>
  );
}
