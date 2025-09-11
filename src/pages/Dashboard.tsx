import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ConversationList } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";
import { 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Clock,
  BarChart3
} from "lucide-react";
import { mockConversations, getUniqueConversations } from "@/data/mockData";

const Dashboard = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const uniqueConversations = getUniqueConversations();
  const totalConversations = uniqueConversations.length;
  const totalMessages = mockConversations.length;
  const activeToday = uniqueConversations.filter(conv => 
    new Date(conv.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const avgResponseTime = "2.3 min";

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  if (selectedConversationId) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-4xl">
          <ChatView 
            conversationId={selectedConversationId}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
              <p className="text-muted-foreground">Track and analyze customer conversations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Conversations"
            value={totalConversations}
            icon={MessageCircle}
            trend="+12% from last week"
            variant="info"
          />
          <MetricCard
            title="Total Messages"
            value={totalMessages}
            icon={Users}
            trend="+8% from last week"
            variant="success"
          />
          <MetricCard
            title="Active Today"
            value={activeToday}
            icon={TrendingUp}
            trend="Updated live"
            variant="warning"
          />
          <MetricCard
            title="Avg Response Time"
            value={avgResponseTime}
            icon={Clock}
            trend="-15% improvement"
            variant="default"
          />
        </div>

        {/* Conversation List */}
        <div className="max-w-6xl mx-auto">
          <ConversationList 
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversationId}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;