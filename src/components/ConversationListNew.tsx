import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Clock, 
  Phone, 
  Mail, 
  Star,
  MoreVertical,
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { ConversationMessage } from "@/data/mockData";
import { useUniqueConversations } from "@/hooks/useConversations";
import { useLanguage } from "@/contexts/LanguageContext";
import { getObjectIdString } from "@/lib/utils";

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
}

export const ConversationList = ({ 
  onConversationSelect, 
  selectedConversationId 
}: ConversationListProps) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: conversations = [], isLoading } = useUniqueConversations();

  // Fallback to ensure we always have data
  const safeConversations = conversations || [];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        day: '2-digit',
        month: 'short'
      });
    }
  };

  const filteredConversations = safeConversations.filter(conv =>
    conv.conversation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.inbound.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.outbound.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversationStatus = (conv: ConversationMessage) => {
    const hoursSinceLastMessage = (Date.now() - new Date(conv.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastMessage < 1) return 'active';
    if (hoursSinceLastMessage < 24) return 'recent';
    return 'inactive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'recent': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No conversations found</h3>
              <p className="text-slate-500 dark:text-slate-400">{t('noConversationsFound')}</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredConversations.map((conversation) => {
              const status = getConversationStatus(conversation);
              const isSelected = selectedConversationId === conversation.conversation_id;
              
              return (
                <div
                  key={getObjectIdString(conversation._id)}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all duration-200 border-l-4 ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                      : 'border-transparent'
                  }`}
                  onClick={() => onConversationSelect(conversation.conversation_id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(status)} rounded-full border-2 border-white dark:border-slate-800`}></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            Customer {conversation.conversation_id.slice(-4)}
                          </h4>
                          {status === 'active' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTimestamp(conversation.timestamp)}
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Message Preview */}
                      <div className="space-y-1">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-blue-600 dark:text-blue-400">Customer:</span> {truncateText(conversation.inbound)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-green-600 dark:text-green-400">Response:</span> {truncateText(conversation.outbound)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Star
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
