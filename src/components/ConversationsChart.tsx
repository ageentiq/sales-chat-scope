import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Info, Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay, isWithinInterval } from "date-fns";
import { getMessageTimeMs } from "@/lib/timestamps";
import { ConversationMessage } from "@/data/mockData";

type FilterOption = '7days' | '14days' | '30days' | '90days';

interface ConversationsChartProps {
  conversations?: ConversationMessage[];
}

export const ConversationsChart = ({ conversations = [] }: ConversationsChartProps) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterOption>('30days');

  const filterOptions: { value: FilterOption; label: string; days: number }[] = [
    { value: '7days', label: t('last7Days'), days: 7 },
    { value: '14days', label: t('last14Days'), days: 14 },
    { value: '30days', label: t('last30Days'), days: 30 },
    { value: '90days', label: t('last90Days'), days: 90 },
  ];

  // Generate chart data from actual conversations based on days
  const data = useMemo(() => {
    const selectedFilter = filterOptions.find(f => f.value === filter);
    const daysCount = selectedFilter?.days || 30;
    
    const today = startOfDay(new Date());
    const startDate = subDays(today, daysCount - 1);
    
    // Create array of dates
    const dateArray: { date: Date; dateStr: string; displayDate: string }[] = [];
    for (let i = 0; i < daysCount; i++) {
      const date = subDays(today, daysCount - 1 - i);
      dateArray.push({
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        displayDate: daysCount <= 14 ? format(date, 'MMM d') : format(date, 'd'),
      });
    }
    
    // Count conversations by day
    const dayCounts: Record<string, number> = {};
    dateArray.forEach(d => {
      dayCounts[d.dateStr] = 0;
    });
    
    conversations.forEach(conv => {
      const convMs = getMessageTimeMs(conv);
      const convDate = startOfDay(new Date(convMs));
      const dateStr = format(convDate, 'yyyy-MM-dd');
      
      if (isWithinInterval(convDate, { start: startDate, end: today })) {
        dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
      }
    });
    
    // Convert to chart format
    return dateArray.map(d => ({
      day: d.displayDate,
      fullDate: d.dateStr,
      conversations: dayCounts[d.dateStr] || 0,
    }));
  }, [conversations, filter]);

  // Calculate total for the selected period
  const totalInPeriod = useMemo(() => {
    return data.reduce((sum, d) => sum + d.conversations, 0);
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{t('conversationsOverTime')}</span>
            <span className="text-sm font-normal text-muted-foreground">
              ({totalInPeriod} {t('total')})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              axisLine={false}
              tickLine={false}
              interval={data.length > 30 ? Math.floor(data.length / 10) : 'preserveStartEnd'}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return format(new Date(payload[0].payload.fullDate), 'MMMM d, yyyy');
                }
                return label;
              }}
              formatter={(value: number) => [value, t('conversations')]}
            />
            <Area 
              type="monotone" 
              dataKey="conversations" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              fill="url(#colorConversations)"
              dot={false}
              activeDot={{ r: 5, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
