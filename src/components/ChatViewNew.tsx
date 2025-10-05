import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  User, 
  Bot
} from "lucide-react";
import { useConversationsByGroupId } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { getObjectIdString } from "@/lib/utils";

interface ChatViewProps {
  conversationId: string;
  onBack: () => void;
}

export const ChatView = ({ conversationId, onBack }: ChatViewProps) => {
  const { t, language } = useLanguage();
  const { data: messages = [], isLoading } = useConversationsByGroupId(conversationId);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No messages found</h3>
          <p className="text-slate-500 dark:text-slate-400">{t('noMessagesFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800">
      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto flex flex-col-reverse">
          {messages.map((message, index) => {
            const isCustomer = true; // All messages are customer messages in this data structure
            const isArabicText = isArabic(message.inbound);
            
            return (
              <div key={getObjectIdString(message._id)} className="flex gap-3">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCustomer 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  {isCustomer ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                      {isCustomer ? 'Customer' : t('salesTeam')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatTimestamp(message.timestamp)}
                    </Badge>
                  </div>

                  {/* Customer Message */}
                  <div className={`mb-3 p-3 rounded-lg max-w-2xl ${
                    isCustomer 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  }`}>
                    <p 
                      className={`text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap ${
                        isArabicText ? 'text-right' : 'text-left'
                      }`}
                      dir={isArabicText ? 'rtl' : 'ltr'}
                    >
                      {message.inbound}
                    </p>
                  </div>

                  {/* Response Message */}
                  {message.outbound && (
                    <div className="mb-3 p-3 rounded-lg max-w-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {t('salesTeam')} Response
                        </span>
                      </div>
                      <p 
                        className={`text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap ${
                          isArabic(message.outbound) ? 'text-right' : 'text-left'
                        }`}
                        dir={isArabic(message.outbound) ? 'rtl' : 'ltr'}
                      >
                        {message.outbound}
                      </p>
                    </div>
                  )}

                  {/* Media Attachment */}
                  {message.media && (
                    <div className="mt-2">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded border">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          📎 Media attachment
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
