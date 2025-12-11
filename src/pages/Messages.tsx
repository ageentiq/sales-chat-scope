import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Inbox } from "lucide-react";
import { ConversationList } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";

const Messages = () => {
  const { t } = useLanguage();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  if (selectedConversationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ChatView 
              conversationId={selectedConversationId}
              onBack={handleBackToList}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-100">
              <Inbox className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('messages')}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">{t('viewAndManageConversations')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ConversationList 
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversationId}
          />
        </div>
      </main>
    </div>
  );
};

export default Messages;
