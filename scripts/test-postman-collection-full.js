#!/usr/bin/env node

/**
 * Automated Postman Collection Tester
 * Tests all endpoints in the generated Postman collection
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load newman (command line runner for Postman)
let newman;
try {
  newman = require('newman');
} catch (e) {
  console.error('Newman not found. Install with: npm install --save-dev newman newman-reporter-htmlextra');
  process.exit(1);
}

const collectionPath = path.join(__dirname, '../postman/TUNLOG_full_postman_collection.json');
const reportDir = path.join(__dirname, '../reports/postman');
const baseUrl = process.env.POSTMAN_BASE_URL || 'http://localhost:6001';

// Ensure reports directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

console.log('🚀 Starting Postman Collection Tests...\n');
console.log(`📋 Collection: ${collectionPath}`);
console.log(`📊 Report Directory: ${reportDir}`);
console.log(`🔌 API Base URL: ${baseUrl}\n`);

// Step 1: Generate fresh collection from OpenAPI
console.log('📥 Step 1: Generating collection from OpenAPI spec...');
try {
  execSync('npm.cmd run generate:postman', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
  console.log('✅ Collection generated\n');
} catch (e) {
  console.warn('⚠️  Could not regenerate collection, using existing\n');
}

// Step 2: Fix collection variables
console.log('🔧 Step 2: Fixing collection variables...');
try {
  const collectionData = fs.readFileSync(collectionPath, 'utf8');
  let collection = JSON.parse(collectionData);

  const replaceVariables = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/{{baseUrl}}/g, baseUrl).replace(/{{baseurl}}/g, baseUrl);
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceVariables);
    }
    if (obj !== null && typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        result[key] = replaceVariables(obj[key]);
      }
      return result;
    }
    return obj;
  };

  collection = replaceVariables(collection);
  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  console.log(`✅ Variables fixed (baseUrl: ${baseUrl})\n`);
} catch (e) {
  console.error('❌ Error fixing collection:', e.message);
  process.exit(1);
}

// Step 3: Run the collection
console.log('🧪 Step 3: Running API tests...\n');

newman.run(
  {
    collection: collectionPath,
    reporters: ['cli', 'json', 'htmlextra'],
    reporter: {
      json: {
        export: path.join(reportDir, 'postman-test-results.json'),
      },
      htmlextra: {
        export: path.join(reportDir, 'postman-test-results.html'),
      },
    },
    abortOnFailure: false,
    abortOnError: false,
    timeout: 30000,
    timeoutRequest: 10000,
    timeoutScript: 5000,
  },
  function (err, summary) {
    if (err) {
      console.error('\n❌ Test Run Error:', err.message);
      process.exit(1);
    }

    console.log('\n✅ Test Run Completed\n');
    console.log('📊 Test Summary:');
    console.log(`   Total Requests: ${summary.run.stats.requests.total}`);
    console.log(`   ✓ Passed: ${summary.run.stats.requests.total - summary.run.stats.requests.failed}`);
    console.log(`   ✗ Failed: ${summary.run.stats.requests.failed}`);
    console.log(`   Assertions: ${summary.run.stats.assertions.total}`);
    console.log(`   ✓ Passed: ${summary.run.stats.assertions.total - summary.run.stats.assertions.failed}`);
    console.log(`   ✗ Failed: ${summary.run.stats.assertions.failed}\n`);

    // Show failures if any
    if (summary.run.failures.length > 0 && summary.run.failures.length <= 10) {
      console.log('❌ Sample Failures:');
      summary.run.failures.slice(0, 10).forEach((failure) => {
        console.log(`   - ${failure.source.name}: ${failure.error.message}`);
      });
      if (summary.run.failures.length > 10) {
        console.log(`   ... and ${summary.run.failures.length - 10} more failures`);
      }
      console.log();
    }

    console.log(`📈 Reports generated:`);
    console.log(`   JSON: ${path.join(reportDir, 'postman-test-results.json')}`);
    console.log(`   HTML: ${path.join(reportDir, 'postman-test-results.html')}\n`);

    // Exit with error code if tests failed
    process.exit(summary.run.failures.length > 0 ? 1 : 0);
  }
);
