import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, CheckCheck, AlertTriangle, Send } from "lucide-react";
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
      barColor: 'bg-green-500',
    },
    {
      key: 'read',
      label: t('statusRead') || 'Read',
      count: statusCounts.read,
      icon: CheckCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      barColor: 'bg-blue-500',
    },
    {
      key: 'sent',
      label: t('statusSent') || 'Sent',
      count: statusCounts.sent,
      icon: Check,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      barColor: 'bg-gray-400',
    },
    {
      key: 'failed',
      label: t('statusFailed') || 'Failed',
      count: statusCounts.failed,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      barColor: 'bg-red-500',
    },
  ];

  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      <CardHeader className="pb-2 px-4 md:px-6 pt-4 md:pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm md:text-base font-semibold text-gray-700">
              {t('messageStatusAnalytics') || 'Message Status Analytics'}
            </CardTitle>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1">
              {t('trackingStartedAt') || 'Tracking started at'} 03:28 PM
            </p>
          </div>
          <div className="p-2 bg-primary/5 rounded-lg">
            <Send className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums mb-4">
          {statusCounts.total}
          <span className="text-sm md:text-base font-normal text-gray-500 ml-2">
            {t('totalTracked') || 'messages tracked'}
          </span>
        </div>

        <div className="space-y-3">
          {statusItems.map((item) => {
            const Icon = item.icon;
            const percentage = getPercentage(item.count);
            
            return (
              <div key={item.key} className="flex items-center gap-3">
                <div className={`p-1.5 ${item.bgColor} rounded-lg`}>
                  <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs md:text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs md:text-sm font-bold text-gray-900 tabular-nums">
                      {item.count} <span className="text-gray-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
