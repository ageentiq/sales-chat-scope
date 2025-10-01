#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Sales Chat API Server...\n');

// Check if server directory exists
const serverDir = path.join(__dirname, '..', 'server');
if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found. Please ensure the server folder exists.');
  process.exit(1);
}

// Check if package.json exists in server directory
const packageJsonPath = path.join(serverDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Server package.json not found. Please ensure the server is set up correctly.');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(serverDir, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found in server directory.');
  console.log('📝 Please create a .env file with your MongoDB connection details.');
  console.log('📋 Copy server/env.example to server/.env and update the values.\n');
}

console.log('📦 Installing server dependencies...');

// Install server dependencies
const npmInstall = spawn('npm', ['install'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

npmInstall.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Server dependencies installed successfully!\n');
    
    console.log('🔧 Starting API server...');
    
    // Start the server
    const serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: serverDir,
      stdio: 'inherit',
      shell: true
    });
    
    serverProcess.on('close', (code) => {
      console.log(`\n🔚 API server stopped with code ${code}`);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down API server...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });
    
  } else {
    console.error('❌ Failed to install server dependencies.');
    process.exit(1);
  }
});

npmInstall.on('error', (error) => {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
});
