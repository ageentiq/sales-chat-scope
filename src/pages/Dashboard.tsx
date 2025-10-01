import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ConversationList } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniqueConversations, useConversations, useDataMode } from "@/hooks/useConversations";
import { 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Clock,
  BarChart3
} from "lucide-react";

const Dashboard = () => {
  const { t } = useLanguage();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  // Use React Query hooks for data fetching
  const { data: uniqueConversations = [], isLoading: isLoadingUnique, error: errorUnique } = useUniqueConversations();
  const { data: allConversations = [], isLoading: isLoadingAll, error: errorAll } = useConversations();
  const dataMode = useDataMode();
  
  // Fallback to ensure we always have data
  const safeUniqueConversations = uniqueConversations || [];
  const safeAllConversations = allConversations || [];
  
  
  const totalConversations = safeUniqueConversations.length;
  const totalMessages = safeAllConversations.length;
  const activeToday = safeUniqueConversations.filter(conv => 
    new Date(conv.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const avgResponseTime = "2.3 min";

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  // Simple fallback for debugging
  if (isLoadingUnique && isLoadingAll) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Fetching conversation data...</p>
        </div>
      </div>
    );
  }

  if (selectedConversationId) {
    return (
      <div className="min-h-screen bg-background py-6 pl-6 pr-6">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="pl-6 pr-6 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('salesDashboard')}</h1>
              <p className="text-muted-foreground">{t('trackAndAnalyze')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="pl-6 pr-6 py-6">
             {/* Connection Status */}
             <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${dataMode === 'mongodb' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                   <span className="text-sm font-medium">
                     Data Source: {dataMode === 'mongodb' ? 'MongoDB Atlas' : 'Mock Data'}
                   </span>
                 </div>
                 <div className="text-sm text-gray-600">
                   Auto-refresh: Every 30 seconds
                 </div>
               </div>
               {errorUnique || errorAll ? (
                 <div className="mt-2 text-sm text-red-600">
                   Connection error: {errorUnique?.message || errorAll?.message}
                 </div>
               ) : (
                 <div className="mt-2 text-sm text-green-600">
                   Status: {isLoadingUnique || isLoadingAll ? 'Loading...' : 'Connected'}
                   <span className="ml-4">
                     Conversations: {safeUniqueConversations.length} | Messages: {safeAllConversations.length}
                   </span>
                 </div>
               )}
             </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title={t('totalConversations')}
            value={totalConversations}
            icon={MessageCircle}
            trend={`+12% ${t('fromLastWeek')}`}
            variant="info"
          />
          <MetricCard
            title={t('totalMessages')}
            value={totalMessages}
            icon={Users}
            trend={`+8% ${t('fromLastWeek')}`}
            variant="success"
          />
          <MetricCard
            title={t('activeToday')}
            value={activeToday}
            icon={TrendingUp}
            trend={t('updatedLive')}
            variant="warning"
          />
          <MetricCard
            title={t('avgResponseTime')}
            value={avgResponseTime}
            icon={Clock}
            trend={`-15% ${t('improvement')}`}
            variant="default"
          />
        </div>

        {/* Conversation List */}
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

export default Dashboard;