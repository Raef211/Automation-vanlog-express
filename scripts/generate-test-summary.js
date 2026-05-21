#!/usr/bin/env node

/**
 * Generates a summary report of Postman test results
 * Shows all test cases and their pass/fail status
 */

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '../reports/postman/postman-test-results.json');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Report not found:', reportPath);
  console.log('Run tests first with: npm.cmd run test:postman:full');
  process.exit(1);
}

try {
  const reportData = fs.readFileSync(reportPath, 'utf8');
  const report = JSON.parse(reportData);

  if (!report.run || !report.run.executions) {
    console.error('❌ Invalid report format');
    process.exit(1);
  }

  const executions = report.run.executions;
  let passCount = 0;
  let failCount = 0;
  const results = [];

  // Parse each execution
  executions.forEach((execution, index) => {
    const testName = execution.item?.name || `Test ${index + 1}`;
    const method = execution.request?.method || 'UNKNOWN';
    const url = execution.request?.url?.toString?.() || execution.request?.url || 'N/A';
    
    // Check for failures
    let hasFailed = false;
    let failReason = '';

    // Check response status
    if (execution.response && execution.response.code) {
      const code = execution.response.code;
      if (code >= 400) {
        hasFailed = true;
        failReason = `HTTP ${code}`;
      }
    }

    // Check for assertion failures
    if (execution.assertions) {
      execution.assertions.forEach(assertion => {
        if (!assertion.assertion?.includes?.('status code is 2xx')) {
          if (assertion.error) {
            hasFailed = true;
            failReason = assertion.error.message || 'Assertion failed';
          }
        }
      });
    }

    // Check for request errors
    if (execution.requestError) {
      hasFailed = true;
      failReason = execution.requestError.message || 'Request error';
    }

    const status = hasFailed ? '❌ FAIL' : '✅ PASS';
    if (hasFailed) {
      failCount++;
    } else {
      passCount++;
    }

    results.push({
      index: index + 1,
      name: testName,
      method: method,
      status: status,
      reason: failReason,
      code: execution.response?.code || 'N/A'
    });
  });

  // Display summary
  console.log('\n' + '='.repeat(100));
  console.log('📊 POSTMAN API TEST SUMMARY REPORT');
  console.log('='.repeat(100) + '\n');

  console.log(`📈 Overall Results:`);
  console.log(`   ✅ PASSED: ${passCount}/${executions.length}`);
  console.log(`   ❌ FAILED: ${failCount}/${executions.length}`);
  console.log(`   Success Rate: ${((passCount / executions.length) * 100).toFixed(2)}%\n`);

  console.log('='.repeat(100));
  console.log('TEST DETAILS:');
  console.log('='.repeat(100) + '\n');

  // Display table header
  console.log(
    `${'#'.padEnd(4)} | ${'Status'.padEnd(10)} | ${'HTTP'.padEnd(5)} | ${'Method'.padEnd(8)} | ${'Test Case Name'}`
  );
  console.log('-'.repeat(100));

  // Display each test
  results.forEach(result => {
    const statusDisplay = result.status;
    const httpCode = result.code.toString().padEnd(5);
    const method = (result.method || '').padEnd(8);
    console.log(
      `${result.index.toString().padEnd(4)} | ${statusDisplay.padEnd(10)} | ${httpCode} | ${method} | ${result.name}`
    );
    if (result.reason) {
      console.log(`     └─ Error: ${result.reason}`);
    }
  });

  console.log('\n' + '='.repeat(100));

  // Group by status
  console.log('\n📋 PASSED TESTS:');
  console.log('-'.repeat(100));
  results.filter(r => r.status === '✅ PASS').forEach(result => {
    console.log(`  ✅ ${result.method.padEnd(8)} - ${result.name}`);
  });

  if (failCount > 0) {
    console.log('\n❌ FAILED TESTS:');
    console.log('-'.repeat(100));
    results.filter(r => r.status === '❌ FAIL').forEach(result => {
      console.log(`  ❌ ${result.method.padEnd(8)} - ${result.name}`);
      if (result.reason) {
        console.log(`     └─ ${result.reason}`);
      }
    });
  }

  console.log('\n' + '='.repeat(100) + '\n');

} catch (error) {
  console.error('❌ Error parsing report:', error.message);
  process.exit(1);
}
