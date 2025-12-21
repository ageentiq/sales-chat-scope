import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Clock, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { ConversationMessage } from "@/data/mockData";
import { useUniqueConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { data: conversations = [], isLoading } = useUniqueConversations();
  
  // Fallback to ensure we always have data
  const safeConversations = conversations || [];
  
  // Parse timestamp safely and consistently across browsers.
  // If backend sends "YYYY-MM-DD HH:mm" (no timezone), assume it's UTC then display in user's local time.
  const parseTimestamp = (timestamp: string): Date => {
    const m = timestamp.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
    );

    if (m) {
      const [, y, mo, d, h, mi, s] = m;
      return new Date(
        Date.UTC(
          Number(y),
          Number(mo) - 1,
          Number(d),
          Number(h),
          Number(mi),
          s ? Number(s) : 0
        )
      );
    }

    // ISO strings with timezone (e.g. ...Z) will be handled correctly by Date().
    return new Date(timestamp);
  };

  // Sort by timestamp descending (newest first) and filter
  const filteredConversations = safeConversations
    .filter(conv => 
      conv.conversation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.inbound.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.outbound.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime());

  // Pagination logic
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConversations = filteredConversations.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseTimestamp(timestamp);
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
            onChange={(e) => handleSearchChange(e.target.value)}
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
              {paginatedConversations.map((conversation, index) => (
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
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-9 px-3 text-xs font-medium text-gray-600 hover:text-primary hover:bg-primary/10 disabled:opacity-40 transition-all"
            >
              {t('first')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 min-w-[36px] px-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary disabled:opacity-40 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-9 px-3 text-xs font-medium text-gray-600 hover:text-primary hover:bg-primary/10 disabled:opacity-40 transition-all"
            >
              {t('last')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};