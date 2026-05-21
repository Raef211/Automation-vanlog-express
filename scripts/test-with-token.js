#!/usr/bin/env node

/**
 * Postman Collection Tester with Direct Token
 * Uses provided JWT token directly for all requests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load newman
let newman;
try {
  newman = require('newman');
} catch (e) {
  console.error('Newman not found. Install with: npm install --save-dev newman newman-reporter-htmlextra');
  process.exit(1);
}

// The valid JWT token from your login response
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTEzMDQyMiwiZXhwIjoxNzc5MjE2ODIyfQ.2p3tBfugfuquoUnaXG7IryHsSVtp8Er5hwkkr2QDmd0';
const baseUrl = 'http://localhost:6001';
const collectionPath = path.join(__dirname, '../postman/TUNLOG_full_postman_collection.json');
const reportDir = path.join(__dirname, '../reports/postman');

// Ensure reports directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

console.log('🚀 Starting Postman Collection Tests with Direct Token...\n');
console.log(`📋 Collection: ${collectionPath}`);
console.log(`📊 Report Directory: ${reportDir}`);
console.log(`🔌 API Base URL: ${baseUrl}`);
console.log(`🔐 Using JWT Token: ${ACCESS_TOKEN.substring(0, 20)}...\n`);

// Step 1: Generate fresh collection from OpenAPI
console.log('📥 Step 1: Generating collection from OpenAPI spec...');
try {
  execSync('npm.cmd run generate:postman', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
  console.log('✅ Collection generated\n');
} catch (e) {
  console.warn('⚠️  Could not regenerate collection, using existing\n');
}

// Step 2: Load and prepare collection
console.log('🔧 Step 2: Preparing collection with token...');
const collectionData = fs.readFileSync(collectionPath, 'utf8');
let collection = JSON.parse(collectionData);

// Function to recursively fix variables
const replaceVariables = (obj) => {
  if (typeof obj === 'string') {
    return obj
      .replace(/\{\{baseUrl\}\}/g, baseUrl)
      .replace(/\{\{baseurl\}\}/g, baseUrl);
  } else if (Array.isArray(obj)) {
    return obj.map(replaceVariables);
  } else if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = replaceVariables(obj[key]);
    }
    return result;
  }
  return obj;
};

collection = replaceVariables(collection);

// Add authorization header to all requests
if (collection.item) {
  collection.item.forEach(item => {
    if (item.request) {
      if (!item.request.header) {
        item.request.header = [];
      }
      // Remove existing auth headers
      item.request.header = item.request.header.filter(h => h.key !== 'Authorization');
      // Add new Authorization header with the valid token
      item.request.header.push({
        key: 'Authorization',
        value: `Bearer ${ACCESS_TOKEN}`,
        type: 'text'
      });
    }
  });
}

// Save modified collection
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('✅ Collection updated with Bearer token\n');

// Step 3: Run Newman tests
console.log('🧪 Step 3: Running tests with Newman...\n');

const htmlReportPath = path.join(reportDir, 'postman-test-results.html');
const jsonReportPath = path.join(reportDir, 'postman-test-results.json');

newman.run({
  collection: collection,
  environment: {
    id: 'postman-env',
    name: 'Postman Environment',
    values: [
      {
        key: 'baseUrl',
        value: baseUrl,
        enabled: true
      },
      {
        key: 'baseurl',
        value: baseUrl,
        enabled: true
      }
    ]
  },
  reporters: ['cli', 'json', 'htmlextra'],
  reporter: {
    json: {
      export: jsonReportPath
    },
    htmlextra: {
      export: htmlReportPath
    }
  },
  timeout: 30000,
  timeoutRequest: 8000,
  abortOnFailure: false,
  abortOnError: false
}, (err, summary) => {
  if (err) {
    console.error('❌ Test run failed:', err.message);
    process.exit(1);
  } else {
    console.log('\n✅ Test run completed');
    console.log(`📊 Results saved to: ${reportDir}`);
    console.log(`📄 HTML Report: ${htmlReportPath}`);
    console.log(`📋 JSON Report: ${jsonReportPath}`);
    process.exit(0);
  }
});
