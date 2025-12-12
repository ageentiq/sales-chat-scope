const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'https://id-preview--65d6b0fb-6f75-4b0c-aa23-bc1d78fd7192.lovable.app',
      'https://65d6b0fb-6f75-4b0c-aa23-bc1d78fd7192.lovable.app'
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.error('❌ [CORS] Blocked origin:', origin);
      console.log('✅ [CORS] Allowed origins:', allowedOrigins);
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials',
    'ngrok-skip-browser-warning'
  ],
  exposedHeaders: [
    'Content-Length',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning, Accept, Origin, X-Requested-With');
  res.sendStatus(200);
});

// MongoDB connection
let db;
let client;
let conversationsCollection;
let analysisCollection;

async function connectToMongoDB() {
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.MONGODB_DATABASE || 'Osus');
    conversationsCollection = db.collection(process.env.MONGODB_CONVERSATIONS_COLLECTION || 'conversation_history');
    analysisCollection = db.collection(process.env.MONGODB_ANALYSIS_COLLECTION || 'analysis');
    
    // Initialize collections
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    console.log('Connected to MongoDB Atlas');
    console.log('Collections loaded: conversations, analysis, users');
    
    return { db, client };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Initialize database and start server
async function initializeApp() {
  try {
    // Connect to MongoDB
    const { db: connectedDb } = await connectToMongoDB();
    
    // API Routes - Initialize after DB connection
    app.use('/api/auth', authRoutes(connectedDb));
    app.use('/api/protected', auth(connectedDb));
    
    return connectedDb;
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Initialize the application
let appInitialized = initializeApp();

// Example protected route
app.get('/api/protected/user', (req, res) => {
  res.json({ 
    success: true, 
    user: req.user,
    message: 'This is a protected route' 
  });
});

// Public Routes

// Get all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    console.log('🔍 Fetching all conversations from MongoDB...');
    const conversations = await conversationsCollection.find({}).toArray();
    console.log('📊 Found', conversations.length, 'conversations');
    console.log('📋 Sample conversation:', conversations[0] || 'No conversations found');
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get unique conversations (latest message from each conversation)
// NOTE: This MUST come before /group/:conversationId to avoid route conflict
app.get('/api/conversations/unique', async (req, res) => {
  try {
    console.log('🔍 Fetching unique conversations from MongoDB...');
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
    
    console.log('📊 Found', conversations.length, 'unique conversations');
    console.log('📋 Sample unique conversation:', conversations[0] || 'No unique conversations found');
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('❌ Error fetching unique conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unique conversations'
    });
  }
});

// Get conversations by conversation ID
app.get('/api/conversations/group/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log('🔍 [API] Fetching messages for conversation_id:', conversationId);
    console.log('🔍 [API] conversationId length:', conversationId.length, 'chars:', JSON.stringify(conversationId));
    
    // First try exact match
    let conversations = await conversationsCollection
      .find({ conversation_id: conversationId })
      .sort({ timestamp: 1 })
      .toArray();
    
    console.log('📊 [API] Exact match found', conversations.length, 'messages');
    
    // If no exact match, try trimmed version
    if (conversations.length === 0) {
      console.log('🔍 [API] Trying with trimmed conversation_id...');
      conversations = await conversationsCollection
        .find({ conversation_id: conversationId.trim() })
        .sort({ timestamp: 1 })
        .toArray();
      
      console.log('📊 [API] Trimmed match found', conversations.length, 'messages');
    }
    
    // If still no match, try regex to find conversations with whitespace
    if (conversations.length === 0) {
      console.log('🔍 [API] Trying regex match with whitespace tolerance...');
      const regexPattern = `^\\s*${conversationId.trim()}\\s*$`;
      conversations = await conversationsCollection
        .find({ 
          conversation_id: { 
            $regex: new RegExp(regexPattern, 'i')
          } 
        })
        .sort({ timestamp: 1 })
        .toArray();
      
      console.log('📊 [API] Regex match found', conversations.length, 'messages');
      
      if (conversations.length > 0) {
        const actualId = conversations[0].conversation_id;
        console.log('⚠️ [API] WHITESPACE MISMATCH DETECTED!');
        console.log('    Requested ID:', JSON.stringify(conversationId));
        console.log('    Actual DB ID:', JSON.stringify(actualId));
        console.log('    Requested length:', conversationId.length);
        console.log('    Actual length:', actualId.length);
      }
    }
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('❌ [API] Error fetching conversations by group ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
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

// Get analysis data by conversation ID
app.get('/api/analysis/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log('🔍 [API] Fetching analysis for conversation_id:', conversationId);
    
    // Try exact match first
    let analysis = await analysisCollection.findOne({ conversation_id: conversationId });
    
    // If no exact match, try trimmed and regex
    if (!analysis) {
      analysis = await analysisCollection.findOne({ conversation_id: conversationId.trim() });
    }
    
    if (!analysis) {
      const regexPattern = `^\\s*${conversationId.trim()}\\s*$`;
      analysis = await analysisCollection.findOne({ 
        conversation_id: { 
          $regex: new RegExp(regexPattern, 'i')
        } 
      });
    }
    
    if (!analysis) {
      console.log('📊 [API] No analysis found for conversation:', conversationId);
      return res.json({
        success: true,
        data: null
      });
    }
    
    console.log('✅ [API] Analysis found for conversation:', conversationId);
    
    res.json({
      success: true,
      data: {
        conversation_id: analysis.conversation_id,
        summary: analysis.summary || '',
        analysis: analysis.analysis || '',
        transition: analysis.transition || ''
      }
    });
  } catch (error) {
    console.error('❌ [API] Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis'
    });
  }
});

// Get transition statistics from analysis collection
app.get('/api/analysis/stats/transitions', async (req, res) => {
  try {
    const allAnalysis = await analysisCollection.find({}).toArray();
    
    const stats = {
      noResponse: 0,
      futureInterest: 0,
      notInterested: 0,
      createProspect: 0,
      total: allAnalysis.length
    };
    
    allAnalysis.forEach(analysis => {
      const transition = (analysis.transition || '').toLowerCase().trim();
      
      if (transition.includes('no response') || transition.includes('لم يتم الرد')) {
        stats.noResponse++;
      } else if (transition.includes('not interested') || transition.includes('غير مهتم')) {
        // Check "Not Interested/غير مهتم" BEFORE "Future Interest" because "غير مهتم" contains "مهتم"
        stats.notInterested++;
      } else if (transition.includes('future interest') || transition.includes('مهتم بالمراحل القادمة') || transition.includes('مهتم')) {
        stats.futureInterest++;
      } else if (transition.includes('create prospect') || transition.includes('إنشاء صفقة') || transition.includes('prospect')) {
        stats.createProspect++;
      }
    });
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching transition stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transition stats' });
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
  try {
    await appInitialized;
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log('  PUT /api/conversations/:id - Update conversation');
      console.log('  DELETE /api/conversations/:id - Delete conversation');
    });

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down server...');
      
      // Close the server
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Close MongoDB connection if it exists
        if (client) {
          await client.close();
          console.log('MongoDB connection closed');
        }
        
        console.log('Process terminated');
        process.exit(0);
      });
    };

    // Handle different shutdown signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer().catch(error => {
    console.error('Unhandled error in server startup:', error);
    process.exit(1);
  });
}

// Export for testing
module.exports = { 
  app, 
  initializeApp, 
  connectToMongoDB,
  startServer
};
