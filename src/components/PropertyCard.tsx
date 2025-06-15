import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface Property {
  _id: Id<"properties">;
  title: string;
  description: string;
  price: number;
  type: "sale" | "rent";
  propertyType: string;
  location: {
    city: string;
    area: string;
    address: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    parking: boolean;
    furnished: boolean;
    balcony: boolean;
    garden: boolean;
    pool: boolean;
    gym: boolean;
    security: boolean;
  };
  imageUrls: (string | null)[];
  views: number;
  featured?: boolean;
}

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
  language: 'ar' | 'en';
}

export function PropertyCard({ property, featured = false, language }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const addToFavorites = useMutation(api.properties.addToFavorites);

  const t = {
    ar: {
      forSale: "للبيع",
      forRent: "للإيجار",
      featured: "مميز",
      noImage: "لا توجد صورة",
      monthly: "شهرياً",
      views: "مشاهدة",
      viewDetails: "عرض التفاصيل",
      favoriteAdded: "تم إضافة العقار للمفضلة",
      favoriteRemoved: "تم إزالة العقار من المفضلة",
      error: "حدث خطأ، يرجى المحاولة مرة أخرى",
      propertyTypes: {
        apartment: "شقة",
        house: "منزل",
        villa: "فيلا",
        office: "مكتب",
        land: "أرض"
      }
    },
    en: {
      forSale: "For Sale",
      forRent: "For Rent",
      featured: "Featured",
      noImage: "No Image",
      monthly: "monthly",
      views: "views",
      viewDetails: "View Details",
      favoriteAdded: "Property added to favorites",
      favoriteRemoved: "Property removed from favorites",
      error: "An error occurred, please try again",
      propertyTypes: {
        apartment: "Apartment",
        house: "House",
        villa: "Villa",
        office: "Office",
        land: "Land"
      }
    }
  };

  const handleFavorite = async () => {
    try {
      const result = await addToFavorites({ propertyId: property._id });
      setIsFavorited(result.favorited);
      toast.success(result.favorited ? t[language].favoriteAdded : t[language].favoriteRemoved);
    } catch (error) {
      toast.error(t[language].error);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}${language === 'ar' ? 'م' : 'M'}`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}${language === 'ar' ? 'ك' : 'K'}`;
    }
    return price.toString();
  };

  const getTypeLabel = (type: string) => {
    return type === "sale" ? t[language].forSale : t[language].forRent;
  };

  const getPropertyTypeLabel = (type: string) => {
    return t[language].propertyTypes[type as keyof typeof t[typeof language]['propertyTypes']] || type;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${featured ? 'ring-2 ring-yellow-400' : ''}`}>
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {property.imageUrls[0] ? (
          <img
            src={property.imageUrls[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <p className="text-sm">{t[language].noImage}</p>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} flex flex-col gap-2`}>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            property.type === 'sale' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {getTypeLabel(property.type)}
          </span>
          {featured && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              {t[language].featured}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} p-2 bg-white/80 hover:bg-white rounded-full transition-colors`}
        >
          <span className={`text-lg ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}>
            {isFavorited ? '❤️' : '🤍'}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
            {property.title}
          </h3>
          <div className={`${language === 'ar' ? 'text-left' : 'text-right'} ml-4`}>
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(property.price)} {language === 'ar' ? 'د.ب' : 'BHD'}
            </div>
            <div className="text-xs text-gray-500">
              {property.type === 'rent' ? t[language].monthly : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
            {getPropertyTypeLabel(property.propertyType)}
          </span>
          <span className="mx-2">•</span>
          <span>{property.location.city}</span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Features */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className={`flex items-center space-x-4 ${language === 'ar' ? 'rtl:space-x-reverse' : ''}`}>
            <div className="flex items-center">
              <span className={`${language === 'ar' ? 'mr-1' : 'ml-1'}`}>🛏️</span>
              <span>{property.features.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <span className={`${language === 'ar' ? 'mr-1' : 'ml-1'}`}>🚿</span>
              <span>{property.features.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <span className={`${language === 'ar' ? 'mr-1' : 'ml-1'}`}>📐</span>
              <span>{property.features.area}m²</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {property.views} {t[language].views}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex space-x-2 ${language === 'ar' ? 'rtl:space-x-reverse' : ''}`}>
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            {t[language].viewDetails}
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
            📞
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
            💬
          </button>
        </div>
      </div>
    </div>
  );
}
