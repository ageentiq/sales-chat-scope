import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniqueConversations, useConversations, useTransitionStats } from "@/hooks/useConversations";
import { MessageCircle, MessagesSquare, Users, TrendingUp, Clock, Activity, Info, PhoneOff, Star, ThumbsDown, Briefcase } from "lucide-react";
import { ConversationsChart } from "@/components/ConversationsChart";

const Dashboard = () => {
  const { t } = useLanguage();
  
  // Use React Query hooks for data fetching
  const { data: uniqueConversations = [] } = useUniqueConversations();
  const { data: allConversations = [], isLoading: isLoadingAll } = useConversations();
  const { data: transitionStats } = useTransitionStats();
  
  // Fallback to ensure we always have data
  const safeUniqueConversations = uniqueConversations || [];
  const safeAllConversations = allConversations || [];
  
  const totalConversations = safeUniqueConversations.length;
  const totalMessages = safeAllConversations.length;
  
  // Calculate conversation message counts for active filtering
  const conversationMessageCounts: Record<string, number> = {};
  safeAllConversations.forEach(message => {
    if (!conversationMessageCounts[message.conversation_id]) {
      conversationMessageCounts[message.conversation_id] = 0;
    }
    conversationMessageCounts[message.conversation_id]++;
  });
  
  // Active conversations = conversations with 2+ messages
  const activeConversationIds = new Set(
    Object.entries(conversationMessageCounts)
      .filter(([_, count]) => count >= 2)
      .map(([id]) => id)
  );
  const totalActiveConversations = activeConversationIds.size;
  
  // Calculate Avg Messages per Conversation with trend analysis
  const calculateAvgMessagesPerConversation = () => {
    if (totalConversations === 0) {
      return { avg: 0, avgFormatted: "0", trend: 0 };
    }

    const currentAvg = totalMessages / totalConversations;

    // Calculate trend: compare last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Group messages and conversations by time period
    const lastWeekMessages = safeAllConversations.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate >= sevenDaysAgo;
    });

    const lastWeekConversations = new Set(
      lastWeekMessages.map(msg => msg.conversation_id)
    );

    const prevWeekMessages = safeAllConversations.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate >= fourteenDaysAgo && msgDate < sevenDaysAgo;
    });

    const prevWeekConversations = new Set(
      prevWeekMessages.map(msg => msg.conversation_id)
    );

    const lastWeekAvg = lastWeekConversations.size > 0
      ? lastWeekMessages.length / lastWeekConversations.size
      : 0;

    const prevWeekAvg = prevWeekConversations.size > 0
      ? prevWeekMessages.length / prevWeekConversations.size
      : 0;

    // Calculate percentage change (positive means more engagement)
    const trend = prevWeekAvg > 0
      ? ((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100
      : 0;

    return {
      avg: currentAvg,
      avgFormatted: currentAvg.toFixed(1),
      trend,
      lastWeekAvg,
      prevWeekAvg
    };
  };

  const {
    avgFormatted: avgMessagesPerConversation,
    trend: avgMessagesTrend,
    lastWeekAvg: lastWeekMsgAvg,
    prevWeekAvg: prevWeekMsgAvg
  } = calculateAvgMessagesPerConversation();

  const avgMessagesTrendFormatted = avgMessagesTrend !== 0
    ? `${Math.abs(avgMessagesTrend).toFixed(1)}%`
    : "0%";
  const avgMessagesTrendIcon = avgMessagesTrend >= 0 ? '↑' : '↓';
  const avgMessagesTrendColor = avgMessagesTrend >= 0 ? 'text-green-600' : 'text-red-600';
  const avgMessagesTrendText = avgMessagesTrend >= 0 ? 'moreEngagement' : 'lessEngagement';

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

  // Calculate average response time based on time between messages in a conversation
  // Returns both all conversations and active-only (2+ messages) stats
  const calculateAvgResponseTime = () => {
    const responseTimes: number[] = [];
    const activeResponseTimes: number[] = [];
    
    // Group messages by conversation_id
    const conversationGroups: Record<string, typeof safeAllConversations> = {};
    safeAllConversations.forEach(message => {
      if (!conversationGroups[message.conversation_id]) {
        conversationGroups[message.conversation_id] = [];
      }
      conversationGroups[message.conversation_id].push(message);
    });

    // For each conversation, calculate response times between consecutive messages
    Object.entries(conversationGroups).forEach(([convId, messages]) => {
      const isActive = activeConversationIds.has(convId);
      
      // Sort messages by timestamp
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Calculate time between consecutive messages
      for (let i = 0; i < sortedMessages.length - 1; i++) {
        const currentMsg = sortedMessages[i];
        const nextMsg = sortedMessages[i + 1];
        
        const timeDiff = new Date(nextMsg.timestamp).getTime() - new Date(currentMsg.timestamp).getTime();
        const minutesDiff = timeDiff / (1000 * 60); // Convert to minutes
        
        // Only include reasonable response times (> 0 and < 24 hours)
        if (minutesDiff > 0 && minutesDiff < 1440) {
          responseTimes.push(minutesDiff);
          if (isActive) {
            activeResponseTimes.push(minutesDiff);
          }
        }
      }
    });

    const formatTime = (avgMinutes: number): string => {
      if (avgMinutes === 0) return "0 min";
      if (avgMinutes < 1) {
        return `${Math.round(avgMinutes * 60)} sec`;
      } else if (avgMinutes < 60) {
        return `${avgMinutes.toFixed(1)} min`;
      } else {
        const hours = Math.floor(avgMinutes / 60);
        const mins = Math.round(avgMinutes % 60);
        return `${hours}h ${mins}m`;
      }
    };

    const avgMinutes = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    const activeAvgMinutes = activeResponseTimes.length > 0
      ? activeResponseTimes.reduce((sum, time) => sum + time, 0) / activeResponseTimes.length
      : 0;

    // Calculate trend: compare last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const lastWeekTimes: number[] = [];
    const prevWeekTimes: number[] = [];

    Object.values(conversationGroups).forEach(messages => {
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      for (let i = 0; i < sortedMessages.length - 1; i++) {
        const currentMsg = sortedMessages[i];
        const nextMsg = sortedMessages[i + 1];
        const msgDate = new Date(nextMsg.timestamp);
        
        const timeDiff = new Date(nextMsg.timestamp).getTime() - new Date(currentMsg.timestamp).getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        if (minutesDiff > 0 && minutesDiff < 1440) {
          if (msgDate >= sevenDaysAgo) {
            lastWeekTimes.push(minutesDiff);
          } else if (msgDate >= fourteenDaysAgo && msgDate < sevenDaysAgo) {
            prevWeekTimes.push(minutesDiff);
          }
        }
      }
    });

    const lastWeekAvg = lastWeekTimes.length > 0 
      ? lastWeekTimes.reduce((sum, time) => sum + time, 0) / lastWeekTimes.length 
      : 0;
    
    const prevWeekAvg = prevWeekTimes.length > 0 
      ? prevWeekTimes.reduce((sum, time) => sum + time, 0) / prevWeekTimes.length 
      : 0;

    // Calculate percentage change (negative means faster/better)
    const trend = prevWeekAvg > 0 
      ? ((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100 
      : 0;

    return { 
      avgTime: avgMinutes, 
      avgTimeFormatted: formatTime(avgMinutes),
      activeAvgTime: activeAvgMinutes,
      activeAvgTimeFormatted: formatTime(activeAvgMinutes),
      trend 
    };
  };

  const { 
    avgTimeFormatted: avgResponseTime, 
    activeAvgTimeFormatted: activeAvgResponseTime,
    trend: avgResponseTimeTrend 
  } = calculateAvgResponseTime();
  const avgResponseTimeTrendFormatted = avgResponseTimeTrend !== 0
    ? `${Math.abs(avgResponseTimeTrend).toFixed(1)}%`
    : "0%";
  const avgResponseTimeTrendIcon = avgResponseTimeTrend <= 0 ? '↓' : '↑';
  const avgResponseTimeTrendColor = avgResponseTimeTrend <= 0 ? 'text-green-600' : 'text-red-600';
  const avgResponseTimeTrendText = avgResponseTimeTrend <= 0 ? 'fasterThanLastWeek' : 'slowerThanLastWeek';
  
  // Calculate Response Rate: percentage of conversations where the customer replied (has 2+ messages)
  // For "all": uses all conversations as denominator
  // For "active": this is always 100% by definition, so we show the count instead
  const calculateResponseRate = () => {
    if (totalConversations === 0) return { rate: 0, activeCount: 0, trend: 0 };

    // Count conversations with at least 2 messages (customer responded)
    const conversationsWithResponse = Object.values(conversationMessageCounts)
      .filter(count => count >= 2).length;

    const currentRate = (conversationsWithResponse / totalConversations) * 100;

    // Calculate trend: compare today vs yesterday
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    // Group by time period
    const todayCounts: Record<string, number> = {};
    const yesterdayCounts: Record<string, number> = {};

    safeAllConversations.forEach(message => {
      const msgDate = new Date(message.timestamp);
      
      if (msgDate >= todayStart) {
        if (!todayCounts[message.conversation_id]) {
          todayCounts[message.conversation_id] = 0;
        }
        todayCounts[message.conversation_id]++;
      } else if (msgDate >= yesterdayStart && msgDate < todayStart) {
        if (!yesterdayCounts[message.conversation_id]) {
          yesterdayCounts[message.conversation_id] = 0;
        }
        yesterdayCounts[message.conversation_id]++;
      }
    });

    const todayTotal = Object.keys(todayCounts).length;
    const todayWithResponse = Object.values(todayCounts).filter(count => count >= 2).length;
    const todayRate = todayTotal > 0 ? (todayWithResponse / todayTotal) * 100 : 0;

    const yesterdayTotal = Object.keys(yesterdayCounts).length;
    const yesterdayWithResponse = Object.values(yesterdayCounts).filter(count => count >= 2).length;
    const yesterdayRate = yesterdayTotal > 0 ? (yesterdayWithResponse / yesterdayTotal) * 100 : 0;

    const trend = yesterdayRate > 0 ? todayRate - yesterdayRate : 0;

    return { rate: currentRate, activeCount: conversationsWithResponse, trend };
  };

  const { rate: responseRateValue, trend: responseRateTrend } = calculateResponseRate();
  const responseRate = `${responseRateValue.toFixed(0)}%`;
  const responseRateTrendFormatted = responseRateTrend >= 0 
    ? `↑ ${Math.abs(responseRateTrend).toFixed(1)}%`
    : `↓ ${Math.abs(responseRateTrend).toFixed(1)}%`;
  const responseRateTrendColor = responseRateTrend >= 0 ? 'text-green-600' : 'text-red-600';

  if (isLoadingAll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">{t('loadingDashboard')}</h2>
          <p className="text-gray-600">{t('fetchingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 md:px-8 py-4 md:py-6">
            <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">{t('salesDashboard')}</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">{t('trackAndAnalyze')}</p>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-4 md:py-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          {/* Total Conversations Card - Dual Stats */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{t('totalConversations')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 md:h-4 md:w-4 text-gray-400 cursor-help hidden md:block" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('activeConversationsTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="flex items-baseline gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">{t('all')}</span>
                  <span className="text-xl md:text-2xl font-bold text-gray-900">{totalConversations}</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-primary uppercase tracking-wide font-medium">{t('active')}</span>
                  <span className="text-xl md:text-2xl font-bold text-primary">{totalActiveConversations}</span>
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2">
                {((totalActiveConversations / totalConversations) * 100 || 0).toFixed(0)}% {t('responseRate').toLowerCase()}
              </p>
            </CardContent>
          </Card>

          {/* Total Messages Card */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{t('totalMessages')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 md:h-4 md:w-4 text-gray-400 cursor-help hidden md:block" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('totalMessagesTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <MessagesSquare className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalMessages}</div>
            </CardContent>
          </Card>

          {/* Avg Messages per Conversation Card */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{t('avgMessagesPerConversation')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 md:h-4 md:w-4 text-gray-400 cursor-help hidden md:block" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('avgMessagesPerConversationTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{avgMessagesPerConversation}</div>
              {avgMessagesTrend !== 0 && (
                <p className={`text-[10px] md:text-xs ${avgMessagesTrendColor} mt-1`}>
                  {avgMessagesTrendIcon} {avgMessagesTrendFormatted} {t(avgMessagesTrendText)}
                </p>
              )}
              {lastWeekMsgAvg > 0 && prevWeekMsgAvg > 0 && (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1 hidden md:block">
                  {t('lastWeek')}: {lastWeekMsgAvg.toFixed(1)} | {t('prevWeek')}: {prevWeekMsgAvg.toFixed(1)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Conversations Today Card */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{t('conversationsToday')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 md:h-4 md:w-4 text-gray-400 cursor-help hidden md:block" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('conversationsTodayTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{conversationsToday}</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          {/* Active Conversations (Last 7 Days) */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{t('activeLastSevenDays')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 md:h-4 md:w-4 text-gray-400 cursor-help hidden md:block" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('activeLastSevenDaysTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Activity className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{activeConversations}</div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                {((activeConversations / totalConversations) * 100).toFixed(0)}% {t('ofTotal')}
              </p>
            </CardContent>
          </Card>

          {/* Average Response Time - Dual Stats */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{t('avgResponseTimeFull')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 md:h-4 md:w-4 text-gray-400 cursor-help hidden md:block" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('avgResponseTimeTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="flex items-baseline gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">{t('all')}</span>
                  <span className="text-lg md:text-xl font-bold text-gray-900">{avgResponseTime}</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-primary uppercase tracking-wide font-medium">{t('active')}</span>
                  <span className="text-lg md:text-xl font-bold text-primary">{activeAvgResponseTime}</span>
                </div>
              </div>
              {avgResponseTimeTrend !== 0 && (
                <p className={`text-[10px] md:text-xs ${avgResponseTimeTrendColor} mt-2`}>
                  {avgResponseTimeTrendIcon} {avgResponseTimeTrendFormatted} {t(avgResponseTimeTrendText)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Response Rate - Dual Stats */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{t('responseRate')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 md:h-4 md:w-4 text-gray-400 cursor-help hidden md:block" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('responseRateTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="flex items-baseline gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">{t('all')}</span>
                  <span className="text-xl md:text-2xl font-bold text-gray-900">{responseRate}</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-primary uppercase tracking-wide font-medium">{t('active')}</span>
                  <span className="text-xl md:text-2xl font-bold text-primary">{totalActiveConversations}</span>
                </div>
              </div>
              <p className={`text-[10px] md:text-xs ${responseRateTrendColor} mt-2`}>
                {responseRateTrendFormatted} {t('fromYesterday')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transition Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* No Response */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                <span className="block">No Response</span>
                <span className="block text-[10px] md:text-xs text-gray-400">لم يتم الرد</span>
              </CardTitle>
              <PhoneOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-4 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{transitionStats?.noResponse || 0}</div>
              {transitionStats?.total ? (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {((transitionStats.noResponse / transitionStats.total) * 100).toFixed(0)}% {t('ofTotal')}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Future Interest */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                <span className="block">Future Interest</span>
                <span className="block text-[10px] md:text-xs text-gray-400">مهتم بالمراحل القادمة</span>
              </CardTitle>
              <Star className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-4 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{transitionStats?.futureInterest || 0}</div>
              {transitionStats?.total ? (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {((transitionStats.futureInterest / transitionStats.total) * 100).toFixed(0)}% {t('ofTotal')}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Not Interested */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                <span className="block">Not Interested</span>
                <span className="block text-[10px] md:text-xs text-gray-400">غير مهتم</span>
              </CardTitle>
              <ThumbsDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-4 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{transitionStats?.notInterested || 0}</div>
              {transitionStats?.total ? (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {((transitionStats.notInterested / transitionStats.total) * 100).toFixed(0)}% {t('ofTotal')}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Create Prospect */}
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                <span className="block">Create Prospect</span>
                <span className="block text-[10px] md:text-xs text-gray-400">إنشاء صفقة</span>
              </CardTitle>
              <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-4 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{transitionStats?.createProspect || 0}</div>
              {transitionStats?.total ? (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {((transitionStats.createProspect / transitionStats.total) * 100).toFixed(0)}% {t('ofTotal')}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <ConversationsChart />
        </div>
      </main>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;