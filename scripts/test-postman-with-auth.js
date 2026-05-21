#!/usr/bin/env node

/**
 * Postman Collection Tester with Authentication
 * Tests all endpoints with proper authorization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { authenticate, createAuthEnvironment } = require('./auth-helper');

// Try to load newman
let newman;
try {
  newman = require('newman');
} catch (e) {
  console.error('Newman not found. Install with: npm install --save-dev newman newman-reporter-htmlextra');
  process.exit(1);
}

const collectionPath = path.join(__dirname, '../postman/TUNLOG_full_postman_collection.json');
const envPath = path.join(__dirname, '../postman/local.postman_environment.json');
const reportDir = path.join(__dirname, '../reports/postman');
const baseUrl = process.env.POSTMAN_BASE_URL || 'http://localhost:6001';

// Ensure reports directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

console.log('🚀 Starting Postman Collection Tests with Authentication...\n');
console.log(`📋 Collection: ${collectionPath}`);
console.log(`📊 Report Directory: ${reportDir}`);
console.log(`🔌 API Base URL: ${baseUrl}\n`);

async function runTests() {
  try {
    // Step 1: Generate fresh collection from OpenAPI
    console.log('📥 Step 1: Generating collection from OpenAPI spec...');
    try {
      execSync('npm.cmd run generate:postman', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('✅ Collection generated\n');
    } catch (e) {
      console.warn('⚠️  Could not regenerate collection, using existing\n');
    }

    // Step 2: Authenticate
    console.log('🔐 Step 2: Authenticating...');
    const token = await authenticate(baseUrl);
    console.log(`✅ Token acquired: ${token.substring(0, 20)}...\n`);

    // Step 3: Fix collection variables
    console.log('🔧 Step 3: Fixing collection variables and adding auth...');
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
          // Add Authorization header
          const hasAuth = item.request.header.some(h => h.key === 'Authorization');
          if (!hasAuth) {
            item.request.header.push({
              key: 'Authorization',
              value: `Bearer ${token}`,
              type: 'text'
            });
          }
        }
      });
    }

    // Save modified collection
    fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
    console.log('✅ Collection updated with authorization headers\n');

    // Step 4: Run Newman tests
    console.log('🧪 Step 4: Running tests with Newman...\n');

    const htmlReportPath = path.join(reportDir, 'postman-test-results.html');
    const jsonReportPath = path.join(reportDir, 'postman-test-results.json');

    return new Promise((resolve, reject) => {
      newman.run({
        collection: collection,
        environment: createAuthEnvironment(token, baseUrl),
        reporters: ['cli', 'json', 'htmlextra'],
        reporter: {
          json: {
            export: jsonReportPath
          },
          htmlextra: {
            export: htmlReportPath
          }
        },
        abortOnFailure: false,
        abortOnError: false
      }, (err, summary) => {
        if (err) {
          console.error('❌ Test run failed:', err.message);
          reject(err);
        } else {
          console.log('\n✅ Test run completed');
          console.log(`📊 Results saved to: ${reportDir}`);
          console.log(`📄 HTML Report: ${htmlReportPath}`);
          console.log(`📋 JSON Report: ${jsonReportPath}`);
          resolve(summary);
        }
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests().then(() => {
  console.log('\n✨ All done!');
  process.exit(0);
}).catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
