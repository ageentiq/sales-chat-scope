# MongoDB Atlas Integration Setup

## Overview

Your Sales Chat application now supports fetching messages from MongoDB Atlas with automatic updates every 30 seconds.

## Quick Start

### 1. Set up MongoDB Connection

1. **Create a `.env` file in the `server` directory:**
   ```bash
   cp server/env.example server/.env
   ```

2. **Update the `.env` file with your MongoDB Atlas credentials:**
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   MONGODB_DATABASE=sales_chat
   MONGODB_CONVERSATIONS_COLLECTION=conversations
   PORT=3001
   NODE_ENV=development
   ```

### 2. Start the API Server

**Option A: Using the setup script (recommended)**
```bash
node scripts/start-api-server.js
```

**Option B: Manual setup**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm run dev
```

### 3. Start the Frontend

In a new terminal window:
```bash
npm run dev
```

## Features

### ✅ Real-time Data Fetching
- Messages are fetched from your MongoDB Atlas collection
- Automatic refresh every 30 seconds
- Background updates even when tab is not active

### ✅ API Endpoints
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/unique` - Get unique conversations (latest from each group)
- `GET /api/conversations/group/:id` - Get conversations by group ID
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### ✅ Connection Status
The dashboard shows:
- Data source (MongoDB Atlas vs Mock Data)
- Connection status
- Auto-refresh indicator
- Error messages if connection fails

## Data Structure

Your MongoDB collection should have documents with this structure:
```json
{
  "_id": {"$oid": "68c305deea02f24a6ae9fed3"},
  "conversation_id": "966544119823",
  "inbound": "ايه مستحق\nراتبي ١٥٠٠٠\nايه نعم",
  "outbound": "سلمت يا بدر، معلومات وافية.\n\nأبشر يا طويل العمر، بما إنك مستحقمشروع هو عام 2029 بإذن الله.\n\nهل الشقق هذي تناسب اهتماماتك يا بدر؟",
  "media": null,
  "timestamp": "2025-09-11 20:09"
}
```

## Troubleshooting

### API Server Won't Start
1. Check if port 3001 is available
2. Verify MongoDB connection string in `.env`
3. Ensure MongoDB Atlas allows connections from your IP

### No Data Showing
1. Check browser console for errors
2. Verify API server is running on http://localhost:3001
3. Test API endpoints directly:
   ```bash
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/conversations
   ```

### Fallback to Mock Data
If MongoDB connection fails, the app automatically falls back to mock data. You'll see "Mock Data" in the connection status.

## Development Mode

To switch back to mock data for development:
1. Edit `src/services/conversationService.ts`
2. Change `USE_MOCK_DATA = true`
3. Restart the frontend

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production` in server `.env`
2. Use a process manager like PM2
3. Set up proper CORS for your domain
4. Use environment variables for sensitive data

## Support

If you encounter issues:
1. Check the server console for error messages
2. Verify MongoDB Atlas cluster is running
3. Ensure your IP is whitelisted in MongoDB Atlas
4. Check that the database and collection names match your setup
