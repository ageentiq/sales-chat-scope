import { useMemo } from "react";
import { DateRange } from "@/components/DateFilter";
import { getMessageTimeMs } from "@/lib/timestamps";
import { ConversationMessage } from "@/data/mockData";

// Status tracking started at 03:28 PM on Dec 31, 2025 (UTC+3 = 12:28 PM UTC)
const STATUS_TRACKING_START = new Date('2025-12-31T12:28:00.000Z').getTime();

// Function to check if phone number is valid (966 + 9 digits = 12 total)
const isValidPhoneNumber = (conversationId: string): boolean => {
  const validPhonePattern = /^966\d{9}$/;
  return validPhonePattern.test(conversationId);
};

interface SparklinePoint {
  value: number;
}

// Funnel stage interface
export interface FunnelStage {
  id: string;
  label: string;
  labelAr: string;
  count: number;
  conversionRate: number; // % conversion from previous stage
  color: string;
}

// Outcome breakdown interface
export interface OutcomeBreakdown {
  createProspect: number;
  futureInterest: number;
  notInterested: number;
  noResponse: number;
}

interface DashboardMetrics {
  // Volume
  conversationsStarted: number;
  conversationsStartedDelta: number | null;
  conversationsSparkline: SparklinePoint[];
  
  // Engagement
  activeConversations: number;
  activeRate: number;
  activeRateDelta: number | null;
  activeSparkline: SparklinePoint[];
  
  // Response
  responseRate: number;
  responseRateDelta: number | null;
  
  // Speed
  firstResponseTimeMedian: number;
  firstResponseTimeP90: number;
  slaCompliance5min: number;
  slaCompliance15min: number;
  firstResponseDelta: number | null;
  
  // Reach
  deliverySuccessRate: number;
  deliverySuccessRateDelta: number | null;
  readRate: number;
  failedRate: number;
  failedCount: number;
  failedByPhoneNumber: number;
  failedByOther: number;
  
  // Outcomes
  prospectCreationRate: number;
  prospectCreationRateDelta: number | null;
  prospectCount: number;
  prospectsSparkline: SparklinePoint[];
  
  // Raw counts for tooltips
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  readMessages: number;
  
  // Funnel data
  funnelStages: FunnelStage[];
  outcomeBreakdown: OutcomeBreakdown;
}

interface UseDashboardMetricsProps {
  allConversations: ConversationMessage[];
  uniqueConversations: ConversationMessage[];
  dateRange: DateRange;
  compareEnabled: boolean;
  transitionStats?: {
    noResponse: number;
    futureInterest: number;
    notInterested: number;
    createProspect: number;
    total: number;
  };
}

export const useDashboardMetrics = ({
  allConversations,
  uniqueConversations,
  dateRange,
  compareEnabled,
  transitionStats,
}: UseDashboardMetricsProps): DashboardMetrics => {
  return useMemo(() => {
    // Filter data by date range
    const filterByDateRange = (data: ConversationMessage[], range: DateRange) => {
      if (!range.from || !range.to) return data;
      const fromMs = range.from.getTime();
      const toMs = range.to.getTime();
      return data.filter(msg => {
        const ms = getMessageTimeMs(msg);
        return ms >= fromMs && ms <= toMs;
      });
    };

    // Get previous period range
    const getPreviousPeriodRange = (range: DateRange): DateRange => {
      if (!range.from || !range.to) return { from: null, to: null };
      const duration = range.to.getTime() - range.from.getTime();
      return {
        from: new Date(range.from.getTime() - duration),
        to: new Date(range.from.getTime() - 1),
      };
    };

    // Current period data
    const currentData = filterByDateRange(allConversations, dateRange);
    const currentUnique = filterByDateRange(uniqueConversations, dateRange);
    
    // Previous period data (for comparison)
    const prevRange = getPreviousPeriodRange(dateRange);
    const prevData = compareEnabled ? filterByDateRange(allConversations, prevRange) : [];
    const prevUnique = compareEnabled ? filterByDateRange(uniqueConversations, prevRange) : [];

    // Calculate message counts per conversation
    const getMessageCounts = (data: ConversationMessage[]) => {
      const counts: Record<string, number> = {};
      data.forEach(msg => {
        counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
      });
      return counts;
    };

    const currentCounts = getMessageCounts(currentData);
    const prevCounts = getMessageCounts(prevData);

    // Volume metrics
    const conversationsStarted = Object.keys(currentCounts).length;
    const prevConversationsStarted = Object.keys(prevCounts).length;
    const conversationsStartedDelta = compareEnabled && prevConversationsStarted > 0
      ? ((conversationsStarted - prevConversationsStarted) / prevConversationsStarted) * 100
      : null;

    // Active conversations (2+ messages)
    const activeConversations = Object.values(currentCounts).filter(c => c >= 2).length;
    const prevActiveConversations = Object.values(prevCounts).filter(c => c >= 2).length;
    const activeRate = conversationsStarted > 0 ? (activeConversations / conversationsStarted) * 100 : 0;
    const prevActiveRate = prevConversationsStarted > 0 ? (prevActiveConversations / prevConversationsStarted) * 100 : 0;
    const activeRateDelta = compareEnabled && prevConversationsStarted > 0
      ? activeRate - prevActiveRate
      : null;

    // Response rate (conversations with agent reply = 2+ messages)
    const responseRate = activeRate; // Same as active rate for now
    const responseRateDelta = activeRateDelta;

    // First response time calculations
    const calculateResponseTimes = (data: ConversationMessage[]) => {
      const conversationGroups: Record<string, ConversationMessage[]> = {};
      data.forEach(msg => {
        if (!conversationGroups[msg.conversation_id]) {
          conversationGroups[msg.conversation_id] = [];
        }
        conversationGroups[msg.conversation_id].push(msg);
      });

      const responseTimes: number[] = [];
      Object.values(conversationGroups).forEach(messages => {
        if (messages.length < 2) return;
        
        const sorted = [...messages].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Find first response time (time between first message and first agent reply)
        for (let i = 0; i < sorted.length - 1; i++) {
          const current = sorted[i];
          const next = sorted[i + 1];
          
          // If current is inbound and next is outbound, this is a response
          if (current.inbound && next.outbound) {
            const timeDiff = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
            const minutes = timeDiff / (1000 * 60);
            if (minutes > 0 && minutes < 1440) { // Reasonable range
              responseTimes.push(minutes);
              break; // Only count first response
            }
          }
        }
      });

      if (responseTimes.length === 0) return { median: 0, p90: 0 };
      
      const sorted = [...responseTimes].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const p90 = sorted[Math.floor(sorted.length * 0.9)];
      
      return { median, p90, times: sorted };
    };

    const currentResponseTimes = calculateResponseTimes(currentData);
    const prevResponseTimes = calculateResponseTimes(prevData);
    
    const firstResponseTimeMedian = currentResponseTimes.median;
    const firstResponseTimeP90 = currentResponseTimes.p90;
    
    // SLA compliance (% of responses within threshold)
    const slaCompliance5min = currentResponseTimes.times
      ? (currentResponseTimes.times.filter(t => t <= 5).length / currentResponseTimes.times.length) * 100 || 0
      : 0;
    const slaCompliance15min = currentResponseTimes.times
      ? (currentResponseTimes.times.filter(t => t <= 15).length / currentResponseTimes.times.length) * 100 || 0
      : 0;

    const firstResponseDelta = compareEnabled && prevResponseTimes.median > 0
      ? ((currentResponseTimes.median - prevResponseTimes.median) / prevResponseTimes.median) * 100
      : null;

    // Message status metrics (only after tracking start)
    const calculateStatusMetrics = (data: ConversationMessage[]) => {
      let sent = 0, delivered = 0, read = 0, failed = 0;
      let failedPhoneNumber = 0, failedOther = 0;

      data.forEach(msg => {
        const msgTime = getMessageTimeMs(msg);
        if (msgTime < STATUS_TRACKING_START) return;
        if (!msg.outbound) return;

        const status = (msg as any).latestStatus;
        if (status === 'sent') sent++;
        else if (status === 'delivered') delivered++;
        else if (status === 'read') read++;
        else if (status === 'failed') {
          failed++;
          if (!isValidPhoneNumber(msg.conversation_id || '')) {
            failedPhoneNumber++;
          } else {
            failedOther++;
          }
        }
      });

      const total = sent + delivered + read + failed;
      return { sent, delivered, read, failed, failedPhoneNumber, failedOther, total };
    };

    const currentStatus = calculateStatusMetrics(currentData);
    const prevStatus = calculateStatusMetrics(prevData);

    const deliverySuccessRate = currentStatus.total > 0
      ? ((currentStatus.delivered + currentStatus.read) / currentStatus.total) * 100
      : 0;
    const prevDeliverySuccessRate = prevStatus.total > 0
      ? ((prevStatus.delivered + prevStatus.read) / prevStatus.total) * 100
      : 0;
    const deliverySuccessRateDelta = compareEnabled && prevStatus.total > 0
      ? deliverySuccessRate - prevDeliverySuccessRate
      : null;

    const readRate = currentStatus.total > 0 ? (currentStatus.read / currentStatus.total) * 100 : 0;
    const failedRate = currentStatus.total > 0 ? (currentStatus.failed / currentStatus.total) * 100 : 0;

    // Prospect creation metrics
    const prospectCount = transitionStats?.createProspect || 0;
    const prospectCreationRate = conversationsStarted > 0
      ? (prospectCount / conversationsStarted) * 100
      : 0;
    const prospectCreationRateDelta = null; // Would need historical transition stats

    // Generate sparkline data (last 7 days)
    const generateSparkline = (data: ConversationMessage[]): SparklinePoint[] => {
      const now = new Date();
      const days: SparklinePoint[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const count = new Set(
          data
            .filter(msg => {
              const ms = getMessageTimeMs(msg);
              return ms >= dayStart.getTime() && ms <= dayEnd.getTime();
            })
            .map(msg => msg.conversation_id)
        ).size;
        
        days.push({ value: count });
      }
      
      return days;
    };

    const generateActiveSparkline = (data: ConversationMessage[]): SparklinePoint[] => {
      const now = new Date();
      const days: SparklinePoint[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Get messages for this day
        const dayMessages = data.filter(msg => {
          const ms = getMessageTimeMs(msg);
          return ms >= dayStart.getTime() && ms <= dayEnd.getTime();
        });
        
        // Count active conversations
        const counts: Record<string, number> = {};
        dayMessages.forEach(msg => {
          counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
        });
        const activeCount = Object.values(counts).filter(c => c >= 2).length;
        
        days.push({ value: activeCount });
      }
      
      return days;
    };

    // Build funnel stages - count UNIQUE CONVERSATIONS (customers) at each stage
    const calculateUniqueFunnelStages = (data: ConversationMessage[]) => {
      const conversationStatuses: Record<string, { sent: boolean; delivered: boolean; read: boolean; active: boolean }> = {};
      
      // Group messages by conversation and determine each conversation's best status
      data.forEach(msg => {
        const convId = msg.conversation_id;
        if (!conversationStatuses[convId]) {
          conversationStatuses[convId] = { sent: false, delivered: false, read: false, active: false };
        }
        
        // Only check outbound messages for status tracking
        const msgTime = getMessageTimeMs(msg);
        if (msgTime >= STATUS_TRACKING_START && msg.outbound) {
          const status = (msg as any).latestStatus;
          if (status === 'sent' || status === 'delivered' || status === 'read') {
            conversationStatuses[convId].sent = true;
          }
          if (status === 'delivered' || status === 'read') {
            conversationStatuses[convId].delivered = true;
          }
          if (status === 'read') {
            conversationStatuses[convId].read = true;
          }
        }
      });
      
      // Mark active conversations (those with 2+ messages indicating back-and-forth)
      const messageCounts: Record<string, number> = {};
      data.forEach(msg => {
        messageCounts[msg.conversation_id] = (messageCounts[msg.conversation_id] || 0) + 1;
      });
      Object.keys(conversationStatuses).forEach(convId => {
        if (messageCounts[convId] >= 2) {
          conversationStatuses[convId].active = true;
        }
      });
      
      // Count unique conversations at each stage
      let sentCount = 0, deliveredCount = 0, readCount = 0, activeCount = 0;
      Object.values(conversationStatuses).forEach(status => {
        if (status.sent) sentCount++;
        if (status.delivered) deliveredCount++;
        if (status.read) readCount++;
        if (status.active) activeCount++;
      });
      
      return { sentCount, deliveredCount, readCount, activeCount };
    };
    
    const uniqueStages = calculateUniqueFunnelStages(currentData);
    
    const funnelStages: FunnelStage[] = [
      {
        id: 'conversations',
        label: 'Started',
        labelAr: 'بدأت',
        count: conversationsStarted,
        conversionRate: 100,
        color: 'bg-blue-500',
      },
      {
        id: 'sent',
        label: 'Sent',
        labelAr: 'مُرسل',
        count: uniqueStages.sentCount,
        conversionRate: conversationsStarted > 0 ? (uniqueStages.sentCount / conversationsStarted) * 100 : 0,
        color: 'bg-gray-500',
      },
      {
        id: 'delivered',
        label: 'Delivered',
        labelAr: 'تم التوصيل',
        count: uniqueStages.deliveredCount,
        conversionRate: uniqueStages.sentCount > 0 ? (uniqueStages.deliveredCount / uniqueStages.sentCount) * 100 : 0,
        color: 'bg-teal-500',
      },
      {
        id: 'read',
        label: 'Read',
        labelAr: 'تمت القراءة',
        count: uniqueStages.readCount,
        conversionRate: uniqueStages.deliveredCount > 0 ? (uniqueStages.readCount / uniqueStages.deliveredCount) * 100 : 0,
        color: 'bg-blue-600',
      },
      {
        id: 'active',
        label: 'Responded',
        labelAr: 'استجابوا',
        count: uniqueStages.activeCount,
        conversionRate: uniqueStages.readCount > 0 ? (uniqueStages.activeCount / uniqueStages.readCount) * 100 : 0,
        color: 'bg-purple-500',
      },
    ];

    const outcomeBreakdown: OutcomeBreakdown = {
      createProspect: transitionStats?.createProspect || 0,
      futureInterest: transitionStats?.futureInterest || 0,
      notInterested: transitionStats?.notInterested || 0,
      noResponse: transitionStats?.noResponse || 0,
    };

    return {
      conversationsStarted,
      conversationsStartedDelta,
      conversationsSparkline: generateSparkline(allConversations),
      
      activeConversations,
      activeRate,
      activeRateDelta,
      activeSparkline: generateActiveSparkline(allConversations),
      
      responseRate,
      responseRateDelta,
      
      firstResponseTimeMedian,
      firstResponseTimeP90,
      slaCompliance5min,
      slaCompliance15min,
      firstResponseDelta,
      
      deliverySuccessRate,
      deliverySuccessRateDelta,
      readRate,
      failedRate,
      failedCount: currentStatus.failed,
      failedByPhoneNumber: currentStatus.failedPhoneNumber,
      failedByOther: currentStatus.failedOther,
      
      prospectCreationRate,
      prospectCreationRateDelta,
      prospectCount,
      prospectsSparkline: [], // Would need historical prospect data
      
      totalMessages: currentData.length,
      sentMessages: currentStatus.sent,
      deliveredMessages: currentStatus.delivered,
      readMessages: currentStatus.read,
      
      funnelStages,
      outcomeBreakdown,
    };
  }, [allConversations, uniqueConversations, dateRange, compareEnabled, transitionStats]);
};

// Helper to format response time
export const formatResponseTime = (minutes: number): string => {
  if (minutes === 0) return "0m";
  if (minutes < 1) return `${Math.round(minutes * 60)}s`;
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};
