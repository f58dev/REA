import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface UserPreferencesProps {
  language: 'ar' | 'en';
}

export function UserPreferences({ language }: UserPreferencesProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const preferences = useQuery(api.users.getPreferences, 
    loggedInUser ? { userId: loggedInUser._id } : "skip"
  );
  const updatePreferences = useMutation(api.users.updatePreferences);

  const [formData, setFormData] = useState({
    preferredType: "" as "sale" | "rent" | "",
    preferredPropertyTypes: [] as string[],
    preferredCities: [] as string[],
    priceRange: { min: 0, max: 1000000 },
    preferredFeatures: [] as string[]
  });

  const t = {
    ar: {
      title: "تفضيلاتك الشخصية",
      subtitle: "احفظ تفضيلاتك للحصول على توصيات مخصصة وتجربة بحث أفضل",
      loginRequired: "يرجى تسجيل الدخول لإدارة التفضيلات",
      preferredOfferType: "نوع العرض المفضل",
      doesntMatter: "لا يهم",
      forSale: "للبيع",
      forRent: "للإيجار",
      preferredPropertyTypes: "أنواع العقارات المفضلة",
      preferredCities: "المدن المفضلة",
      preferredPriceRange: "النطاق السعري المفضل",
      minPrice: "السعر الأدنى (دينار بحريني)",
      maxPrice: "السعر الأعلى (دينار بحريني)",
      preferredFeatures: "المميزات المفضلة",
      recentSearchHistory: "تاريخ البحث الأخير",
      savePreferences: "حفظ التفضيلات",
      preferencesSuccess: "تم حفظ التفضيلات بنجاح",
      preferencesError: "حدث خطأ في حفظ التفضيلات",
      propertyTypes: [
        { value: "apartment", label: "شقة" },
        { value: "house", label: "منزل" },
        { value: "villa", label: "فيلا" },
        { value: "office", label: "مكتب" },
        { value: "land", label: "أرض" }
      ],
      cities: ["المنامة", "المحرق", "الرفاع", "مدينة عيسى", "سترة", "الحد"],
      features: [
        { value: "parking", label: "موقف سيارة" },
        { value: "furnished", label: "مفروش" },
        { value: "balcony", label: "شرفة" },
        { value: "garden", label: "حديقة" },
        { value: "pool", label: "مسبح" },
        { value: "gym", label: "صالة رياضية" },
        { value: "security", label: "أمن وحراسة" }
      ]
    },
    en: {
      title: "Your Personal Preferences",
      subtitle: "Save your preferences to get personalized recommendations and better search experience",
      loginRequired: "Please log in to manage preferences",
      preferredOfferType: "Preferred Offer Type",
      doesntMatter: "Doesn't Matter",
      forSale: "For Sale",
      forRent: "For Rent",
      preferredPropertyTypes: "Preferred Property Types",
      preferredCities: "Preferred Cities",
      preferredPriceRange: "Preferred Price Range",
      minPrice: "Minimum Price (BHD)",
      maxPrice: "Maximum Price (BHD)",
      preferredFeatures: "Preferred Features",
      recentSearchHistory: "Recent Search History",
      savePreferences: "Save Preferences",
      preferencesSuccess: "Preferences saved successfully",
      preferencesError: "Error saving preferences",
      propertyTypes: [
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "villa", label: "Villa" },
        { value: "office", label: "Office" },
        { value: "land", label: "Land" }
      ],
      cities: ["Manama", "Muharraq", "Riffa", "Isa Town", "Sitra", "Hidd"],
      features: [
        { value: "parking", label: "Parking" },
        { value: "furnished", label: "Furnished" },
        { value: "balcony", label: "Balcony" },
        { value: "garden", label: "Garden" },
        { value: "pool", label: "Pool" },
        { value: "gym", label: "Gym" },
        { value: "security", label: "Security" }
      ]
    }
  };

  useEffect(() => {
    if (preferences) {
      setFormData({
        preferredType: preferences.preferredType || "",
        preferredPropertyTypes: preferences.preferredPropertyTypes || [],
        preferredCities: preferences.preferredCities || [],
        priceRange: preferences.priceRange || { min: 0, max: 1000000 },
        preferredFeatures: preferences.preferredFeatures || []
      });
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences({
        preferredType: formData.preferredType || undefined,
        preferredPropertyTypes: formData.preferredPropertyTypes,
        preferredCities: formData.preferredCities,
        priceRange: formData.priceRange,
        preferredFeatures: formData.preferredFeatures
      });
      toast.success(t[language].preferencesSuccess);
    } catch (error) {
      toast.error(t[language].preferencesError);
    }
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        preferredPropertyTypes: [...prev.preferredPropertyTypes, type]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredPropertyTypes: prev.preferredPropertyTypes.filter(t => t !== type)
      }));
    }
  };

  const handleCityChange = (city: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        preferredCities: [...prev.preferredCities, city]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredCities: prev.preferredCities.filter(c => c !== city)
      }));
    }
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        preferredFeatures: [...prev.preferredFeatures, feature]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredFeatures: prev.preferredFeatures.filter(f => f !== feature)
      }));
    }
  };

  if (!loggedInUser) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👤</div>
        <p className="text-gray-600">{t[language].loginRequired}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t[language].title}
        </h2>
        <p className="text-lg text-gray-600">
          {t[language].subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border space-y-8">
        {/* Preferred Type */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].preferredOfferType}</h3>
          <div className={`flex space-x-4 ${language === 'ar' ? 'rtl:space-x-reverse' : ''}`}>
            <label className="flex items-center">
              <input
                type="radio"
                name="preferredType"
                value=""
                checked={formData.preferredType === ""}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredType: e.target.value as any }))}
                className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              <span>{t[language].doesntMatter}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="preferredType"
                value="sale"
                checked={formData.preferredType === "sale"}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredType: e.target.value as any }))}
                className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              <span>{t[language].forSale}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="preferredType"
                value="rent"
                checked={formData.preferredType === "rent"}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredType: e.target.value as any }))}
                className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              <span>{t[language].forRent}</span>
            </label>
          </div>
        </div>

        {/* Property Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].preferredPropertyTypes}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t[language].propertyTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferredPropertyTypes.includes(type.value)}
                  onChange={(e) => handlePropertyTypeChange(type.value, e.target.checked)}
                  className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].preferredCities}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t[language].cities.map((city) => (
              <label key={city} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferredCities.includes(city)}
                  onChange={(e) => handleCityChange(city, e.target.checked)}
                  className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}
                />
                <span>{city}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].preferredPriceRange}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t[language].minPrice}
              </label>
              <input
                type="number"
                value={formData.priceRange.min}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t[language].maxPrice}
              </label>
              <input
                type="number"
                value={formData.priceRange.max}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 1000000 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].preferredFeatures}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t[language].features.map((feature) => (
              <label key={feature.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferredFeatures.includes(feature.value)}
                  onChange={(e) => handleFeatureChange(feature.value, e.target.checked)}
                  className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}
                />
                <span>{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search History */}
        {preferences?.searchHistory && preferences.searchHistory.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].recentSearchHistory}</h3>
            <div className="space-y-2">
              {preferences.searchHistory.slice(0, 5).map((search, index) => (
                <div key={index} className="bg-gray-50 px-3 py-2 rounded text-sm text-gray-700">
                  {search}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {t[language].savePreferences}
          </button>
        </div>
      </form>
    </div>
  );
}
