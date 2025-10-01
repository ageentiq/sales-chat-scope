import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, User, Bot } from "lucide-react";
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
    return new Date(timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  const isArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>{t('conversationDetails')}</CardTitle>
          </div>
          <Badge variant="outline">ID: {conversationId}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[600px] overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : (
            messages.map((message) => (
            <div key={getObjectIdString(message._id)} className="space-y-4">
              {/* Customer Message (Inbound) */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-chat-inbound flex items-center justify-center">
                    <User className="h-4 w-4 text-chat-inbound-foreground" />
                  </div>
                </div>
                <div className="flex-1 max-w-[70%]">
                  <div 
                    className={`p-3 rounded-2xl rounded-tl-md bg-chat-inbound text-chat-inbound-foreground ${
                      isArabic(message.inbound) ? 'text-right' : 'text-left'
                    }`}
                    dir={isArabic(message.inbound) ? 'rtl' : 'ltr'}
                  >
                    {message.inbound}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>

              {/* Sales Response (Outbound) */}
              <div className="flex gap-3 justify-end">
                <div className="flex-1 max-w-[70%] flex flex-col items-end">
                  <div 
                    className={`p-3 rounded-2xl rounded-tr-md bg-chat-outbound text-chat-outbound-foreground ${
                      isArabic(message.outbound) ? 'text-right' : 'text-left'
                    }`}
                    dir={isArabic(message.outbound) ? 'rtl' : 'ltr'}
                  >
                    {message.outbound}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 px-1">
                    {t('salesTeam')} • {formatTimestamp(message.timestamp)}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-chat-outbound flex items-center justify-center">
                    <Bot className="h-4 w-4 text-chat-outbound-foreground" />
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
          
          {!isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('noMessagesFound')}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};