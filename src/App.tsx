import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { PropertyList } from "./components/PropertyList";
import { SearchBar } from "./components/SearchBar";
import { MarketAnalysis } from "./components/MarketAnalysis";
import { UserPreferences } from "./components/UserPreferences";
import { AIChat } from "./components/AIChat";
import { useState, useEffect } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'market' | 'preferences' | 'chat'>('home');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  
  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = {
    ar: {
      title: "🏠 العقارات الذكية",
      home: "الرئيسية",
      smartSearch: "البحث الذكي",
      marketAnalysis: "تحليل السوق",
      aiAssistant: "🤖 المساعد الذكي",
      preferences: "التفضيلات",
      welcome: "مرحباً بك في منصة العقارات الذكية",
      subtitle: "اكتشف أفضل العقارات بمساعدة الذكاء الاصطناعي",
      greeting: "أهلاً وسهلاً",
      description: "استكشف العقارات المتاحة واحصل على توصيات ذكية مخصصة لك"
    },
    en: {
      title: "🏠 Smart Real Estate",
      home: "Home",
      smartSearch: "Smart Search",
      marketAnalysis: "Market Analysis",
      aiAssistant: "🤖 AI Assistant",
      preferences: "Preferences",
      welcome: "Welcome to Smart Real Estate Platform",
      subtitle: "Discover the best properties with AI assistance",
      greeting: "Welcome",
      description: "Explore available properties and get personalized smart recommendations"
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-8 rtl:space-x-reverse">
            <h1 className="text-2xl font-bold text-blue-600">{t[language].title}</h1>
            <Authenticated>
              <nav className="hidden md:flex space-x-6 rtl:space-x-reverse">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'home' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t[language].home}
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'search' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t[language].smartSearch}
                </button>
                <button
                  onClick={() => setActiveTab('market')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'market' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t[language].marketAnalysis}
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'chat' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t[language].aiAssistant}
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'preferences' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t[language].preferences}
                </button>
              </nav>
            </Authenticated>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content activeTab={activeTab} language={language} t={t} />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ activeTab, language, t }: { 
  activeTab: string; 
  language: 'ar' | 'en';
  t: any;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t[language].welcome}
            </h2>
            <p className="text-lg text-gray-600">
              {t[language].subtitle}
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t[language].greeting}، {loggedInUser?.name || loggedInUser?.email}!
          </h2>
          <p className="text-gray-600">
            {t[language].description}
          </p>
        </div>

        {activeTab === 'home' && <PropertyList language={language} />}
        {activeTab === 'search' && <SearchBar language={language} />}
        {activeTab === 'market' && <MarketAnalysis language={language} />}
        {activeTab === 'chat' && <AIChat language={language} />}
        {activeTab === 'preferences' && <UserPreferences language={language} />}
      </Authenticated>
    </div>
  );
}
