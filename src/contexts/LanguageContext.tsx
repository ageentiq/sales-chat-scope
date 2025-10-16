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
    mainMenu: 'Mubayi | مُبايع',
    salesDashboard: 'لوحة تحكم المبيعات',
    trackAndAnalyze: 'تتبع وتحليل محادثات العملاء',
    totalConversations: 'إجمالي المحادثات',
    totalMessages: 'إجمالي الرسائل',
    activeToday: 'نشط اليوم',
    avgResponseTime: 'متوسط وقت الاستجابة',
    conversationsOverTime: 'المحادثات عبر الزمن',
    dashboard: 'لوحة التحكم',
    search: 'بحث...',
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
    salesTeam: 'خدمة عملاء أسس',
    noMessagesFound: 'لم يتم العثور على رسائل لهذه المحادثة',
    avgMessagesPerConversation: 'متوسط الرسائل/محادثة',
    conversationsToday: 'المحادثات اليوم',
    activeLastSevenDays: 'نشط (آخر 7 أيام)',
    ofTotal: 'من الإجمالي',
    avgResponseTimeFull: 'متوسط وقت الرد',
    fasterThanLastWeek: 'أسرع من الأسبوع الماضي',
    slowerThanLastWeek: 'أبطأ من الأسبوع الماضي',
    moreEngagement: 'تفاعل أكثر',
    lessEngagement: 'تفاعل أقل',
    lastWeek: 'الأسبوع الماضي',
    prevWeek: 'الأسبوع السابق',
    responseRate: 'معدل الاستجابة',
    fromLastWeekUp: 'من الأسبوع الماضي',
    loadingDashboard: 'جاري تحميل لوحة التحكم...',
    fetchingData: 'جاري جلب البيانات...',
    allContacts: 'جميع جهات الاتصال',
    manageYourCustomerContacts: 'إدارة جهات اتصال عملائك',
    loadingContacts: 'جاري تحميل جهات الاتصال...',
    messagesCount: 'رسائل',
    lastContact: 'آخر اتصال',
    noContactsFound: 'لم يتم العثور على جهات اتصال',
    // Messages Page specific translations
    viewAndManageConversations: 'عرض وإدارة جميع المحادثات',
    conversation: 'محادثة',
    loadingConversations: 'جاري تحميل المحادثات...',
    noMatchesFound: 'لا توجد نتائج مطابقة',
    noConversationsYet: 'لا توجد محادثات بعد',
    tryAdjustingSearch: 'حاول تعديل كلمات البحث',
    startConversationToSee: 'ابدأ محادثة لرؤيتها هنا',
    message: 'رسالة',
    loadingMessages: 'جاري تحميل الرسائل...',
    noMessagesYet: 'لا توجد رسائل بعد',
    customerLabel: 'العميل',
    // Contacts Page specific translations
    contact: 'جهة اتصال',
    noContactsYet: 'لا توجد جهات اتصال بعد',
    startConversationToSeeContacts: 'ابدأ محادثة لرؤية جهات الاتصال هنا',
    // Tooltip explanations
    totalConversationsTooltip: 'إجمالي عدد المحادثات الفريدة بناءً على معرفات المحادثة',
    totalMessagesTooltip: 'إجمالي عدد الرسائل (الواردة والصادرة) عبر جميع المحادثات',
    avgMessagesPerConversationTooltip: 'متوسط عدد الرسائل لكل محادثة. يتم حسابه بقسمة إجمالي الرسائل على إجمالي المحادثات. يتم مقارنة آخر 7 أيام مع الأسبوع السابق',
    conversationsTodayTooltip: 'عدد المحادثات التي بدأت اليوم',
    activeLastSevenDaysTooltip: 'عدد المحادثات التي كانت نشطة خلال آخر 7 أيام',
    avgResponseTimeTooltip: 'متوسط الوقت بين رسالة العميل ورد الوكيل. يحسب الفرق الزمني بين الرسائل المتتالية في المحادثات',
    responseRateTooltip: 'النسبة المئوية للمحادثات التي تلقت رداً واحداً على الأقل. محسوبة كـ: (المحادثات مع رد / إجمالي المحادثات) × 100',
  },
  en: {
    home: 'Home',
    contacts: 'Contacts',
    messages: 'Messages',
    mainMenu: 'Mubayi | مُبايع',
    salesDashboard: 'Sales Dashboard',
    trackAndAnalyze: 'Track and analyze customer conversations',
    totalConversations: 'Total Conversations',
    totalMessages: 'Total Messages',
    activeToday: 'Active Today',
    avgResponseTime: 'Avg Response Time',
    conversationsOverTime: 'Conversations Over Time',
    dashboard: 'Dashboard',
    search: 'Search...',
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
    salesTeam: 'Ousus customer service',
    noMessagesFound: 'No messages found for this conversation',
    avgMessagesPerConversation: 'Avg Messages/Conversation',
    conversationsToday: 'Conversations Today',
    activeLastSevenDays: 'Active (Last 7 Days)',
    ofTotal: 'of total',
    avgResponseTimeFull: 'Avg Response Time',
    fasterThanLastWeek: 'faster than last week',
    slowerThanLastWeek: 'slower than last week',
    moreEngagement: 'more engagement',
    lessEngagement: 'less engagement',
    lastWeek: 'Last week',
    prevWeek: 'Prev week',
    responseRate: 'Response Rate',
    fromLastWeekUp: 'from last week',
    loadingDashboard: 'Loading Dashboard...',
    fetchingData: 'Fetching data...',
    allContacts: 'All Contacts',
    manageYourCustomerContacts: 'Manage your customer contacts',
    loadingContacts: 'Loading contacts...',
    messagesCount: 'messages',
    lastContact: 'Last contact',
    noContactsFound: 'No contacts found',
    // Messages Page specific translations
    viewAndManageConversations: 'View and manage all conversations',
    conversation: 'conversation',
    loadingConversations: 'Loading conversations...',
    noMatchesFound: 'No matches found',
    noConversationsYet: 'No conversations yet',
    tryAdjustingSearch: 'Try adjusting your search terms',
    startConversationToSee: 'Start a conversation to see it here',
    message: 'message',
    loadingMessages: 'Loading messages...',
    noMessagesYet: 'No messages yet',
    customerLabel: 'Customer',
    // Contacts Page specific translations
    contact: 'contact',
    noContactsYet: 'No contacts yet',
    startConversationToSeeContacts: 'Start a conversation to see contacts here',
    // Tooltip explanations
    totalConversationsTooltip: 'Total number of unique conversations based on conversation IDs',
    totalMessagesTooltip: 'Total count of all messages (inbound and outbound) across all conversations',
    avgMessagesPerConversationTooltip: 'Average number of messages per conversation. Calculated by dividing total messages by total conversations. Compares last 7 days vs previous week',
    conversationsTodayTooltip: 'Number of conversations that started today',
    activeLastSevenDaysTooltip: 'Number of conversations that were active in the last 7 days',
    avgResponseTimeTooltip: 'Average time between customer message and agent reply. Calculates time difference between consecutive messages in conversations',
    responseRateTooltip: 'Percentage of conversations that received at least one response. Calculated as: (Conversations with response / Total conversations) × 100',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

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
