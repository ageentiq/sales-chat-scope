import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users } from "lucide-react";

interface StakeholderSummaryProps {
  metrics: {
    conversationsStarted: number;
    conversationsStartedDelta: number | null;
    activeRate: number;
    activeRateDelta: number | null;
    responseRate: number;
    firstResponseTimeMedian: number;
    firstResponseDelta: number | null;
    deliverySuccessRate: number;
    deliverySuccessRateDelta: number | null;
    failedRate: number;
    prospectCreationRate: number;
    prospectCount: number;
    slaCompliance15min: number;
  };
  compareEnabled: boolean;
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ElementType;
  text: string;
  textAr: string;
  priority: number;
}

export const StakeholderSummary = ({ metrics, compareEnabled }: StakeholderSummaryProps) => {
  const { t, language } = useLanguage();

  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    // 1. Volume insight
    if (metrics.conversationsStarted > 0) {
      if (compareEnabled && metrics.conversationsStartedDelta !== null) {
        if (metrics.conversationsStartedDelta > 10) {
          result.push({
            type: 'positive',
            icon: TrendingUp,
            text: `Conversation volume increased by ${metrics.conversationsStartedDelta.toFixed(0)}% compared to previous period`,
            textAr: `ارتفع حجم المحادثات بنسبة ${metrics.conversationsStartedDelta.toFixed(0)}% مقارنة بالفترة السابقة`,
            priority: 1,
          });
        } else if (metrics.conversationsStartedDelta < -10) {
          result.push({
            type: 'negative',
            icon: TrendingDown,
            text: `Conversation volume decreased by ${Math.abs(metrics.conversationsStartedDelta).toFixed(0)}% compared to previous period`,
            textAr: `انخفض حجم المحادثات بنسبة ${Math.abs(metrics.conversationsStartedDelta).toFixed(0)}% مقارنة بالفترة السابقة`,
            priority: 1,
          });
        }
      } else {
        result.push({
          type: 'neutral',
          icon: Users,
          text: `${metrics.conversationsStarted} conversations started in this period`,
          textAr: `${metrics.conversationsStarted} محادثة بدأت في هذه الفترة`,
          priority: 5,
        });
      }
    }

    // 2. Engagement insight
    if (metrics.activeRate >= 50) {
      result.push({
        type: 'positive',
        icon: CheckCircle,
        text: `Strong engagement: ${metrics.activeRate.toFixed(0)}% of conversations are active (2+ messages)`,
        textAr: `تفاعل قوي: ${metrics.activeRate.toFixed(0)}% من المحادثات نشطة (رسالتان أو أكثر)`,
        priority: 2,
      });
    } else if (metrics.activeRate < 30 && metrics.conversationsStarted > 10) {
      result.push({
        type: 'warning',
        icon: AlertTriangle,
        text: `Low engagement: only ${metrics.activeRate.toFixed(0)}% of conversations have 2+ messages`,
        textAr: `تفاعل منخفض: فقط ${metrics.activeRate.toFixed(0)}% من المحادثات لديها رسالتان أو أكثر`,
        priority: 2,
      });
    }

    // 3. Response time insight
    if (metrics.slaCompliance15min >= 80) {
      result.push({
        type: 'positive',
        icon: CheckCircle,
        text: `Excellent response time: ${metrics.slaCompliance15min.toFixed(0)}% of responses within 15 minutes`,
        textAr: `وقت استجابة ممتاز: ${metrics.slaCompliance15min.toFixed(0)}% من الردود خلال 15 دقيقة`,
        priority: 3,
      });
    } else if (metrics.slaCompliance15min < 50 && metrics.slaCompliance15min > 0) {
      result.push({
        type: 'warning',
        icon: AlertTriangle,
        text: `Response time needs attention: only ${metrics.slaCompliance15min.toFixed(0)}% within 15 min SLA`,
        textAr: `وقت الاستجابة يحتاج اهتمام: فقط ${metrics.slaCompliance15min.toFixed(0)}% ضمن SLA 15 دقيقة`,
        priority: 3,
      });
    }

    // 4. Delivery insight
    if (metrics.failedRate > 5) {
      result.push({
        type: 'negative',
        icon: AlertTriangle,
        text: `High failure rate: ${metrics.failedRate.toFixed(1)}% of messages failed to deliver`,
        textAr: `معدل فشل مرتفع: ${metrics.failedRate.toFixed(1)}% من الرسائل فشلت في التسليم`,
        priority: 1,
      });
    } else if (metrics.deliverySuccessRate >= 95) {
      result.push({
        type: 'positive',
        icon: CheckCircle,
        text: `Excellent delivery: ${metrics.deliverySuccessRate.toFixed(0)}% of messages delivered successfully`,
        textAr: `تسليم ممتاز: ${metrics.deliverySuccessRate.toFixed(0)}% من الرسائل تم تسليمها بنجاح`,
        priority: 4,
      });
    }

    // 5. Conversion insight
    if (metrics.prospectCount > 0) {
      result.push({
        type: 'positive',
        icon: TrendingUp,
        text: `${metrics.prospectCount} prospects created (${metrics.prospectCreationRate.toFixed(1)}% conversion rate)`,
        textAr: `${metrics.prospectCount} عميل محتمل تم إنشاؤه (معدل تحويل ${metrics.prospectCreationRate.toFixed(1)}%)`,
        priority: 2,
      });
    }

    // Sort by priority and take top 5
    return result.sort((a, b) => a.priority - b.priority).slice(0, 5);
  }, [metrics, compareEnabled]);

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'bg-green-50';
      case 'negative': return 'bg-red-50';
      case 'warning': return 'bg-amber-50';
      default: return 'bg-blue-50';
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{t('stakeholderSummary')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <li 
                key={index}
                className={`flex items-start gap-3 p-2.5 rounded-lg ${getBgColor(insight.type)} transition-all duration-200`}
              >
                <div className={`mt-0.5 ${getIconColor(insight.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-foreground leading-relaxed">
                  {language === 'ar' ? insight.textAr : insight.text}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
