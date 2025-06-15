import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface MarketAnalysisProps {
  language: 'ar' | 'en';
}

export function MarketAnalysis({ language }: MarketAnalysisProps) {
  const [selectedCity, setSelectedCity] = useState(language === 'ar' ? "المنامة" : "Manama");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeMarket = useAction(api.ai.analyzeMarket);
  const existingAnalysis = useQuery(api.market.getAnalysis, {
    city: selectedCity,
    propertyType: selectedPropertyType || undefined
  });

  const t = {
    ar: {
      title: "تحليل السوق العقاري بالذكاء الاصطناعي",
      subtitle: "احصل على تحليل شامل للسوق العقاري مع رؤى ذكية وتوقعات الأسعار",
      city: "المدينة",
      propertyType: "نوع العقار",
      analyzeMarket: "🔍 تحليل السوق",
      analyzing: "جاري التحليل...",
      previousAnalysis: "💡 يوجد تحليل سابق لهذا السوق من تاريخ",
      marketStats: "إحصائيات السوق",
      totalProperties: "إجمالي العقارات",
      averagePrice: "متوسط السعر",
      minPrice: "أقل سعر",
      maxPrice: "أعلى سعر",
      propertyTypeBreakdown: "توزيع أنواع العقارات",
      property: "عقار",
      avgPrice: "متوسط السعر:",
      aiAnalysis: "🤖 تحليل الذكاء الاصطناعي",
      marketInsights: "💡 رؤى السوق",
      startAnalysis: "ابدأ تحليل السوق",
      selectCityAndType: "اختر المدينة ونوع العقار واضغط على \"تحليل السوق\" للحصول على رؤى ذكية",
      analysisSuccess: "تم إنجاز تحليل السوق بنجاح",
      analysisError: "حدث خطأ في تحليل السوق",
      cities: ["المنامة", "المحرق", "الرفاع", "مدينة عيسى", "سترة", "الحد"],
      propertyTypes: [
        { value: "", label: "جميع الأنواع" },
        { value: "apartment", label: "شقة" },
        { value: "house", label: "منزل" },
        { value: "villa", label: "فيلا" },
        { value: "office", label: "مكتب" },
        { value: "land", label: "أرض" }
      ]
    },
    en: {
      title: "AI-Powered Real Estate Market Analysis",
      subtitle: "Get comprehensive market analysis with smart insights and price predictions",
      city: "City",
      propertyType: "Property Type",
      analyzeMarket: "🔍 Analyze Market",
      analyzing: "Analyzing...",
      previousAnalysis: "💡 Previous analysis available for this market from",
      marketStats: "Market Statistics",
      totalProperties: "Total Properties",
      averagePrice: "Average Price",
      minPrice: "Minimum Price",
      maxPrice: "Maximum Price",
      propertyTypeBreakdown: "Property Type Breakdown",
      property: "property",
      avgPrice: "Avg Price:",
      aiAnalysis: "🤖 AI Analysis",
      marketInsights: "💡 Market Insights",
      startAnalysis: "Start Market Analysis",
      selectCityAndType: "Select city and property type, then click \"Analyze Market\" for smart insights",
      analysisSuccess: "Market analysis completed successfully",
      analysisError: "Error occurred during market analysis",
      cities: ["Manama", "Muharraq", "Riffa", "Isa Town", "Sitra", "Hidd"],
      propertyTypes: [
        { value: "", label: "All Types" },
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "villa", label: "Villa" },
        { value: "office", label: "Office" },
        { value: "land", label: "Land" }
      ]
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMarket({
        city: selectedCity,
        propertyType: selectedPropertyType || undefined
      });
      setAnalysisResult(result);
      toast.success(t[language].analysisSuccess);
    } catch (error) {
      toast.error(t[language].analysisError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} ${language === 'ar' ? 'مليون د.ب' : 'M BHD'}`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ${language === 'ar' ? 'ألف د.ب' : 'K BHD'}`;
    }
    return `${price} ${language === 'ar' ? 'د.ب' : 'BHD'}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t[language].title}
        </h2>
        <p className="text-lg text-gray-600">
          {t[language].subtitle}
        </p>
      </div>

      {/* Analysis Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t[language].city}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t[language].cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t[language].propertyType}
            </label>
            <select
              value={selectedPropertyType}
              onChange={(e) => setSelectedPropertyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t[language].propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-white ${language === 'ar' ? 'ml-2' : 'mr-2'}`}></div>
                  {t[language].analyzing}
                </div>
              ) : (
                t[language].analyzeMarket
              )}
            </button>
          </div>
        </div>

        {/* Existing Analysis Notice */}
        {existingAnalysis && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              {t[language].previousAnalysis} {new Date(existingAnalysis.analysisDate).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {(analysisResult || existingAnalysis) && (
        <div className="space-y-6">
          {/* Market Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t[language].marketStats}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {(analysisResult || existingAnalysis)?.totalListings || 0}
                </div>
                <div className="text-sm text-blue-800">{t[language].totalProperties}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice((analysisResult || existingAnalysis)?.averagePrice || 0)}
                </div>
                <div className="text-sm text-green-800">{t[language].averagePrice}</div>
              </div>
              {analysisResult?.priceRange && (
                <>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {formatPrice(analysisResult.priceRange.min)}
                    </div>
                    <div className="text-sm text-orange-800">{t[language].minPrice}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {formatPrice(analysisResult.priceRange.max)}
                    </div>
                    <div className="text-sm text-red-800">{t[language].maxPrice}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Property Type Breakdown */}
          {analysisResult?.typeBreakdown && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t[language].propertyTypeBreakdown}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisResult.typeBreakdown.map((type: any) => (
                  <div key={type.type} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border">
                    <div className="font-semibold text-gray-900">{type.type}</div>
                    <div className="text-sm text-gray-600">{type.count} {t[language].property}</div>
                    <div className="text-sm text-blue-600">
                      {t[language].avgPrice} {formatPrice(type.averagePrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t[language].aiAnalysis}
            </h3>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {(analysisResult || existingAnalysis)?.analysis || (analysisResult || existingAnalysis)?.aiInsights}
              </div>
            </div>
          </div>

          {/* Market Insights */}
          {analysisResult?.insights && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">{t[language].marketInsights}</h3>
              <div className="space-y-2">
                {analysisResult.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <span className={`text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`}>•</span>
                    <span className="text-blue-800">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Analysis State */}
      {!analysisResult && !existingAnalysis && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t[language].startAnalysis}
          </h3>
          <p className="text-gray-600">
            {t[language].selectCityAndType}
          </p>
        </div>
      )}
    </div>
  );
}
