import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart3, AlertTriangle, MessageSquare } from "lucide-react";
import { getMessageTimeMs } from "@/lib/timestamps";
import { ConversationMessage } from "@/data/mockData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';

// Status tracking started at 03:28 PM on Dec 31, 2025 (UTC+3 = 12:28 PM UTC)
const STATUS_TRACKING_START = new Date('2025-12-31T12:28:00.000Z').getTime();

// Function to check if phone number is valid (966 + 9 digits = 12 total)
const isValidPhoneNumber = (conversationId: string): boolean => {
  const validPhonePattern = /^966\d{9}$/;
  return validPhonePattern.test(conversationId);
};

interface DiagnosticsPanelProps {
  allConversations: ConversationMessage[];
}

interface StatusMetrics {
  read: number;
  deliveredNotRead: number;
  failed: number;
  total: number;
}

interface FailureReason {
  reason: string;
  reasonAr: string;
  count: number;
  percentage: number;
}

interface DepthBucket {
  bucket: string;
  bucketAr: string;
  count: number;
  percentage: number;
}

export const DiagnosticsPanel = ({ allConversations }: DiagnosticsPanelProps) => {
  const { t, language } = useLanguage();

  // Calculate status metrics for stacked bar
  const statusMetrics = useMemo<StatusMetrics>(() => {
    let read = 0, delivered = 0, failed = 0;

    allConversations.forEach((msg) => {
      const msgTime = getMessageTimeMs(msg);
      if (msgTime < STATUS_TRACKING_START) return;
      if (!msg.outbound) return;

      const status = (msg as any).latestStatus;
      if (status === 'read') read++;
      else if (status === 'delivered') delivered++;
      else if (status === 'failed') failed++;
    });

    const total = read + delivered + failed;
    return { read, deliveredNotRead: delivered, failed, total };
  }, [allConversations]);

  // Calculate failure reasons
  const failureReasons = useMemo<FailureReason[]>(() => {
    let incorrectNumber = 0, otherReason = 0;

    allConversations.forEach((msg) => {
      const msgTime = getMessageTimeMs(msg);
      if (msgTime < STATUS_TRACKING_START) return;
      if (!msg.outbound) return;

      const status = (msg as any).latestStatus;
      if (status === 'failed') {
        if (!isValidPhoneNumber(msg.conversation_id || '')) {
          incorrectNumber++;
        } else {
          otherReason++;
        }
      }
    });

    const total = incorrectNumber + otherReason;
    if (total === 0) return [];

    return [
      { 
        reason: 'Incorrect Number', 
        reasonAr: 'رقم غير صحيح',
        count: incorrectNumber, 
        percentage: (incorrectNumber / total) * 100 
      },
      { 
        reason: 'Other Reason', 
        reasonAr: 'سبب آخر',
        count: otherReason, 
        percentage: (otherReason / total) * 100 
      },
    ].filter(r => r.count > 0).sort((a, b) => b.count - a.count);
  }, [allConversations]);

  // Calculate conversation depth distribution
  const depthDistribution = useMemo<DepthBucket[]>(() => {
    const messageCounts: Record<string, number> = {};

    allConversations.forEach((msg) => {
      messageCounts[msg.conversation_id] = (messageCounts[msg.conversation_id] || 0) + 1;
    });

    let one = 0, twoThree = 0, fourSeven = 0, eightPlus = 0;

    Object.values(messageCounts).forEach(count => {
      if (count === 1) one++;
      else if (count >= 2 && count <= 3) twoThree++;
      else if (count >= 4 && count <= 7) fourSeven++;
      else if (count >= 8) eightPlus++;
    });

    const total = Object.keys(messageCounts).length;
    if (total === 0) return [];

    // Calculate median
    const sortedCounts = Object.values(messageCounts).sort((a, b) => a - b);
    const median = sortedCounts[Math.floor(sortedCounts.length / 2)] || 0;

    return [
      { bucket: '1 message', bucketAr: 'رسالة واحدة', count: one, percentage: (one / total) * 100 },
      { bucket: '2-3 messages', bucketAr: '2-3 رسائل', count: twoThree, percentage: (twoThree / total) * 100 },
      { bucket: '4-7 messages', bucketAr: '4-7 رسائل', count: fourSeven, percentage: (fourSeven / total) * 100 },
      { bucket: '8+ messages', bucketAr: '+8 رسائل', count: eightPlus, percentage: (eightPlus / total) * 100 },
    ];
  }, [allConversations]);

  // Calculate median messages per conversation
  const medianMessages = useMemo(() => {
    const messageCounts: Record<string, number> = {};
    allConversations.forEach((msg) => {
      messageCounts[msg.conversation_id] = (messageCounts[msg.conversation_id] || 0) + 1;
    });
    const sortedCounts = Object.values(messageCounts).sort((a, b) => a - b);
    if (sortedCounts.length === 0) return 0;
    return sortedCounts[Math.floor(sortedCounts.length / 2)];
  }, [allConversations]);

  const getStatusPercentage = (count: number) => {
    if (statusMetrics.total === 0) return 0;
    return (count / statusMetrics.total) * 100;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-2 text-xs">
        <p className="font-medium">{language === 'ar' ? data.bucketAr || data.reasonAr : data.bucket || data.reason}</p>
        <p className="text-muted-foreground">{data.count} ({data.percentage.toFixed(1)}%)</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* A) Message Status Distribution - 100% Stacked Bar */}
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>{t('statusDistribution')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {statusMetrics.total > 0 ? (
            <>
              {/* Stacked bar */}
              <div className="h-8 rounded-lg overflow-hidden flex mb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{ width: `${getStatusPercentage(statusMetrics.read)}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('statusRead')}: {statusMetrics.read} ({getStatusPercentage(statusMetrics.read).toFixed(1)}%)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="bg-teal-400 h-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{ width: `${getStatusPercentage(statusMetrics.deliveredNotRead)}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('deliveredNotRead')}: {statusMetrics.deliveredNotRead} ({getStatusPercentage(statusMetrics.deliveredNotRead).toFixed(1)}%)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="bg-red-500 h-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{ width: `${getStatusPercentage(statusMetrics.failed)}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('statusFailed')}: {statusMetrics.failed} ({getStatusPercentage(statusMetrics.failed).toFixed(1)}%)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-muted-foreground">{t('statusRead')} ({getStatusPercentage(statusMetrics.read).toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-teal-400" />
                  <span className="text-muted-foreground">{t('deliveredNotRead')} ({getStatusPercentage(statusMetrics.deliveredNotRead).toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-muted-foreground">{t('statusFailed')} ({getStatusPercentage(statusMetrics.failed).toFixed(0)}%)</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noData')}</p>
          )}
        </CardContent>
      </Card>

      {/* B) Failure Reasons - Horizontal Bar Chart */}
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>{t('failureReasons')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {failureReasons.length > 0 ? (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={failureReasons} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey={language === 'ar' ? 'reasonAr' : 'reason'}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <RechartsTooltip content={<CustomBarTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {failureReasons.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? '#ef4444' : '#f97316'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noFailures')}</p>
          )}
        </CardContent>
      </Card>

      {/* C) Conversation Depth Distribution */}
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <span>{t('engagementDepth')}</span>
            </div>
            <span className="text-xs font-normal text-muted-foreground">
              {t('median')}: {medianMessages} {t('messagesCount')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {depthDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={depthDistribution} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <XAxis 
                  dataKey={language === 'ar' ? 'bucketAr' : 'bucket'}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis hide />
                <RechartsTooltip content={<CustomBarTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {depthDistribution.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={['#e5e7eb', '#a855f7', '#8b5cf6', '#7c3aed'][index]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noData')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
