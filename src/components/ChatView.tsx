import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, User, Bot, Calendar, Hash, TrendingUp, FileText, ArrowRightLeft } from "lucide-react";
import { useConversationsByGroupId, useAnalysisByConversationId } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { getObjectIdString } from "@/lib/utils";

interface ChatViewProps {
  conversationId: string;
  onBack: () => void;
}

// Message skeleton loader
const MessageSkeleton = ({ align = "left" }: { align?: "left" | "right" }) => (
  <div className={`flex gap-2 md:gap-3 ${align === "right" ? "justify-end" : ""}`}>
    {align === "left" && <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0" />}
    <div className={`flex flex-col ${align === "right" ? "items-end" : ""} space-y-2 flex-1 max-w-[80%] md:max-w-[70%]`}>
      <Skeleton className="h-16 md:h-20 w-full rounded-2xl" />
      <Skeleton className="h-3 w-20 md:w-24" />
    </div>
    {align === "right" && <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0" />}
  </div>
);

export const ChatView = ({ conversationId, onBack }: ChatViewProps) => {
  const { t, language } = useLanguage();
  console.log('👀 [ChatView] Rendering with conversationId:', conversationId);
  const { data: rawMessages = [], isLoading } = useConversationsByGroupId(conversationId);
  const { data: analysis, isLoading: isLoadingAnalysis } = useAnalysisByConversationId(conversationId);
  
  // Parse timestamp safely and consistently across browsers.
  // If backend sends "YYYY-MM-DD HH:mm" (no timezone), treat it as LOCAL time.
  const parseTimestamp = (timestamp: string): Date => {
    const m = timestamp.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
    );

    if (m) {
      const [, y, mo, d, h, mi, s] = m;
      return new Date(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi),
        s ? Number(s) : 0
      );
    }

    // ISO strings with timezone (e.g. ...Z) will be handled correctly by Date().
    return new Date(timestamp);
  };

  // Sort messages by timestamp ascending (oldest first for chat view)
  const messages = [...rawMessages].sort((a, b) =>
    parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime()
  );
  
  console.log('📨 [ChatView] Messages received:', messages.length, 'messages');
  console.log('📊 [ChatView] Analysis received:', analysis);

  const formatTimestamp = (timestamp: string) => {
    return parseTimestamp(timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
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
    <Card className="h-full bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-xl shadow-gray-200/50 overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 sticky top-0 z-10 backdrop-blur-md bg-white/90 p-3 md:p-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-1.5 md:p-2 hover:bg-primary/10 transition-colors rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm md:text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('conversationDetails')}
              </CardTitle>
              <div className="flex items-center gap-1 md:gap-2 mt-0.5 md:mt-1">
                <Hash className="h-2.5 w-2.5 md:h-3 md:w-3 text-gray-400 flex-shrink-0" />
                <span className="text-[10px] md:text-xs text-gray-500 font-mono truncate">{conversationId}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-semibold flex-shrink-0">
            {messages.length} {messages.length === 1 ? t('message') : t('messagesCount')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-240px)] overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 custom-scrollbar bg-gradient-to-b from-gray-50/30 to-transparent">
          {isLoading ? (
            <div className="space-y-4 md:space-y-6">
              <MessageSkeleton align="left" />
              <MessageSkeleton align="right" />
              <MessageSkeleton align="left" />
              <MessageSkeleton align="right" />
            </div>
          ) : (
            messages.map((message, index) => (
            <div 
              key={getObjectIdString(message._id)} 
              className="space-y-3 md:space-y-5 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Customer Message (Inbound) */}
              <div className="flex gap-2 md:gap-3 group">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 max-w-[85%] md:max-w-[75%]">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-1.5">
                    <span className="text-[10px] md:text-xs font-semibold text-gray-700">{t('customerLabel')}</span>
                    <span className="text-[10px] md:text-xs text-gray-400">•</span>
                    <span className="text-[10px] md:text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <div 
                    className={`relative p-3 md:p-4 rounded-2xl rounded-tl-sm bg-gradient-to-br from-blue-50 to-blue-100/80 text-gray-900 shadow-md border border-blue-200/50 group-hover:shadow-lg transition-all duration-300 ${
                      isArabic(message.inbound) ? 'text-right' : 'text-left'
                    }`}
                    dir={isArabic(message.inbound) ? 'rtl' : 'ltr'}
                  >
                    <div className="absolute -left-1 top-3 w-2 h-2 bg-blue-100 rotate-45 border-l border-t border-blue-200/50 hidden md:block" />
                    <p className="leading-relaxed text-xs md:text-sm">{message.inbound}</p>
                  </div>
                </div>
              </div>

              {/* Sales Response (Outbound) */}
              <div className="flex gap-2 md:gap-3 justify-end group">
                <div className="flex-1 max-w-[85%] md:max-w-[75%] flex flex-col items-end">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-1.5">
                    <span className="text-[10px] md:text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                    <span className="text-[10px] md:text-xs text-gray-400">•</span>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-700">{t('salesTeam')}</span>
                  </div>
                  <div 
                    className={`relative p-3 md:p-4 rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary/90 text-white shadow-md shadow-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-all duration-300 ${
                      isArabic(message.outbound) ? 'text-right' : 'text-left'
                    }`}
                    dir={isArabic(message.outbound) ? 'rtl' : 'ltr'}
                  >
                    <div className="absolute -right-1 top-3 w-2 h-2 bg-primary rotate-45 hidden md:block" />
                    <p className="leading-relaxed text-xs md:text-sm">{message.outbound}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 ring-2 ring-white">
                    <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
          
          {!isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center py-12 md:py-20">
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-gray-100 mb-3 md:mb-4">
                  <MessageSquare className="h-7 w-7 md:h-10 md:w-10 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">{t('noMessagesYet')}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{t('noMessagesFound')}</p>
              </div>
            </div>
          )}
          
          {/* Customer Analysis Section */}
          {!isLoading && messages.length > 0 && (
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t-2 border-gray-200">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-indigo-100">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="p-1.5 md:p-2 rounded-lg bg-indigo-600 shadow-md">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-gray-900">Customer Insights</h3>
                </div>
                
                {isLoadingAnalysis ? (
                  <div className="space-y-3 md:space-y-4">
                    <Skeleton className="h-20 md:h-24 w-full rounded-lg" />
                    <Skeleton className="h-20 md:h-24 w-full rounded-lg" />
                    <Skeleton className="h-20 md:h-24 w-full rounded-lg" />
                  </div>
                ) : analysis ? (
                  <div className="space-y-3 md:space-y-4">
                    {/* Summary */}
                    {analysis.summary && (
                      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600" />
                          <h4 className="text-sm md:text-base font-semibold text-gray-900">Summary</h4>
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
                      </div>
                    )}
                    
                    {/* Analysis */}
                    {analysis.analysis && (
                      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600" />
                          <h4 className="text-sm md:text-base font-semibold text-gray-900">Analysis</h4>
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
                      </div>
                    )}
                    
                    {/* Transition */}
                    {analysis.transition && (
                      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <ArrowRightLeft className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600" />
                          <h4 className="text-sm md:text-base font-semibold text-gray-900">Transition</h4>
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.transition}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-indigo-100 mb-2 md:mb-3">
                      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-indigo-400" />
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm">No analysis available for this conversation</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
