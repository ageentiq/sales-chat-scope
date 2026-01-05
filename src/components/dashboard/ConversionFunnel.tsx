import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { FunnelStage, OutcomeBreakdown } from "@/hooks/useDashboardMetrics";
import { ChevronRight, Users, Send, CheckCheck, Eye, MessageCircle, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConversionFunnelProps {
  stages: FunnelStage[];
  outcomes: OutcomeBreakdown;
}

export const ConversionFunnel = ({ stages, outcomes }: ConversionFunnelProps) => {
  const { t, language } = useLanguage();

  const getStageIcon = (id: string) => {
    switch (id) {
      case 'conversations': return Users;
      case 'sent': return Send;
      case 'delivered': return CheckCheck;
      case 'read': return Eye;
      case 'active': return MessageCircle;
      case 'outcomes': return Target;
      default: return Users;
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
        <div className="flex flex-col lg:flex-row items-stretch gap-2 lg:gap-0">
          {stages.map((stage, index) => {
            const Icon = getStageIcon(stage.id);
            const isLast = index === stages.length - 1;
            const maxCount = stages[0]?.count || 1;
            const widthPercent = Math.max(30, (stage.count / maxCount) * 100);

            return (
              <div key={stage.id} className="flex items-center flex-1">
                {/* Stage Card */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex-1 lg:flex-none relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 md:p-4 border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all cursor-default"
                      style={{ 
                        minWidth: '100px',
                        width: `${widthPercent}%`,
                        maxWidth: '100%'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-md ${stage.color}`}>
                          <Icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                        </div>
                        <span className="text-[10px] md:text-xs font-medium text-gray-600 truncate">
                          {language === 'ar' ? stage.labelAr : stage.label}
                        </span>
                      </div>
                      <div className="text-lg md:text-2xl font-bold text-gray-900 tabular-nums">
                        {stage.count.toLocaleString()}
                      </div>
                      {index > 0 && stage.conversionRate > 0 && (
                        <div className="text-[10px] md:text-xs text-gray-500 mt-1">
                          <span className={stage.conversionRate >= 70 ? 'text-green-600' : stage.conversionRate >= 40 ? 'text-amber-600' : 'text-red-500'}>
                            {stage.conversionRate.toFixed(0)}%
                          </span>
                          <span className="text-gray-400 ml-1">{t('fromPrevious')}</span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{language === 'ar' ? stage.labelAr : stage.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage.count.toLocaleString()} {t('conversations')}
                      {index > 0 && ` (${stage.conversionRate.toFixed(1)}% ${t('conversionRate')})`}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Arrow between stages */}
                {!isLast && (
                  <div className="hidden lg:flex items-center justify-center px-1">
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
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
