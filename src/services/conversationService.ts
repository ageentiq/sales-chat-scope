import { ConversationMessage } from '@/data/mockData';

// Configuration for API calls
const API_BASE_URL = 'http://localhost:3001/api';

export class ConversationService {
  static async getAllConversations(): Promise<ConversationMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      console.error('Failed to fetch conversations:', result.error);
      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async getConversationsByGroupId(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/group/${conversationId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      console.error('Failed to fetch conversations by group ID:', result.error);
      return [];
    } catch (error) {
      console.error('Error fetching conversations by group ID:', error);
      return [];
    }
  }

  static async getUniqueConversations(): Promise<ConversationMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/unique`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      console.error('Failed to fetch unique conversations:', result.error);
      return [];
    } catch (error) {
      console.error('Error fetching unique conversations:', error);
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
        return result.data;
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
        return result.data;
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
}
