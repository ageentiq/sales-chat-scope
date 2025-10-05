# Sales Chat Application - Project Instructions Documentation

## Overview
This document contains all the instructions and changes made to the sales chat application during development.

## Project Structure
- **Frontend**: React + TypeScript + Vite (port 8080)
- **Backend**: Node.js + Express + MongoDB (port 3001)
- **Database**: MongoDB Atlas

## Key Instructions and Changes Made

### 1. Initial Setup and Configuration

#### API Service Configuration
- **File**: `src/services/conversationService.ts`
- **Configuration**: 
  - API_BASE_URL: `http://localhost:3001/api`
  - All API calls use localhost endpoints
  - No ngrok headers or configuration
  - Clean fetch calls without special headers

#### Vite Configuration
- **File**: `vite.config.ts`
- **Configuration**:
  - Host: `"::"` (allows external connections)
  - Port: `8080`
  - No ngrok configuration
  - Standard React + TypeScript setup

#### Test API File
- **File**: `public/test-api.html`
- **Configuration**:
  - All API URLs: `http://localhost:3001/api/*`
  - No ngrok headers
  - Simple fetch calls for testing endpoints

### 2. Ngrok Integration (Temporarily Implemented)

#### Initial Ngrok Setup
- **Request**: "i ran ngrok session but it does not retrieve any data"
- **Problem**: Frontend was using localhost IP (`http://172.20.0.138:3001/api`) instead of ngrok URL
- **Solution**: Updated API_BASE_URL to use ngrok URL (`https://b299b638c4f2.ngrok-free.app/api`)

#### Ngrok HTML Response Issue
- **Problem**: "Unexpected token '<'" error when calling API through ngrok
- **Root Cause**: Ngrok was returning HTML warning page instead of JSON
- **Solution**: Added `ngrok-skip-browser-warning: true` header to all API calls

#### Files Modified for Ngrok:
1. **src/services/conversationService.ts**:
   - Changed API_BASE_URL to ngrok URL
   - Added ngrok-skip-browser-warning header to all fetch calls
   - Updated all API methods (GET, POST, PUT, DELETE)

2. **public/test-api.html**:
   - Updated all API URLs to use ngrok
   - Added ngrok-skip-browser-warning header to test requests

3. **vite.config.ts**:
   - Added ngrok host configuration
   - Configured HMR for ngrok
   - Set allowedHosts for ngrok URL

### 3. Reversion to Localhost

#### Request: "delete all the ngrok stuff return to local host"
- **Action**: Reverted all ngrok configurations back to localhost
- **Changes Made**:

1. **src/services/conversationService.ts**:
   - Reverted API_BASE_URL to `http://localhost:3001/api`
   - Removed all ngrok-skip-browser-warning headers
   - Restored simple fetch calls

2. **public/test-api.html**:
   - Reverted all API URLs to `http://localhost:3001/api/*`
   - Removed ngrok headers

3. **vite.config.ts**:
   - Removed ngrok host configuration
   - Removed ngrok-specific HMR settings
   - Restored simple localhost server configuration

### 4. Git Reset and Restoration

#### Request: "git deleted all the changes we made, restyle everything to what we ended up before ngrok changes"
- **Problem**: Git reset removed all localhost configurations
- **Action**: Restored all files to pre-ngrok localhost state
- **Result**: Clean localhost configuration without ngrok dependencies

## Current Final Configuration

### API Endpoints
- **Base URL**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/api/health`
- **All Conversations**: `http://localhost:3001/api/conversations`
- **Unique Conversations**: `http://localhost:3001/api/conversations/unique`
- **Conversation by Group**: `http://localhost:3001/api/conversations/group/:id`

### Frontend Configuration
- **URL**: `http://localhost:8080`
- **Host**: `"::"` (allows external connections)
- **Port**: `8080`

### Backend Configuration
- **URL**: `http://localhost:3001`
- **Port**: `3001`
- **Database**: MongoDB Atlas
- **CORS**: Enabled for all origins (temporary for debugging)

## Key Features Implemented

### Dashboard
- **File**: `src/pages/Dashboard.tsx`
- **Features**:
  - Total conversations count
  - Total messages count
  - Active conversations today
  - Average response time
  - Conversations over time chart
  - Activity overview
  - Language distribution
  - Performance metrics

### Data Management
- **Hooks**: `src/hooks/useConversations.ts`
- **Features**:
  - React Query for data fetching
  - Auto-refetch every 30 seconds
  - Background refetching
  - Caching and state management

### API Service
- **File**: `src/services/conversationService.ts`
- **Methods**:
  - `getAllConversations()`
  - `getUniqueConversations()`
  - `getConversationsByGroupId()`
  - `createConversationMessage()`
  - `updateConversationMessage()`
  - `deleteConversationMessage()`

## Development Commands

### Start Backend Server
```bash
cd server
npm start
```

### Start Frontend Server
```bash
npm run dev
```

### Test API
- Open `http://localhost:3001/test-api.html`
- Or use `http://localhost:8080` for the main application

## Environment Requirements
- Node.js
- MongoDB Atlas connection
- Environment variables in `server/.env`

## Notes
- All ngrok configurations have been removed
- Application is configured for localhost development
- MongoDB integration is working
- Dashboard displays real-time conversation data
- API endpoints are fully functional

## Troubleshooting
- Ensure backend server is running on port 3001
- Ensure frontend server is running on port 8080
- Check MongoDB connection in server logs
- Verify environment variables are set correctly
- Use test-api.html to verify API endpoints
