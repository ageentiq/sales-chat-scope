import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCheck, AlertTriangle, Send } from "lucide-react";
import { getMessageTimeMs } from "@/lib/timestamps";

// Status tracking started at 03:28 PM on Dec 31, 2025 (UTC+3 = 12:28 PM UTC)
const STATUS_TRACKING_START = new Date('2025-12-31T12:28:00.000Z').getTime();

// Function to check if phone number is valid (966 + 9 digits = 12 total)
const isValidPhoneNumber = (conversationId: string): boolean => {
  const validPhonePattern = /^966\d{9}$/;
  return validPhonePattern.test(conversationId);
};

interface StatusCounts {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  failedPhoneNumber: number;
  failedOther: number;
  total: number;
}

export const MessageStatusChart = () => {
  const { t } = useLanguage();
  const { data: allConversations = [] } = useConversations();

  const statusCounts = useMemo<StatusCounts>(() => {
    const counts: StatusCounts = { sent: 0, delivered: 0, read: 0, failed: 0, failedPhoneNumber: 0, failedOther: 0, total: 0 };

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
      else if (status === 'failed') {
        counts.failed++;
        // Categorize failure reason
        if (!isValidPhoneNumber(msg.conversation_id || '')) {
          counts.failedPhoneNumber++;
        } else {
          counts.failedOther++;
        }
      }
      
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
      subCategories: [
        { label: t('incorrectNumber') || 'Incorrect number', count: statusCounts.failedPhoneNumber },
        { label: t('otherReason') || 'Other reason', count: statusCounts.failedOther },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6">
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
              {/* Sub-categories for failed */}
              {item.subCategories && item.count > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  {item.subCategories.map((sub) => (
                    <div key={sub.label} className="flex items-center justify-between text-[9px] md:text-[10px]">
                      <span className="text-gray-500">{sub.label}</span>
                      <span className="font-semibold text-gray-700">{sub.count}</span>
                    </div>
                  ))}
                </div>
              )}
              {!item.subCategories && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${item.bgColor}`}></span>
                    {percentage}% {t('ofTotal') || 'of total'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
