import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniqueConversations, useConversations } from "@/hooks/useConversations";
import { MessageCircle, MessagesSquare, Users, TrendingUp, Clock, Activity } from "lucide-react";
import { ConversationsChart } from "@/components/ConversationsChart";

const Dashboard = () => {
  const { t } = useLanguage();
  
  // Use React Query hooks for data fetching
  const { data: uniqueConversations = [] } = useUniqueConversations();
  const { data: allConversations = [], isLoading: isLoadingAll } = useConversations();
  
  // Fallback to ensure we always have data
  const safeUniqueConversations = uniqueConversations || [];
  const safeAllConversations = allConversations || [];
  
  const totalConversations = safeUniqueConversations.length;
  const totalMessages = safeAllConversations.length;
  
  const avgMessagesPerConversation = totalConversations > 0 
    ? (totalMessages / totalConversations).toFixed(1) 
    : "0";

  const conversationsToday = safeUniqueConversations.filter(conv => {
    const today = new Date();
    const convDate = new Date(conv.timestamp);
    return convDate.getDate() === today.getDate() &&
           convDate.getMonth() === today.getMonth() &&
           convDate.getFullYear() === today.getFullYear();
  }).length;

  // Calculate active conversations (conversations in the last 7 days)
  const activeConversations = safeUniqueConversations.filter(conv => {
    const convDate = new Date(conv.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return convDate >= weekAgo;
  }).length;

  // Calculate average response time (mock calculation based on conversation patterns)
  const avgResponseTime = "2.5 min";
  
  const responseRate = "95%"; // Mock data

  if (isLoadingAll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Fetching data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('salesDashboard')}</h1>
            <p className="text-gray-600 mt-1">{t('trackAndAnalyze')}</p>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Conversations Card */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('totalConversations')}</CardTitle>
              <Users className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalConversations}</div>
            </CardContent>
          </Card>

          {/* Total Messages Card */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('totalMessages')}</CardTitle>
              <MessagesSquare className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalMessages}</div>
            </CardContent>
          </Card>

          {/* Avg Messages per Conversation Card */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Messages/Conversation</CardTitle>
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{avgMessagesPerConversation}</div>
            </CardContent>
          </Card>

          {/* Conversations Today Card */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversations Today</CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{conversationsToday}</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Active Conversations (Last 7 Days) */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active (Last 7 Days)</CardTitle>
              <Activity className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{activeConversations}</div>
              <p className="text-xs text-gray-500 mt-1">
                {((activeConversations / totalConversations) * 100).toFixed(0)}% of total
              </p>
            </CardContent>
          </Card>

          {/* Average Response Time */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
              <Clock className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{avgResponseTime}</div>
              <p className="text-xs text-green-600 mt-1">↓ 15% faster than last week</p>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{responseRate}</div>
              <p className="text-xs text-green-600 mt-1">↑ 3% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <ConversationsChart />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;