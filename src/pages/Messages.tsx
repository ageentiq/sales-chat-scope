import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 py-6 px-8">
        <div className="max-w-4xl">
          <ChatView 
            conversationId={selectedConversationId}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('messages')}</h1>
              <p className="text-gray-600 mt-1">View and manage all conversations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <div className="max-w-6xl">
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
