#!/usr/bin/env node

/**
 * Automated Postman Collection Tester
 * Tests all endpoints in the generated Postman collection
 */

const fs = require('fs');
const path = require('path');

// Try to load newman (command line runner for Postman)
let newman;
try {
  newman = require('newman');
} catch (e) {
  console.error('Newman not found. Install with: npm install --save-dev newman newman-reporter-htmlextra');
  process.exit(1);
}

const collectionPath = path.join(__dirname, '../postman/TUNLOG_full_postman_collection.json');
const environmentPath = path.join(__dirname, '../postman/local.postman_environment.json');
const reportDir = path.join(__dirname, '../reports/postman');

// Ensure reports directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

console.log('🚀 Starting Postman Collection Tests...\n');
console.log(`📋 Collection: ${collectionPath}`);
console.log(`📊 Report Directory: ${reportDir}\n`);

// Run the collection with Newman
newman.run(
  {
    collection: collectionPath,
    environment: {
      id: 'local-env',
      name: 'Local Development',
      values: [
        {
          key: 'baseUrl',
          value: process.env.POSTMAN_BASE_URL || 'http://localhost:6001',
          enabled: true,
        },
      ],
    },
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
    if (summary.run.failures.length > 0) {
      console.log('❌ Failures:');
      summary.run.failures.forEach((failure) => {
        console.log(`   - ${failure.source.name}: ${failure.error.message}`);
      });
      console.log();
    }

    console.log(`📈 Reports generated:`);
    console.log(`   JSON: ${path.join(reportDir, 'postman-test-results.json')}`);
    console.log(`   HTML: ${path.join(reportDir, 'postman-test-results.html')}\n`);

    // Exit with error code if tests failed
    process.exit(summary.run.failures.length > 0 ? 1 : 0);
  }
);
