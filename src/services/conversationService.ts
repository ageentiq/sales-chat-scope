import { ConversationMessage } from '@/data/mockData';

// Configuration for API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sales-chat-api.onrender.com/api';

export class ConversationService {
  static async getAllConversations(): Promise<ConversationMessage[]> {
    try {
      console.log('🔍 [ConversationService] Fetching conversations from:', `${API_BASE_URL}/conversations`);
      const response = await fetch(`${API_BASE_URL}/conversations`);
      console.log('📡 [ConversationService] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 [ConversationService] API Response:', result);
      
      if (result.success && result.data) {
        console.log('✅ [ConversationService] Successfully fetched', result.data.length, 'conversations');
        // Normalize MongoDB data format
        const normalizedData = result.data.map((item: any) => ({
          ...item,
          _id: typeof item._id === 'string' ? item._id : item._id?.$oid || item._id
        }));
        console.log('🔄 [ConversationService] Normalized data:', normalizedData);
        return normalizedData;
      }
      
      console.error('❌ [ConversationService] Failed to fetch conversations:', result.error);
      return [];
    } catch (error) {
      console.error('💥 [ConversationService] Error fetching conversations:', error);
      return [];
    }
  }

  static async getConversationsByGroupId(conversationId: string): Promise<ConversationMessage[]> {
    try {
      console.log('🔍 [ConversationService] Fetching messages for conversation:', conversationId);
      console.log('🔗 [ConversationService] URL:', `${API_BASE_URL}/conversations/group/${conversationId}`);
      
      const response = await fetch(`${API_BASE_URL}/conversations/group/${conversationId}`);
      console.log('📡 [ConversationService] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ [ConversationService] HTTP error!', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 [ConversationService] API Response for conversation:', conversationId, result);
      
      if (result.success && result.data) {
        console.log('✅ [ConversationService] Successfully fetched', result.data.length, 'messages');
        // Normalize MongoDB data format
        const normalizedData = result.data.map((item: any) => ({
          ...item,
          _id: typeof item._id === 'string' ? item._id : item._id?.$oid || item._id
        }));
        console.log('🔄 [ConversationService] Normalized messages:', normalizedData);
        return normalizedData;
      }
      
      console.error('❌ [ConversationService] Failed to fetch conversations by group ID:', result.error);
      return [];
    } catch (error) {
      console.error('💥 [ConversationService] Error fetching conversations by group ID:', error);
      return [];
    }
  }

  static async getUniqueConversations(): Promise<ConversationMessage[]> {
    try {
      console.log('🔍 [ConversationService] Fetching unique conversations from:', `${API_BASE_URL}/conversations/unique`);
      const response = await fetch(`${API_BASE_URL}/conversations/unique`);
      console.log('📡 [ConversationService] Unique response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 [ConversationService] Unique API Response:', result);
      
      if (result.success && result.data) {
        console.log('✅ [ConversationService] Successfully fetched', result.data.length, 'unique conversations');
        // Normalize MongoDB data format
        const normalizedData = result.data.map((item: any) => ({
          ...item,
          _id: typeof item._id === 'string' ? item._id : item._id?.$oid || item._id
        }));
        console.log('🔄 [ConversationService] Normalized unique data:', normalizedData);
        return normalizedData;
      }
      
      console.error('❌ [ConversationService] Failed to fetch unique conversations:', result.error);
      return [];
    } catch (error) {
      console.error('💥 [ConversationService] Error fetching unique conversations:', error);
      return [];
    }
  }

  static async createConversationMessage(message: Omit<ConversationMessage, '_id'>): Promise<ConversationMessage | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Normalize MongoDB data format
        const normalizedData = {
          ...result.data,
          _id: typeof result.data._id === 'string' ? result.data._id : result.data._id?.$oid || result.data._id
        };
        return normalizedData;
      }
      
      console.error('Failed to create conversation message:', result.error);
      return null;
    } catch (error) {
      console.error('Error creating conversation message:', error);
      return null;
    }
  }

  static async updateConversationMessage(id: string, updates: Partial<ConversationMessage>): Promise<ConversationMessage | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Normalize MongoDB data format
        const normalizedData = {
          ...result.data,
          _id: typeof result.data._id === 'string' ? result.data._id : result.data._id?.$oid || result.data._id
        };
        return normalizedData;
      }
      
      console.error('Failed to update conversation message:', result.error);
      return null;
    } catch (error) {
      console.error('Error updating conversation message:', error);
      return null;
    }
  }

  static async deleteConversationMessage(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      }
      
      console.error('Failed to delete conversation message:', result.error);
      return false;
    } catch (error) {
      console.error('Error deleting conversation message:', error);
      return false;
    }
  }

  static getDataMode(): 'mock' | 'mongodb' {
    return 'mongodb';
  }

  static async getAnalysisByConversationId(conversationId: string): Promise<{
    conversation_id: string;
    summary: string;
    analysis: string;
    transition: string;
  } | null> {
    try {
      console.log('🔍 [ConversationService] Fetching analysis for conversation:', conversationId);
      
      const response = await fetch(`${API_BASE_URL}/analysis/${conversationId}`);
      console.log('📡 [ConversationService] Analysis response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ [ConversationService] HTTP error!', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 [ConversationService] Analysis response:', result);
      
      if (result.success) {
        return result.data;
      }
      
      console.error('❌ [ConversationService] Failed to fetch analysis:', result.error);
      return null;
    } catch (error) {
      console.error('💥 [ConversationService] Error fetching analysis:', error);
      return null;
    }
  }

  static async getTransitionStats(): Promise<{
    noResponse: number;
    futureInterest: number;
    notInterested: number;
    createProspect: number;
    total: number;
  }> {
    try {
      console.log('🔍 [ConversationService] Fetching transition stats from:', `${API_BASE_URL}/analysis/stats/transitions`);
      const response = await fetch(`${API_BASE_URL}/analysis/stats/transitions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 [ConversationService] Transition stats response:', result);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return { noResponse: 0, futureInterest: 0, notInterested: 0, createProspect: 0, total: 0 };
    } catch (error) {
      console.error('💥 [ConversationService] Error fetching transition stats:', error);
      return { noResponse: 0, futureInterest: 0, notInterested: 0, createProspect: 0, total: 0 };
    }
  }
}
