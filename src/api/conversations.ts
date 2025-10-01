import { getConversationsCollection } from '@/lib/mongodb';
import { ConversationMessage } from '@/data/mockData';
import { Document } from 'mongodb';

export interface ConversationResponse {
  success: boolean;
  data?: ConversationMessage[];
  error?: string;
}

export interface SingleConversationResponse {
  success: boolean;
  data?: ConversationMessage;
  error?: string;
}

// Get all conversations
export async function getAllConversations(): Promise<ConversationResponse> {
  try {
    const collection = await getConversationsCollection();
    const conversations = await collection.find({}).toArray();
    
    return {
      success: true,
      data: conversations as unknown as ConversationMessage[]
    };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return {
      success: false,
      error: 'Failed to fetch conversations'
    };
  }
}

// Get conversations by conversation ID
export async function getConversationsByGroupId(conversationId: string): Promise<ConversationResponse> {
  try {
    const collection = await getConversationsCollection();
    const conversations = await collection
      .find({ conversation_id: conversationId })
      .sort({ timestamp: 1 })
      .toArray();
    
    return {
      success: true,
      data: conversations as unknown as ConversationMessage[]
    };
  } catch (error) {
    console.error('Error fetching conversations by group ID:', error);
    return {
      success: false,
      error: 'Failed to fetch conversations'
    };
  }
}

// Get unique conversations (latest message from each conversation)
export async function getUniqueConversations(): Promise<ConversationResponse> {
  try {
    const collection = await getConversationsCollection();
    
    // Use aggregation to get the latest message from each conversation
    const conversations = await collection.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$conversation_id',
          latestMessage: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestMessage' }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]).toArray();
    
    return {
      success: true,
      data: conversations as unknown as ConversationMessage[]
    };
  } catch (error) {
    console.error('Error fetching unique conversations:', error);
    return {
      success: false,
      error: 'Failed to fetch unique conversations'
    };
  }
}

// Create a new conversation message
export async function createConversationMessage(message: Omit<ConversationMessage, '_id'>): Promise<SingleConversationResponse> {
  try {
    const collection = await getConversationsCollection();
    
    const messageToInsert = {
      ...message,
      _id: undefined // Let MongoDB generate the ObjectId
    };
    
    const result = await collection.insertOne(messageToInsert);
    
    if (result.insertedId) {
      // Fetch the inserted document to get the complete data with MongoDB's ObjectId
      const insertedMessage = await collection.findOne({ _id: result.insertedId });
      return {
        success: true,
        data: insertedMessage as unknown as ConversationMessage
      };
    } else {
      return {
        success: false,
        error: 'Failed to create conversation message'
      };
    }
  } catch (error) {
    console.error('Error creating conversation message:', error);
    return {
      success: false,
      error: 'Failed to create conversation message'
    };
  }
}

// Update a conversation message
export async function updateConversationMessage(id: string, updates: Partial<ConversationMessage>): Promise<SingleConversationResponse> {
  try {
    const collection = await getConversationsCollection();
    const { ObjectId } = await import('mongodb');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return {
        success: false,
        error: 'Conversation message not found'
      };
    }
    
    const updatedMessage = await collection.findOne({ _id: new ObjectId(id) });
    
    return {
      success: true,
      data: updatedMessage as unknown as ConversationMessage
    };
  } catch (error) {
    console.error('Error updating conversation message:', error);
    return {
      success: false,
      error: 'Failed to update conversation message'
    };
  }
}

// Delete a conversation message
export async function deleteConversationMessage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const collection = await getConversationsCollection();
    const { ObjectId } = await import('mongodb');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return {
        success: false,
        error: 'Conversation message not found'
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting conversation message:', error);
    return {
      success: false,
      error: 'Failed to delete conversation message'
    };
  }
}
