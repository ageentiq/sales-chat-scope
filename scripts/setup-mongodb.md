# MongoDB Atlas Setup Guide

This guide will help you connect your sales chat application to MongoDB Atlas.

## Prerequisites

1. A MongoDB Atlas account (free tier available at [mongodb.com/atlas](https://mongodb.com/atlas))
2. Node.js installed on your system

## Step 1: Create a MongoDB Atlas Cluster

1. Sign up for MongoDB Atlas at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new cluster (choose the free M0 tier for development)
3. Wait for the cluster to be created

## Step 2: Set Up Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Note down the username and password

## Step 3: Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, you can add "0.0.0.0/0" to allow access from anywhere
4. For production, add only your server's IP address

## Step 4: Get Your Connection String

1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as the driver
5. Copy the connection string

## Step 5: Configure Environment Variables

1. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your MongoDB Atlas details:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/sales_chat?retryWrites=true&w=majority
   MONGODB_DATABASE=sales_chat
   MONGODB_CONVERSATIONS_COLLECTION=conversations
   NODE_ENV=development
   ```

   Replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - `<cluster-url>` with your cluster URL

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Test the Connection

The application will automatically:
- Use mock data in development if no MongoDB URI is provided
- Connect to MongoDB Atlas when the URI is configured
- Create the database and collection if they don't exist

## Data Structure

The application uses the following MongoDB collection structure:

```javascript
// Collection: conversations
{
  "_id": {
    "$oid": "68c305deea02f24a6ae9fed3"
  },
  "conversation_id": "966544119823",
  "inbound": "Customer message text",
  "outbound": "Sales team response text", 
  "media": null,
  "timestamp": "2025-09-11 20:09"
}
```

### Field Descriptions:
- `_id`: MongoDB ObjectId with `$oid` structure
- `conversation_id`: Unique identifier for the conversation thread
- `inbound`: Customer's message (supports Arabic and English)
- `outbound`: Sales team's response
- `media`: Media attachments (currently null, can be extended for file support)
- `timestamp`: Message timestamp in format "YYYY-MM-DD HH:MM"

## Migration from Mock Data

The existing mock data will be used in development mode. To migrate to MongoDB:

1. Set up your MongoDB Atlas connection
2. The application will automatically use the database instead of mock data
3. You can add your own conversation data through the API or directly in MongoDB

## Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Check that your IP address is whitelisted
- Ensure your database user has the correct permissions

### Environment Variables
- Make sure `.env.local` is in your project root
- Verify all required variables are set
- Restart your development server after changing environment variables

### Data Not Loading
- Check the browser console for error messages
- Verify your MongoDB cluster is running
- Check the network tab for failed API requests

## Production Deployment

For production deployment:

1. Use environment variables provided by your hosting platform
2. Set `NODE_ENV=production`
3. Use a more restrictive IP whitelist
4. Consider using MongoDB's connection pooling for better performance
