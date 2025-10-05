import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Info } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useMemo } from "react";

export const ConversationsChart = () => {
  const { t } = useLanguage();
  const { data: allConversations = [] } = useConversations();

  // Generate chart data from actual conversations
  const data = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCounts: Record<string, number> = {};
    
    // Initialize all months with 0
    months.forEach(month => {
      monthCounts[month] = 0;
    });
    
    // Count conversations by month
    allConversations.forEach(conv => {
      const date = new Date(conv.timestamp);
      const monthName = months[date.getMonth()];
      if (monthName) {
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });
    
    // Convert to chart format
    return months.map(month => ({
      month,
      conversations: monthCounts[month] || 0,
    }));
  }, [allConversations]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{t('conversationsOverTime')}</span>
          <Info className="h-4 w-4 text-muted-foreground" />
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
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
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
