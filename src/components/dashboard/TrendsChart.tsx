import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, Legend } from 'recharts';
import { TrendingUp, Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format, subDays, startOfDay, startOfWeek, isWithinInterval, differenceInDays } from "date-fns";
import { getMessageTimeMs } from "@/lib/timestamps";
import { ConversationMessage } from "@/data/mockData";

type PeriodOption = '7days' | '14days' | '30days' | '90days';
type AggregationType = 'daily' | 'weekly';

interface TrendsChartProps {
  allConversations: ConversationMessage[];
  transitionStats?: {
    createProspect: number;
    futureInterest: number;
    notInterested: number;
    noResponse: number;
    total: number;
  };
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  conversations: number;
  active: number;
  prospects: number;
  failedRate: number;
}

export const TrendsChart = ({ allConversations, transitionStats }: TrendsChartProps) => {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState<PeriodOption>('30days');
  const [aggregation, setAggregation] = useState<AggregationType>('daily');

  const periodOptions: { value: PeriodOption; label: string; days: number }[] = [
    { value: '7days', label: t('last7Days'), days: 7 },
    { value: '14days', label: t('last14Days'), days: 14 },
    { value: '30days', label: t('last30Days'), days: 30 },
    { value: '90days', label: t('last90Days'), days: 90 },
  ];

  // Generate chart data
  const chartData = useMemo(() => {
    const selectedPeriod = periodOptions.find(p => p.value === period);
    const daysCount = selectedPeriod?.days || 30;
    
    const today = startOfDay(new Date());
    const startDate = subDays(today, daysCount - 1);
    
    // Create date buckets based on aggregation
    const buckets: { start: Date; end: Date; label: string; fullDate: string }[] = [];
    
    if (aggregation === 'weekly') {
      let current = startOfWeek(startDate, { weekStartsOn: 0 });
      while (current <= today) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        buckets.push({
          start: new Date(Math.max(current.getTime(), startDate.getTime())),
          end: new Date(Math.min(weekEnd.getTime(), today.getTime())),
          label: format(current, 'MMM d'),
          fullDate: format(current, 'yyyy-MM-dd'),
        });
        current.setDate(current.getDate() + 7);
      }
    } else {
      for (let i = 0; i < daysCount; i++) {
        const date = subDays(today, daysCount - 1 - i);
        buckets.push({
          start: date,
          end: date,
          label: daysCount <= 14 ? format(date, 'MMM d') : format(date, 'd'),
          fullDate: format(date, 'yyyy-MM-dd'),
        });
      }
    }
    
    // Calculate metrics for each bucket
    return buckets.map(bucket => {
      const bucketStart = startOfDay(bucket.start).getTime();
      const bucketEnd = new Date(bucket.end).setHours(23, 59, 59, 999);
      
      // Filter messages in this bucket
      const bucketMessages = allConversations.filter(msg => {
        const ms = getMessageTimeMs(msg);
        return ms >= bucketStart && ms <= bucketEnd;
      });
      
      // Count unique conversations
      const conversationCounts: Record<string, number> = {};
      let sentCount = 0;
      let failedCount = 0;
      
      bucketMessages.forEach(msg => {
        conversationCounts[msg.conversation_id] = (conversationCounts[msg.conversation_id] || 0) + 1;
        
        // Count outbound message statuses
        if (msg.outbound) {
          const status = (msg as any).latestStatus;
          if (status === 'sent' || status === 'delivered' || status === 'read' || status === 'failed') {
            sentCount++;
            if (status === 'failed') failedCount++;
          }
        }
      });
      
      const conversations = Object.keys(conversationCounts).length;
      const active = Object.values(conversationCounts).filter(c => c >= 2).length;
      const failedRate = sentCount > 0 ? (failedCount / sentCount) * 100 : 0;
      
      // Prospects would need daily breakdown from transition stats
      // For now, distribute evenly or use 0
      const prospects = 0;
      
      return {
        date: bucket.label,
        fullDate: bucket.fullDate,
        conversations,
        active,
        prospects,
        failedRate,
      };
    });
  }, [allConversations, period, aggregation]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0]?.payload;
    
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-2">{format(new Date(data.fullDate), 'MMMM d, yyyy')}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">{t('conversationsStarted')}:</span>
            <span className="font-medium">{data.conversations}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">{t('activeConversations')}:</span>
            <span className="font-medium">{data.active}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">{t('failedRate')}:</span>
            <span className="font-medium">{data.failedRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>{t('trendsOverTime')}</span>
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Aggregation toggle */}
            <ToggleGroup 
              type="single" 
              value={aggregation} 
              onValueChange={(v) => v && setAggregation(v as AggregationType)}
              className="bg-muted rounded-md p-0.5"
            >
              <ToggleGroupItem value="daily" className="text-xs px-2.5 py-1 h-7 data-[state=on]:bg-background">
                {t('daily')}
              </ToggleGroupItem>
              <ToggleGroupItem value="weekly" className="text-xs px-2.5 py-1 h-7 data-[state=on]:bg-background">
                {t('weekly')}
              </ToggleGroupItem>
            </ToggleGroup>
            
            {/* Period selector */}
            <Select value={period} onValueChange={(v: PeriodOption) => setPeriod(v)}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-500 rounded" />
            <span className="text-muted-foreground">{t('conversationsStarted')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-purple-500 rounded" />
            <span className="text-muted-foreground">{t('activeConversations')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-red-500 rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">{t('failedRate')} (%)</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              axisLine={false}
              tickLine={false}
              interval={chartData.length > 30 ? Math.floor(chartData.length / 8) : 'preserveStartEnd'}
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Conversations Started */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="conversations" 
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
            
            {/* Active Conversations */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="active" 
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#a855f7' }}
            />
            
            {/* Failed Rate */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="failedRate" 
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
