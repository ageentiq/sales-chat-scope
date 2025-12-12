import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Clock, TrendingUp, Inbox } from "lucide-react";
import { ConversationMessage } from "@/data/mockData";
import { useUniqueConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
}

// Skeleton loader for conversation items
const ConversationSkeleton = () => (
  <div className="p-3 md:p-5 space-y-2 md:space-y-3 border-b border-gray-100">
    <div className="flex items-start justify-between">
      <Skeleton className="h-4 md:h-5 w-20 md:w-24" />
      <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 md:h-4 w-full" />
      <Skeleton className="h-3 md:h-4 w-3/4" />
    </div>
  </div>
);

export const ConversationList = ({ 
  onConversationSelect, 
  selectedConversationId 
}: ConversationListProps) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: conversations = [], isLoading } = useUniqueConversations();
  
  // Fallback to ensure we always have data
  const safeConversations = conversations || [];
  
  // Sort by timestamp descending (newest first) and filter
  const filteredConversations = safeConversations
    .filter(conv => 
      conv.conversation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.inbound.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.outbound.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // Less than 7 days
      return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <Card className="h-full bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-xl shadow-gray-200/50 overflow-hidden">
      <CardHeader className="pb-3 md:pb-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 px-3 md:px-6 pt-3 md:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-xl">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('conversations')}
            </span>
          </CardTitle>
          {!isLoading && safeConversations.length > 0 && (
            <Badge variant="secondary" className="px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-semibold">
              {filteredConversations.length} {filteredConversations.length === 1 ? t('conversation') : t('conversations')}
            </Badge>
          )}
        </div>
        <div className="relative mt-3 md:mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder={t('searchConversations')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all text-sm md:text-base"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <ConversationSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.conversation_id}
                  onClick={() => {
                    console.log('🖱️ [ConversationList] Conversation clicked:', conversation.conversation_id);
                    console.log('📋 [ConversationList] Full conversation object:', conversation);
                    onConversationSelect(conversation.conversation_id);
                  }}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`group relative p-3 md:p-5 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent animate-in fade-in slide-in-from-left-4 ${
                    selectedConversationId === conversation.conversation_id 
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-l-primary shadow-inner' 
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Hover indicator */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top hidden md:block" />
                  
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <Badge 
                      variant="outline" 
                      className="text-[10px] md:text-xs border-gray-300 bg-white/50 font-mono px-1.5 md:px-2 py-0.5 md:py-1 hover:bg-primary/10 transition-colors truncate max-w-[120px] md:max-w-none"
                    >
                      #{conversation.conversation_id}
                    </Badge>
                    <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-gray-500 bg-gray-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
                      <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {formatTimestamp(conversation.timestamp)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-2.5">
                    <div className="text-xs md:text-sm">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-500" />
                        <span className="font-semibold text-gray-700 text-[10px] md:text-xs uppercase tracking-wide">{t('customer')}</span>
                      </div>
                      <p className="text-gray-900 leading-relaxed pl-2.5 md:pl-3.5 line-clamp-2" dir="auto">
                        {truncateText(conversation.inbound, 60)}
                      </p>
                    </div>
                    <div className="text-xs md:text-sm">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500" />
                        <span className="font-semibold text-gray-700 text-[10px] md:text-xs uppercase tracking-wide">{t('response')}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed pl-2.5 md:pl-3.5 line-clamp-2" dir="auto">
                        {truncateText(conversation.outbound, 60)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && filteredConversations.length === 0 && (
            <div className="p-8 md:p-16 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-gray-100 mb-3 md:mb-4">
                <Inbox className="h-7 w-7 md:h-10 md:w-10 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
                {searchTerm ? t('noMatchesFound') : t('noConversationsYet')}
              </h3>
              <p className="text-gray-500 text-xs md:text-sm">
                {searchTerm 
                  ? t('tryAdjustingSearch') 
                  : t('startConversationToSee')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};