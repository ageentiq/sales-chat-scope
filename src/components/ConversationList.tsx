import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, Inbox, ChevronLeft, ChevronRight, User, Bot, Check, CheckCheck, AlertCircle } from "lucide-react";
import { MessageStatus } from "@/data/mockData";
import { useUniqueConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getMessageTimeMs } from "@/lib/timestamps";

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
}

// Status indicator component
const StatusIndicator = ({ status, t }: { status?: MessageStatus; t: (key: string) => string }) => {
  if (!status) return null;
  
  const statusConfig = {
    sent: { icon: Check, color: "text-gray-400", bg: "bg-gray-100", label: t('statusSent') },
    delivered: { icon: CheckCheck, color: "text-emerald-500", bg: "bg-emerald-50", label: t('statusDelivered') },
    read: { icon: CheckCheck, color: "text-blue-500", bg: "bg-blue-50", label: t('statusRead') },
    failed: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: t('statusFailed') },
  };
  
  const config = statusConfig[status] || statusConfig.sent;
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${config.bg}`}>
      <Icon className={`h-3 w-3 ${config.color}`} />
      <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
};

// Skeleton loader for conversation items
const ConversationSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-14" />
    </div>
    <div className="pl-13 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
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
  
  const safeConversations = conversations || [];

  const filteredConversations = safeConversations
    .filter(conv => {
      const searchLower = searchTerm.toLowerCase();
      const conversationId = conv.conversation_id?.toLowerCase() || '';
      const inbound = conv.inbound?.toLowerCase() || '';
      const outbound = conv.outbound?.toLowerCase() || '';
      return conversationId.includes(searchLower) ||
        inbound.includes(searchLower) ||
        outbound.includes(searchLower);
    })
    .sort((a, b) => getMessageTimeMs(b) - getMessageTimeMs(a));

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConversations = filteredConversations.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatTimestamp = (input: { timestamp?: string | null; latestTimestamp?: number | null }) => {
    const time = getMessageTimeMs(input);
    if (!Number.isFinite(time) || time === 0) return "";
    
    const date = new Date(time);
    const now = new Date();
    const diffInHours = (now.getTime() - time) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) {
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

  const truncateText = (text: string | null | undefined, maxLength: number = 80) => {
    const safeText = text ?? "";
    return safeText.length > maxLength ? safeText.substring(0, maxLength) + "..." : safeText;
  };

  return (
    <Card className="h-full bg-white border-0 shadow-lg shadow-gray-200/60 overflow-hidden rounded-2xl">
      {/* Header */}
      <CardHeader className="pb-4 border-b border-gray-100/80 bg-white px-4 md:px-6 pt-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('conversations')}</h2>
              {!isLoading && safeConversations.length > 0 && (
                <p className="text-xs text-gray-500">{filteredConversations.length} {t('total')}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder={t('searchConversations')}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm placeholder:text-gray-400"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-300px)] overflow-y-auto">
          {isLoading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <ConversationSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {paginatedConversations.map((conversation, index) => (
                <div
                  key={conversation.conversation_id}
                  onClick={() => {
                    console.log('🖱️ [ConversationList] Conversation clicked:', conversation.conversation_id);
                    onConversationSelect(conversation.conversation_id);
                  }}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className={`group relative cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
                    selectedConversationId === conversation.conversation_id 
                      ? 'bg-primary/5' 
                      : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Selected indicator */}
                  {selectedConversationId === conversation.conversation_id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                  )}
                  
                  <div className="p-4 md:p-5">
                    {/* Top row: Avatar, ID, Time */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            #{conversation.conversation_id}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{formatTimestamp(conversation)}</span>
                            {conversation.latestStatus && (
                              <StatusIndicator status={conversation.latestStatus} t={t} />
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    
                    {/* Message preview */}
                    <div className="space-y-2.5 pl-13">
                      {/* Customer message */}
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-1" dir="auto">
                          {truncateText(conversation.inbound, 50)}
                        </p>
                      </div>
                      
                      {/* Response */}
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="h-3 w-3 text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-1" dir="auto">
                          {truncateText(conversation.outbound, 50)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && filteredConversations.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                <Inbox className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {searchTerm ? t('noMatchesFound') : t('noConversationsYet')}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm 
                  ? t('tryAdjustingSearch') 
                  : t('startConversationToSee')}
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 px-4 py-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-40"
            >
              {t('first')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 mx-1">
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
                    className={`h-8 min-w-[32px] px-2.5 rounded-lg text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
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
              className="h-8 w-8 rounded-lg hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-40"
            >
              {t('last')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
