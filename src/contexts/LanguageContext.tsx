import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ar: {
    home: 'الرئيسية',
    contacts: 'جهات الاتصال',
    messages: 'الرسائل',
    mainMenu: 'القائمة الرئيسية',
    salesDashboard: 'لوحة تحكم المبيعات',
    trackAndAnalyze: 'تتبع وتحليل محادثات العملاء',
    totalConversations: 'إجمالي المحادثات',
    totalMessages: 'إجمالي الرسائل',
    activeToday: 'نشط اليوم',
    avgResponseTime: 'متوسط وقت الاستجابة',
    fromLastWeek: 'من الأسبوع الماضي',
    updatedLive: 'محدث مباشرة',
    improvement: 'تحسن',
    comingSoon: 'قريبًا - صفحة جهات الاتصال قيد التطوير',
    messagesComingSoon: 'قريبًا - صفحة الرسائل قيد التطوير',
    welcome: 'مرحباً بك في تطبيقك الفارغ',
    startBuilding: 'ابدأ بناء مشروعك الرائع هنا!',
    pageNotFound: '404',
    oopsNotFound: 'عذراً! الصفحة غير موجودة',
    returnHome: 'العودة للرئيسية',
    conversationDetails: 'تفاصيل المحادثة',
    conversations: 'المحادثات',
    searchConversations: 'البحث في المحادثات...',
    customer: 'العميل',
    response: 'الرد',
    noConversationsFound: 'لم يتم العثور على محادثات',
    salesTeam: 'فريق المبيعات',
    noMessagesFound: 'لم يتم العثور على رسائل لهذه المحادثة',
  },
  en: {
    home: 'Home',
    contacts: 'Contacts',
    messages: 'Messages',
    mainMenu: 'Main Menu',
    salesDashboard: 'Sales Dashboard',
    trackAndAnalyze: 'Track and analyze customer conversations',
    totalConversations: 'Total Conversations',
    totalMessages: 'Total Messages',
    activeToday: 'Active Today',
    avgResponseTime: 'Avg Response Time',
    fromLastWeek: 'from last week',
    updatedLive: 'Updated live',
    improvement: 'improvement',
    comingSoon: 'Coming soon - Contacts page under development',
    messagesComingSoon: 'Coming soon - Messages page under development',
    welcome: 'Welcome to Your Blank App',
    startBuilding: 'Start building your amazing project here!',
    pageNotFound: '404',
    oopsNotFound: 'Oops! Page not found',
    returnHome: 'Return to Home',
    conversationDetails: 'Conversation Details',
    conversations: 'Conversations',
    searchConversations: 'Search conversations...',
    customer: 'Customer',
    response: 'Response',
    noConversationsFound: 'No conversations found',
    salesTeam: 'Sales Team',
    noMessagesFound: 'No messages found for this conversation',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.lang = language;
    // Keep layout direction as LTR for both languages to maintain consistent spacing
    document.documentElement.dir = 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
