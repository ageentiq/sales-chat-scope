import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Clock } from "lucide-react";
import { ConversationMessage } from "@/data/mockData";
import { useUniqueConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
}

export const ConversationList = ({ 
  onConversationSelect, 
  selectedConversationId 
}: ConversationListProps) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: conversations = [], isLoading } = useUniqueConversations();
  
  // Fallback to ensure we always have data
  const safeConversations = conversations || [];
  
  const filteredConversations = safeConversations.filter(conv => 
    conv.conversation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.inbound.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.outbound.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          {t('conversations')}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchConversations')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading conversations...</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
            <div
              key={conversation.conversation_id}
              onClick={() => onConversationSelect(conversation.conversation_id)}
              className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedConversationId === conversation.conversation_id 
                  ? 'bg-primary/10 border-l-4 border-l-primary' 
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {conversation.conversation_id}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(conversation.timestamp)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">{t('customer')}: </span>
                  <span className="text-foreground" dir="auto">
                    {truncateText(conversation.inbound)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">{t('response')}: </span>
                  <span className="text-foreground" dir="auto">
                    {truncateText(conversation.outbound)}
                  </span>
                </div>
              </div>
            </div>
          ))
          )}
          
          {!isLoading && filteredConversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('noConversationsFound')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};