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
  <div className={`flex gap-3 ${align === "right" ? "justify-end" : ""}`}>
    {align === "left" && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
    <div className={`flex flex-col ${align === "right" ? "items-end" : ""} space-y-2 flex-1 max-w-[70%]`}>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-3 w-24" />
    </div>
    {align === "right" && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
  </div>
);

export const ChatView = ({ conversationId, onBack }: ChatViewProps) => {
  const { t, language } = useLanguage();
  console.log('👀 [ChatView] Rendering with conversationId:', conversationId);
  const { data: messages = [], isLoading } = useConversationsByGroupId(conversationId);
  const { data: analysis, isLoading: isLoadingAnalysis } = useAnalysisByConversationId(conversationId);
  console.log('📨 [ChatView] Messages received:', messages.length, 'messages');
  console.log('📊 [ChatView] Analysis received:', analysis);

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
    <Card className="h-full bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-xl shadow-gray-200/50 overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2 hover:bg-primary/10 transition-colors rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('conversationDetails')}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Hash className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-mono">{conversationId}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-semibold">
            {messages.length} {messages.length === 1 ? t('message') : t('messagesCount')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[calc(100vh-240px)] overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-gray-50/30 to-transparent">
          {isLoading ? (
            <div className="space-y-6">
              <MessageSkeleton align="left" />
              <MessageSkeleton align="right" />
              <MessageSkeleton align="left" />
              <MessageSkeleton align="right" />
            </div>
          ) : (
            messages.map((message, index) => (
            <div 
              key={getObjectIdString(message._id)} 
              className="space-y-5 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Customer Message (Inbound) */}
              <div className="flex gap-3 group">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-gray-700">{t('customerLabel')}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <div 
                    className={`relative p-4 rounded-2xl rounded-tl-sm bg-gradient-to-br from-blue-50 to-blue-100/80 text-gray-900 shadow-md border border-blue-200/50 group-hover:shadow-lg transition-all duration-300 ${
                      isArabic(message.inbound) ? 'text-right' : 'text-left'
                    }`}
                    dir={isArabic(message.inbound) ? 'rtl' : 'ltr'}
                  >
                    <div className="absolute -left-1 top-3 w-2 h-2 bg-blue-100 rotate-45 border-l border-t border-blue-200/50" />
                    <p className="leading-relaxed text-sm">{message.inbound}</p>
                  </div>
                </div>
              </div>

              {/* Sales Response (Outbound) */}
              <div className="flex gap-3 justify-end group">
                <div className="flex-1 max-w-[75%] flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-gray-700">{t('salesTeam')}</span>
                  </div>
                  <div 
                    className={`relative p-4 rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary/90 text-white shadow-md shadow-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-all duration-300 ${
                      isArabic(message.outbound) ? 'text-right' : 'text-left'
                    }`}
                    dir={isArabic(message.outbound) ? 'rtl' : 'ltr'}
                  >
                    <div className="absolute -right-1 top-3 w-2 h-2 bg-primary rotate-45" />
                    <p className="leading-relaxed text-sm">{message.outbound}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 ring-2 ring-white">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
          
          {!isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center py-20">
              <div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noMessagesYet')}</h3>
                <p className="text-gray-500 text-sm">{t('noMessagesFound')}</p>
              </div>
            </div>
          )}
          
          {/* Customer Analysis Section */}
          {!isLoading && messages.length > 0 && (
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-md border border-indigo-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-indigo-600 shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Customer Insights</h3>
                </div>
                
                {isLoadingAnalysis ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ) : analysis ? (
                  <div className="space-y-4">
                    {/* Summary */}
                    {analysis.summary && (
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">Summary</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
                      </div>
                    )}
                    
                    {/* Analysis */}
                    {analysis.analysis && (
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">Analysis</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
                      </div>
                    )}
                    
                    {/* Transition */}
                    {analysis.transition && (
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">Transition</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.transition}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-3">
                      <TrendingUp className="h-8 w-8 text-indigo-400" />
                    </div>
                    <p className="text-gray-600 text-sm">No analysis available for this conversation</p>
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