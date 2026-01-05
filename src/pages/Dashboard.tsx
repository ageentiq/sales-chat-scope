import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniqueConversations, useConversations, useTransitionStats } from "@/hooks/useConversations";
import { MessageCircle, Users, Clock, PhoneOff, Star, ThumbsDown, Briefcase, TrendingUp, CheckCheck, Target } from "lucide-react";
import { DateFilter, DateFilterOption, DateRange, getDateRangeForOption } from "@/components/DateFilter";
import { getMessageTimeMs } from "@/lib/timestamps";
import { ExportButton } from "@/components/ExportButton";
import { exportConversations, exportMessages, exportSummaryStats, exportMessageStatus, ExportResult } from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";
import { KPITile } from "@/components/dashboard/KPITile";
import { KPIRow } from "@/components/dashboard/KPIRow";
import { CompareToggle } from "@/components/dashboard/CompareToggle";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { DiagnosticsPanel } from "@/components/dashboard/DiagnosticsPanel";
import { StakeholderSummary } from "@/components/dashboard/StakeholderSummary";
import { useDashboardMetrics, formatResponseTime } from "@/hooks/useDashboardMetrics";

const Dashboard = () => {
  const { t } = useLanguage();
  
  // Date filter state
  const [dateFilterOption, setDateFilterOption] = useState<DateFilterOption>("today");
  const [dateRange, setDateRange] = useState<DateRange>(() => getDateRangeForOption("today"));
  const [compareEnabled, setCompareEnabled] = useState(false);
  
  // Use React Query hooks for data fetching
  const { data: uniqueConversations = [] } = useUniqueConversations();
  const { data: allConversations = [], isLoading: isLoadingAll } = useConversations();
  
  // Fallback to ensure we always have data
  const safeUniqueConversations = uniqueConversations || [];
  const safeAllConversations = allConversations || [];
  
  // Use transition stats only for All Time (backend doesn't filter by date properly)
  const { data: transitionStatsFromApi } = useTransitionStats(null, null);
  
  // Compute filtered transition stats client-side
  const filteredTransitionStats = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return transitionStatsFromApi || { noResponse: 0, futureInterest: 0, notInterested: 0, createProspect: 0, total: 0 };
    }
    
    const fromMs = dateRange.from.getTime();
    const toMs = dateRange.to.getTime();
    
    const filteredConvIds = new Set<string>();
    safeUniqueConversations.forEach(conv => {
      const convMs = getMessageTimeMs(conv);
      if (convMs >= fromMs && convMs <= toMs) {
        filteredConvIds.add(conv.conversation_id);
      }
    });
    
    const msgCounts: Record<string, number> = {};
    safeAllConversations.forEach(msg => {
      if (filteredConvIds.has(msg.conversation_id)) {
        msgCounts[msg.conversation_id] = (msgCounts[msg.conversation_id] || 0) + 1;
      }
    });
    
    const noResponse = Object.values(msgCounts).filter(count => count === 1).length;
    const responded = Object.values(msgCounts).filter(count => count >= 2).length;
    const total = filteredConvIds.size;
    
    if (transitionStatsFromApi && transitionStatsFromApi.total > 0) {
      const respondedFromApi = transitionStatsFromApi.total - transitionStatsFromApi.noResponse;
      if (respondedFromApi > 0) {
        const ratio = responded / respondedFromApi;
        return {
          noResponse,
          futureInterest: Math.round(transitionStatsFromApi.futureInterest * ratio),
          notInterested: Math.round(transitionStatsFromApi.notInterested * ratio),
          createProspect: Math.round(transitionStatsFromApi.createProspect * ratio),
          total,
        };
      }
    }
    
    return { noResponse, futureInterest: 0, notInterested: 0, createProspect: 0, total };
  }, [dateRange, safeUniqueConversations, safeAllConversations, transitionStatsFromApi]);
  
  const transitionStats = filteredTransitionStats;

  // Handle date filter change
  const handleDateFilterChange = (option: DateFilterOption, range: DateRange) => {
    setDateFilterOption(option);
    setDateRange(range);
  };

  // Use the new centralized metrics hook
  const metrics = useDashboardMetrics({
    allConversations: safeAllConversations,
    uniqueConversations: safeUniqueConversations,
    dateRange,
    compareEnabled,
    transitionStats,
  });

  // Filter data based on date range for legacy components
  const filteredData = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return {
        uniqueConversations: safeUniqueConversations,
        allConversations: safeAllConversations,
      };
    }

    const fromMs = dateRange.from.getTime();
    const toMs = dateRange.to.getTime();

    const filteredUnique = safeUniqueConversations.filter((conv) => {
      const convMs = getMessageTimeMs(conv);
      return convMs >= fromMs && convMs <= toMs;
    });

    const filteredAll = safeAllConversations.filter((msg) => {
      const msgMs = getMessageTimeMs(msg);
      return msgMs >= fromMs && msgMs <= toMs;
    });

    return {
      uniqueConversations: filteredUnique,
      allConversations: filteredAll,
    };
  }, [safeUniqueConversations, safeAllConversations, dateRange]);

  // Export handlers
  const showExportToast = useCallback((result: ExportResult) => {
    toast({
      title: t('exportSuccessful'),
      description: t('downloadedWithRows').replace('{filename}', result.filename).replace('{rowCount}', String(result.rowCount)),
    });
  }, [t]);

  const handleExportConversations = useCallback(() => {
    const uniqueConvs = filteredData.uniqueConversations;
    const result = exportConversations(uniqueConvs, `conversations_${dateFilterOption}.csv`);
    showExportToast(result);
  }, [filteredData.uniqueConversations, dateFilterOption, showExportToast]);

  const handleExportMessages = useCallback(() => {
    const result = exportMessages(filteredData.allConversations, `messages_${dateFilterOption}.csv`);
    showExportToast(result);
  }, [filteredData.allConversations, dateFilterOption, showExportToast]);

  const handleExportMessageStatus = useCallback(() => {
    const result = exportMessageStatus(filteredData.allConversations, `message_status_${dateFilterOption}.csv`);
    showExportToast(result);
  }, [filteredData.allConversations, dateFilterOption, showExportToast]);

  const handleExportTransitionStats = useCallback(() => {
    if (transitionStats) {
      const result = exportSummaryStats({
        'Create Prospect': transitionStats.createProspect,
        'Future Interest': transitionStats.futureInterest,
        'Not Interested': transitionStats.notInterested,
        'No Response': transitionStats.noResponse,
        'Total': transitionStats.total
      }, `transition_stats_${dateFilterOption}.csv`);
      showExportToast(result);
    }
  }, [transitionStats, dateFilterOption, showExportToast]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">{t('salesDashboard')}</h1>
                <p className="text-sm md:text-base text-gray-500 mt-1">{t('trackAndAnalyze')}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <DateFilter
                  value={dateFilterOption}
                  dateRange={dateRange}
                  onChange={handleDateFilterChange}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-8 py-6 md:py-8 space-y-6">
          {/* Row 1: North Star KPI Tiles */}
          <KPIRow title="Key Performance Indicators" titleAr="مؤشرات الأداء الرئيسية">
            {/* 1. Conversations Started */}
            <KPITile
              title={t('conversationsStarted')}
              value={metrics.conversationsStarted}
              icon={MessageCircle}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
              delta={metrics.conversationsStartedDelta}
              deltaLabel={t('vsPreviousPeriod')}
              sparklineData={metrics.conversationsSparkline}
              tooltip={t('conversationsStartedTooltip')}
              compareEnabled={compareEnabled}
            />

            {/* 2. Active Rate */}
            <KPITile
              title={t('activeRate')}
              value={`${metrics.activeRate.toFixed(0)}%`}
              subtitle={`${metrics.activeConversations} / ${metrics.conversationsStarted}`}
              icon={Users}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              delta={metrics.activeRateDelta}
              deltaLabel={t('vsPreviousPeriod')}
              sparklineData={metrics.activeSparkline}
              tooltip={t('activeRateTooltip')}
              compareEnabled={compareEnabled}
            />

            {/* 3. Response Rate */}
            <KPITile
              title={t('responseRate')}
              value={`${metrics.responseRate.toFixed(0)}%`}
              icon={TrendingUp}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
              delta={metrics.responseRateDelta}
              deltaLabel={t('vsPreviousPeriod')}
              tooltip={t('responseRateTooltip')}
              compareEnabled={compareEnabled}
            />

            {/* 4. First Response Time */}
            <KPITile
              title={t('firstResponseTime')}
              value={formatResponseTime(metrics.firstResponseTimeMedian)}
              subtitle={`${t('p90Abbrev')}: ${formatResponseTime(metrics.firstResponseTimeP90)} · ${metrics.slaCompliance5min.toFixed(0)}% ${t('within5min')}`}
              icon={Clock}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-100"
              delta={metrics.firstResponseDelta}
              deltaLabel={t('vsPreviousPeriod')}
              tooltip={t('firstResponseTimeTooltip')}
              compareEnabled={compareEnabled}
            />

            {/* 5. Delivery Rate */}
            <KPITile
              title={t('deliveryRate')}
              value={`${metrics.deliverySuccessRate.toFixed(0)}%`}
              subtitle={`${metrics.failedRate.toFixed(1)}% ${t('failed')}`}
              icon={CheckCheck}
              iconColor="text-teal-600"
              iconBgColor="bg-teal-100"
              delta={metrics.deliverySuccessRateDelta}
              deltaLabel={t('vsPreviousPeriod')}
              tooltip={t('deliveryRateTooltip')}
              compareEnabled={compareEnabled}
            />

            {/* 6. Prospect Rate */}
            <KPITile
              title={t('prospectRate')}
              value={`${metrics.prospectCreationRate.toFixed(0)}%`}
              subtitle={`${metrics.prospectCount} ${t('prospects')}`}
              icon={Target}
              iconColor="text-rose-600"
              iconBgColor="bg-rose-100"
              delta={metrics.prospectCreationRateDelta}
              deltaLabel={t('vsPreviousPeriod')}
              tooltip={t('prospectRateTooltip')}
              compareEnabled={compareEnabled}
            />
          </KPIRow>

          {/* Row 2: Conversion Funnel (Centerpiece) */}
          <ConversionFunnel 
            stages={metrics.funnelStages} 
            outcomes={metrics.outcomeBreakdown} 
          />

          {/* Row 3: Trends Over Time */}
          <TrendsChart 
            allConversations={safeAllConversations} 
            transitionStats={transitionStats}
          />

          {/* Row 4: Diagnostics Panel */}
          <DiagnosticsPanel allConversations={filteredData.allConversations} />

          {/* Row 5: Stakeholder Summary */}
          <StakeholderSummary metrics={metrics} compareEnabled={compareEnabled} />
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
