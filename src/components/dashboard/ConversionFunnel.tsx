import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { FunnelStage, OutcomeBreakdown } from "@/hooks/useDashboardMetrics";
import { Users, Check, CheckCheck, MessageSquare, XCircle, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConversionFunnelProps {
  stages: FunnelStage[];
  outcomes: OutcomeBreakdown;
}

export const ConversionFunnel = ({ stages, outcomes }: ConversionFunnelProps) => {
  const { t, language } = useLanguage();

  // Returns icon component and custom color class for WhatsApp-style status
  const getStageIconConfig = (id: string): { Icon: typeof Users; colorClass: string } => {
    switch (id) {
      case 'conversations': 
        return { Icon: Users, colorClass: 'text-white' };
      case 'failed': 
        return { Icon: XCircle, colorClass: 'text-white' };
      case 'sent': 
        return { Icon: Check, colorClass: 'text-gray-500' };
      case 'delivered': 
        return { Icon: CheckCheck, colorClass: 'text-gray-500' };
      case 'read': 
        return { Icon: CheckCheck, colorClass: 'text-green-500' };
      case 'active': 
        return { Icon: MessageSquare, colorClass: 'text-white' };
      case 'outcomes': 
        return { Icon: Target, colorClass: 'text-white' };
      default: 
        return { Icon: Users, colorClass: 'text-white' };
    }
  };

  const outcomeItems = [
    { key: 'createProspect', label: 'Create Prospect', labelAr: 'إنشاء صفقة', count: outcomes.createProspect, color: 'bg-green-500' },
    { key: 'futureInterest', label: 'Future Interest', labelAr: 'مهتم بالمراحل القادمة', count: outcomes.futureInterest, color: 'bg-yellow-500' },
    { key: 'notInterested', label: 'Not Interested', labelAr: 'غير مهتم', count: outcomes.notInterested, color: 'bg-gray-400' },
    { key: 'noResponse', label: 'No Response', labelAr: 'لم يتم الرد', count: outcomes.noResponse, color: 'bg-red-400' },
  ];

  const totalOutcomes = outcomes.createProspect + outcomes.futureInterest + outcomes.notInterested + outcomes.noResponse;

  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2 px-4 md:px-6 pt-4 md:pt-6">
        <CardTitle className="text-sm md:text-base font-semibold text-gray-700">
          {t('conversionFunnel')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
        {/* Funnel Stages */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((stage, index) => {
            const { Icon, colorClass } = getStageIconConfig(stage.id);
            const useWhiteBackground = ['sent', 'delivered', 'read'].includes(stage.id);

            return (
              <Tooltip key={stage.id}>
                <TooltipTrigger asChild>
                  <div 
                    className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all cursor-default"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${useWhiteBackground ? 'bg-white border border-gray-200' : stage.color}`}>
                        <Icon className={`h-4 w-4 ${colorClass}`} />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {language === 'ar' ? stage.labelAr : stage.label}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                      {stage.count.toLocaleString()}
                    </div>
                    {index > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        <span className={stage.conversionRate >= 70 ? 'text-green-600 font-semibold' : stage.conversionRate >= 40 ? 'text-amber-600 font-semibold' : 'text-red-500 font-semibold'}>
                          {stage.conversionRate.toFixed(0)}%
                        </span>
                        <span className="text-gray-400 ml-1">{t('ofTotal')}</span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{language === 'ar' ? stage.labelAr : stage.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {stage.count.toLocaleString()} {t('conversations')}
                    {index > 0 && ` (${stage.conversionRate.toFixed(1)}% ${t('ofTotal')})`}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Outcomes Breakdown */}
        {totalOutcomes > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-xs md:text-sm font-medium text-gray-600 mb-3">{t('outcomeBreakdown')}</h4>
            <div className="space-y-2">
              {/* Stacked bar */}
              <div className="flex h-6 rounded-lg overflow-hidden bg-gray-100">
                {outcomeItems.map(item => {
                  const percent = totalOutcomes > 0 ? (item.count / totalOutcomes) * 100 : 0;
                  if (percent === 0) return null;
                  return (
                    <Tooltip key={item.key}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`${item.color} hover:opacity-80 transition-opacity cursor-default flex items-center justify-center`}
                          style={{ width: `${percent}%` }}
                        >
                          {percent >= 10 && (
                            <span className="text-[10px] md:text-xs text-white font-medium">
                              {percent.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{language === 'ar' ? item.labelAr : item.label}</p>
                        <p className="text-xs">{item.count} ({percent.toFixed(1)}%)</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {outcomeItems.map(item => (
                  <div key={item.key} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    <span className="text-[10px] md:text-xs text-gray-600">
                      {language === 'ar' ? item.labelAr : item.label}
                    </span>
                    <span className="text-[10px] md:text-xs font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
