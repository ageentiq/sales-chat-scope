const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
let conversationsCollection;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.MONGODB_DATABASE || 'Osus');
    conversationsCollection = db.collection(process.env.MONGODB_CONVERSATIONS_COLLECTION || 'converation_history');
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// API Routes

// Get all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await conversationsCollection.find({}).toArray();
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get conversations by conversation ID
app.get('/api/conversations/group/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversations = await conversationsCollection
      .find({ conversation_id: conversationId })
      .sort({ timestamp: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations by group ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get unique conversations (latest message from each conversation)
app.get('/api/conversations/unique', async (req, res) => {
  try {
    const conversations = await conversationsCollection.aggregate([
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
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching unique conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unique conversations'
    });
  }
});

// Create a new conversation message
app.post('/api/conversations', async (req, res) => {
  try {
    const { conversation_id, inbound, outbound, media, timestamp } = req.body;
    
    const newMessage = {
      conversation_id,
      inbound,
      outbound,
      media: media || null,
      timestamp: timestamp || new Date().toISOString()
    };
    
    const result = await conversationsCollection.insertOne(newMessage);
    
    if (result.insertedId) {
      const insertedMessage = await conversationsCollection.findOne({ _id: result.insertedId });
      res.json({
        success: true,
        data: insertedMessage
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create conversation message'
      });
    }
  } catch (error) {
    console.error('Error creating conversation message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation message'
    });
  }
});

// Update a conversation message
app.put('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const result = await conversationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      res.status(404).json({
        success: false,
        error: 'Conversation message not found'
      });
      return;
    }
    
    const updatedMessage = await conversationsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error updating conversation message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation message'
    });
  }
});

// Delete a conversation message
app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await conversationsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        error: 'Conversation message not found'
      });
      return;
    }
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting conversation message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation message'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('API endpoints available:');
    console.log('  GET /api/conversations - Get all conversations');
    console.log('  GET /api/conversations/unique - Get unique conversations');
    console.log('  GET /api/conversations/group/:id - Get conversations by group ID');
    console.log('  POST /api/conversations - Create new conversation');
    console.log('  PUT /api/conversations/:id - Update conversation');
    console.log('  DELETE /api/conversations/:id - Delete conversation');
  });
}

startServer().catch(console.error);
