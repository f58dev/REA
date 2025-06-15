import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PropertyCard } from "./PropertyCard";
import { toast } from "sonner";

interface SearchBarProps {
  language: 'ar' | 'en';
}

export function SearchBar({ language }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);

  const smartSearch = useAction(api.ai.smartSearch);
  const addSearchHistory = useMutation(api.users.addSearchHistory);

  const t = {
    ar: {
      title: "البحث الذكي بالذكاء الاصطناعي",
      subtitle: "ابحث عن العقارات باللغة الطبيعية - سيفهم الذكاء الاصطناعي ما تريد",
      placeholder: "مثال: شقة للبيع في المنامة بأقل من 100 ألف دينار مع موقف سيارة...",
      searching: "جاري البحث...",
      smartSearch: "🔍 بحث ذكي",
      examplesTitle: "أمثلة للبحث:",
      aiUnderstanding: "فهم الذكاء الاصطناعي لبحثك:",
      type: "النوع:",
      propertyType: "نوع العقار:",
      city: "المدينة:",
      maxPrice: "السعر الأقصى:",
      forSale: "للبيع",
      forRent: "للإيجار",
      searchResults: "نتائج البحث",
      noResults: "لم يتم العثور على نتائج",
      tryDifferent: "جرب تغيير كلمات البحث أو استخدم مصطلحات أخرى",
      searchError: "حدث خطأ في البحث، يرجى المحاولة مرة أخرى",
      exampleQueries: [
        "شقة للبيع في المنامة بأقل من 100 ألف",
        "فيلا للإيجار مع حديقة ومسبح",
        "مكتب في المحرق بمساحة كبيرة",
        "منزل 3 غرف نوم مع موقف سيارة"
      ]
    },
    en: {
      title: "AI-Powered Smart Search",
      subtitle: "Search for properties in natural language - AI will understand what you want",
      placeholder: "Example: 2-bedroom apartment for sale in Manama under 100k with parking...",
      searching: "Searching...",
      smartSearch: "🔍 Smart Search",
      examplesTitle: "Search Examples:",
      aiUnderstanding: "AI Understanding of Your Search:",
      type: "Type:",
      propertyType: "Property Type:",
      city: "City:",
      maxPrice: "Max Price:",
      forSale: "For Sale",
      forRent: "For Rent",
      searchResults: "Search Results",
      noResults: "No results found",
      tryDifferent: "Try changing search terms or use different keywords",
      searchError: "Search error occurred, please try again",
      exampleQueries: [
        "Apartment for sale in Manama under 100k",
        "Villa for rent with garden and pool",
        "Office in Muharraq with large space",
        "3 bedroom house with parking"
      ]
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await smartSearch({ query });
      setResults(result.results);
      setSearchParams(result.searchParams);
      
      // Add to search history
      await addSearchHistory({ searchTerm: query });
      
      toast.success(`${t[language].searchResults}: ${result.results.length}`);
    } catch (error) {
      toast.error(t[language].searchError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t[language].title}
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {t[language].subtitle}
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t[language].placeholder}
            className={`w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}
            disabled={isLoading}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`absolute ${language === 'ar' ? 'right-2' : 'left-2'} top-2 bottom-2 px-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-white ${language === 'ar' ? 'ml-2' : 'mr-2'}`}></div>
                {t[language].searching}
              </div>
            ) : (
              t[language].smartSearch
            )}
          </button>
        </div>
      </form>

      {/* Example Queries */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t[language].examplesTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t[language].exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className={`${language === 'ar' ? 'text-right' : 'text-left'} p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700 hover:text-gray-900`}
            >
              💡 {example}
            </button>
          ))}
        </div>
      </div>

      {/* Search Parameters Display */}
      {searchParams && (
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-4">{t[language].aiUnderstanding}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {searchParams.type && (
              <div className="bg-white p-3 rounded-md shadow-sm">
                <span className="font-medium text-blue-800">{t[language].type}</span>
                <div className="text-blue-600">{searchParams.type === 'sale' ? t[language].forSale : t[language].forRent}</div>
              </div>
            )}
            {searchParams.propertyType && (
              <div className="bg-white p-3 rounded-md shadow-sm">
                <span className="font-medium text-blue-800">{t[language].propertyType}</span>
                <div className="text-blue-600">{searchParams.propertyType}</div>
              </div>
            )}
            {searchParams.city && (
              <div className="bg-white p-3 rounded-md shadow-sm">
                <span className="font-medium text-blue-800">{t[language].city}</span>
                <div className="text-blue-600">{searchParams.city}</div>
              </div>
            )}
            {searchParams.maxPrice && (
              <div className="bg-white p-3 rounded-md shadow-sm">
                <span className="font-medium text-blue-800">{t[language].maxPrice}</span>
                <div className="text-blue-600">{searchParams.maxPrice.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">
              {t[language].searchResults} ({results.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((property) => (
              <PropertyCard key={property._id} property={property} language={language} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && query && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t[language].noResults}
          </h3>
          <p className="text-gray-600">
            {t[language].tryDifferent}
          </p>
        </div>
      )}
    </div>
  );
}
