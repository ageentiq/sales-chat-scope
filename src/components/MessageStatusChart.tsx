import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCheck, AlertTriangle, Send } from "lucide-react";
import { getMessageTimeMs } from "@/lib/timestamps";

// Status tracking started at 03:28 PM on Dec 31, 2025 (UTC+3 = 12:28 PM UTC)
const STATUS_TRACKING_START = new Date('2025-12-31T12:28:00.000Z').getTime();

interface StatusCounts {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  total: number;
}

export const MessageStatusChart = () => {
  const { t } = useLanguage();
  const { data: allConversations = [] } = useConversations();

  const statusCounts = useMemo<StatusCounts>(() => {
    const counts: StatusCounts = { sent: 0, delivered: 0, read: 0, failed: 0, total: 0 };

    allConversations.forEach((msg) => {
      // Only count messages after status tracking started
      const msgTime = getMessageTimeMs(msg);
      if (msgTime < STATUS_TRACKING_START) return;

      // Only count outbound messages (they have status)
      if (!msg.outbound) return;

      const status = (msg as any).latestStatus;
      if (status === 'sent') counts.sent++;
      else if (status === 'delivered') counts.delivered++;
      else if (status === 'read') counts.read++;
      else if (status === 'failed') counts.failed++;
      
      counts.total++;
    });

    return counts;
  }, [allConversations]);

  const getPercentage = (count: number) => {
    if (statusCounts.total === 0) return 0;
    return Math.round((count / statusCounts.total) * 100);
  };

  const statusItems = [
    {
      key: 'delivered',
      label: t('statusDelivered') || 'Delivered',
      count: statusCounts.delivered,
      icon: CheckCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      key: 'read',
      label: t('statusRead') || 'Read',
      count: statusCounts.read,
      icon: CheckCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      key: 'failed',
      label: t('statusFailed') || 'Failed',
      count: statusCounts.failed,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {/* Total Tracked Card */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 md:px-6 pt-4 md:pt-6">
          <div>
            <CardTitle className="text-[11px] md:text-sm font-semibold text-gray-700">
              {t('messageStatusAnalytics') || 'Message Status'}
            </CardTitle>
            <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5">
              {t('trackingStartedAt') || 'Since'} 03:28 PM
            </p>
          </div>
          <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
            <Send className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="text-xl md:text-3xl font-bold text-gray-900 tabular-nums">
            {statusCounts.total}
          </div>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1">
            {t('totalTracked') || 'messages tracked'}
          </p>
        </CardContent>
      </Card>

      {/* Status Cards */}
      {statusItems.map((item) => {
        const Icon = item.icon;
        const percentage = getPercentage(item.count);
        
        return (
          <Card key={item.key} className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-[11px] md:text-sm font-semibold text-gray-700">
                {item.label}
              </CardTitle>
              <div className={`p-2 ${item.bgColor} rounded-lg`}>
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="text-xl md:text-3xl font-bold text-gray-900 tabular-nums">
                {item.count}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${item.bgColor}`}></span>
                  {percentage}% {t('ofTotal') || 'of total'}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
