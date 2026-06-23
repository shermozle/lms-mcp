#!/usr/bin/env node

import { LMSServer } from './mcp-server.js';
import { loadConfig } from './config.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get configuration from environment variables
const config = loadConfig();

// Create and run the server
const server = new LMSServer(config);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down LMS MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down LMS MCP Server...');
  process.exit(0);
});

// Start the server
server.run().catch((error) => {
  console.error('Failed to start LMS MCP Server:', error);
  process.exit(1);
});
