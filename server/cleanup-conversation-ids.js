const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupConversationIds() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DATABASE || 'Osus');
    const collection = db.collection(process.env.MONGODB_CONVERSATIONS_COLLECTION || 'converation_history');
    
    // Find all documents with whitespace in conversation_id
    const allConversations = await collection.find({}).toArray();
    console.log(`📊 Total conversations in database: ${allConversations.length}`);
    
    let updatedCount = 0;
    let whitespaceFound = 0;
    
    for (const conv of allConversations) {
      const originalId = conv.conversation_id;
      const trimmedId = originalId.trim();
      
      if (originalId !== trimmedId) {
        whitespaceFound++;
        console.log(`⚠️ Found whitespace in ID: "${originalId}" (length: ${originalId.length})`);
        console.log(`   Will update to: "${trimmedId}" (length: ${trimmedId.length})`);
        
        // Update the conversation_id
        await collection.updateOne(
          { _id: conv._id },
          { $set: { conversation_id: trimmedId } }
        );
        
        updatedCount++;
      }
    }
    
    console.log('\n✅ Cleanup complete!');
    console.log(`   Documents checked: ${allConversations.length}`);
    console.log(`   Whitespace found: ${whitespaceFound}`);
    console.log(`   Documents updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the cleanup
cleanupConversationIds().catch(console.error);
