#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server works
 * This script simulates MCP client requests to test the server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test requests
const testRequests = [
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  },
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'test_connection',
      arguments: {}
    }
  }
];

async function testMCPServer() {
  console.log('Starting MCP server test...\n');

  const serverPath = join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let responseCount = 0;
  const expectedResponses = testRequests.length;

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        console.log('Response:', JSON.stringify(response, null, 2));
        responseCount++;
        
        if (responseCount >= expectedResponses) {
          console.log('\nTest completed successfully!');
          server.kill();
          process.exit(0);
        }
      } catch (e) {
        console.log('Non-JSON output:', line);
      }
    }
  });

  server.stderr.on('data', (data) => {
    console.log('Server stderr:', data.toString());
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });

  // Send test requests
  setTimeout(() => {
    console.log('Sending test requests...\n');
    for (const request of testRequests) {
      server.stdin.write(JSON.stringify(request) + '\n');
    }
  }, 1000);

  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('Test timed out');
    server.kill();
    process.exit(1);
  }, 10000);
}

testMCPServer().catch(console.error);

