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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Inbox className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('messages')}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">{t('viewAndManageConversations')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
