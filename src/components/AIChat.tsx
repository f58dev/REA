import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  language: 'ar' | 'en';
}

export function AIChat({ language }: AIChatProps) {
  const t = {
    ar: {
      welcome: "مرحباً! أنا مساعدك الذكي للعقارات. يمكنني مساعدتك في:\n\n• البحث عن العقارات المناسبة\n• تقديم نصائح الاستثمار\n• تحليل السوق العقاري\n• الإجابة على أسئلتك حول العقارات\n\nكيف يمكنني مساعدتك اليوم؟",
      aiAssistant: "المساعد الذكي للعقارات",
      alwaysAvailable: "متاح دائماً لمساعدتك",
      clearChat: "مسح المحادثة",
      aiTyping: "المساعد يكتب...",
      commonQuestions: "أسئلة شائعة:",
      placeholder: "اكتب رسالتك هنا...",
      send: "إرسال",
      error: "حدث خطأ في الاتصال بالمساعد الذكي",
      connectionError: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
      quickQuestions: [
        "ما هي أفضل المناطق للاستثمار العقاري؟",
        "كيف أحدد سعر عقاري المناسب؟",
        "ما الفرق بين الشراء والإيجار؟",
        "نصائح لشراء أول منزل",
        "كيف أقيم العقار قبل الشراء؟"
      ]
    },
    en: {
      welcome: "Hello! I'm your smart real estate assistant. I can help you with:\n\n• Finding suitable properties\n• Investment advice\n• Market analysis\n• Answering your real estate questions\n\nHow can I help you today?",
      aiAssistant: "Smart Real Estate Assistant",
      alwaysAvailable: "Always available to help you",
      clearChat: "Clear Chat",
      aiTyping: "Assistant is typing...",
      commonQuestions: "Common Questions:",
      placeholder: "Type your message here...",
      send: "Send",
      error: "Error connecting to AI assistant",
      connectionError: "Sorry, there was a connection error. Please try again.",
      quickQuestions: [
        "What are the best areas for real estate investment?",
        "How do I determine the right property price?",
        "What's the difference between buying and renting?",
        "Tips for buying your first home",
        "How to evaluate a property before buying?"
      ]
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: t[language].welcome,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatWithAI = useAction(api.ai.chatWithAI);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await chatWithAI({
        message: inputMessage,
        userId: loggedInUser?._id
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error(t[language].error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t[language].connectionError,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content: t[language].welcome,
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-lg shadow-sm border flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className={`flex items-center space-x-3 ${language === 'ar' ? 'rtl:space-x-reverse' : ''}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t[language].aiAssistant}</h3>
            <p className="text-sm text-gray-600">{t[language].alwaysAvailable}</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
        >
          {t[language].clearChat}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 
              (language === 'ar' ? 'justify-start' : 'justify-end') : 
              (language === 'ar' ? 'justify-end' : 'justify-start')
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? `bg-blue-600 text-white ${language === 'ar' ? 'rounded-bl-sm' : 'rounded-br-sm'}`
                  : `bg-gray-100 text-gray-900 ${language === 'ar' ? 'rounded-br-sm' : 'rounded-bl-sm'}`
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div
                className={`text-xs mt-2 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString(language === 'ar' ? 'ar' : 'en', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
            <div className={`bg-gray-100 p-3 rounded-lg ${language === 'ar' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
              <div className={`flex items-center space-x-2 ${language === 'ar' ? 'rtl:space-x-reverse' : ''}`}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">{t[language].aiTyping}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t[language].commonQuestions}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {t[language].quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className={`${language === 'ar' ? 'text-right' : 'text-left'} p-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors`}
              >
                💡 {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className={`flex space-x-2 ${language === 'ar' ? 'rtl:space-x-reverse' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t[language].placeholder}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              t[language].send
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
