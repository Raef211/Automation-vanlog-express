#!/usr/bin/env node

/**
 * Generates a Beautiful HTML Dashboard for Postman Test Results
 */

const fs = require('fs');
const path = require('path');

const reportDir = path.join(__dirname, '../reports/postman');
const reportPath = path.join(reportDir, 'postman-test-results.json');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Report not found:', reportPath);
  process.exit(1);
}

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
  let hasFailed = false;
  let failReason = '';
  let responseCode = 'N/A';

  // Check response status
  if (execution.response && execution.response.code) {
    responseCode = execution.response.code;
    if (responseCode >= 400) {
      hasFailed = true;
      failReason = `HTTP ${responseCode}`;
    }
  }

  // Check for request errors
  if (execution.requestError) {
    hasFailed = true;
    failReason = execution.requestError.message || 'Request error';
  }

  if (hasFailed) {
    failCount++;
  } else {
    passCount++;
  }

  results.push({
    index: index + 1,
    name: testName,
    method: method,
    status: hasFailed ? 'FAIL' : 'PASS',
    reason: failReason,
    code: responseCode
  });
});

// Calculate statistics
const totalTests = executions.length;
const passPercentage = ((passCount / totalTests) * 100).toFixed(2);
const failPercentage = ((failCount / totalTests) * 100).toFixed(2);

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Postman API Test Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 32px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-card.pass {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        
        .stat-card.fail {
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
        }
        
        .stat-number {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .progress-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .progress-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 20px;
        }
        
        .progress-bar {
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            display: flex;
            margin-bottom: 20px;
        }
        
        .progress-fill-pass {
            background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
            height: 100%;
            width: ${passPercentage}%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        
        .progress-fill-fail {
            background: linear-gradient(90deg, #eb3349 0%, #f45c43 100%);
            height: 100%;
            width: ${failPercentage}%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        
        .tests-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .tests-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 20px;
        }
        
        .test-item {
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            transition: background 0.3s ease;
        }
        
        .test-item:hover {
            background: #f9f9f9;
        }
        
        .test-item:last-child {
            border-bottom: none;
        }
        
        .test-status {
            min-width: 80px;
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 4px;
            text-align: center;
            margin-right: 15px;
        }
        
        .test-status.pass {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .test-status.fail {
            background: #ffebee;
            color: #c62828;
        }
        
        .test-method {
            min-width: 70px;
            font-weight: 600;
            color: #667eea;
            margin-right: 15px;
            padding: 4px 8px;
            background: #f0f0ff;
            border-radius: 4px;
            text-align: center;
        }
        
        .test-name {
            flex: 1;
            color: #333;
            margin-right: 15px;
        }
        
        .test-code {
            min-width: 60px;
            text-align: center;
            font-weight: bold;
            color: #666;
        }
        
        .test-error {
            min-width: 120px;
            color: #d32f2f;
            font-size: 12px;
        }
        
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 16px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .filter-btn:hover {
            border-color: #667eea;
            color: #667eea;
        }
        
        .filter-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .timestamp {
            color: #999;
            font-size: 12px;
            margin-top: 10px;
        }

        @media (max-width: 768px) {
            .test-item {
                flex-wrap: wrap;
            }
            
            .test-name {
                flex: 1 0 100%;
                margin-bottom: 10px;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Postman API Test Dashboard</h1>
            <p>Real-time API Test Results Report</p>
            
            <div class="stats-grid">
                <div class="stat-card pass">
                    <div class="stat-number">${passCount}</div>
                    <div class="stat-label">PASSED</div>
                </div>
                <div class="stat-card fail">
                    <div class="stat-number">${failCount}</div>
                    <div class="stat-label">FAILED</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalTests}</div>
                    <div class="stat-label">TOTAL TESTS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${passPercentage}%</div>
                    <div class="stat-label">SUCCESS RATE</div>
                </div>
            </div>
        </div>
        
        <div class="progress-section">
            <h2>Test Results Distribution</h2>
            <div class="progress-bar">
                ${passCount > 0 ? `<div class="progress-fill-pass">${passPercentage}% PASS</div>` : ''}
                ${failCount > 0 ? `<div class="progress-fill-fail">${failPercentage}% FAIL</div>` : ''}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px;">
                <div>
                    <strong>✅ Passed:</strong> ${passCount} / ${totalTests} tests
                </div>
                <div>
                    <strong>❌ Failed:</strong> ${failCount} / ${totalTests} tests
                </div>
            </div>
        </div>
        
        <div class="tests-section">
            <h2>Test Results</h2>
            
            <div class="filters">
                <button class="filter-btn active" onclick="filterTests('all')">All (${totalTests})</button>
                <button class="filter-btn" onclick="filterTests('pass')">✅ Passed (${passCount})</button>
                <button class="filter-btn" onclick="filterTests('fail')">❌ Failed (${failCount})</button>
            </div>
            
            <div id="tests-container">
${results.map(result => `
                <div class="test-item" data-status="${result.status.toLowerCase()}">
                    <div class="test-status ${result.status.toLowerCase()}">
                        ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
                    </div>
                    <div class="test-method">${result.method}</div>
                    <div class="test-name">${result.name}</div>
                    <div class="test-code">${result.code}</div>
                    ${result.reason ? `<div class="test-error">${result.reason}</div>` : ''}
                </div>
`).join('')}
            </div>
            
            <div class="timestamp">
                Generated: ${new Date().toLocaleString()}
            </div>
        </div>
    </div>
    
    <script>
        function filterTests(status) {
            const tests = document.querySelectorAll('.test-item');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            tests.forEach(test => {
                if (status === 'all') {
                    test.style.display = 'flex';
                } else {
                    test.style.display = test.getAttribute('data-status') === status ? 'flex' : 'none';
                }
            });
        }
    </script>
</body>
</html>`;

// Write HTML file
const outputPath = path.join(reportDir, 'postman-dashboard.html');
fs.writeFileSync(outputPath, html);

console.log('✅ Dashboard generated: ' + outputPath);
console.log(`📊 Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passCount} (${passPercentage}%)`);
console.log(`❌ Failed: ${failCount} (${failPercentage}%)`);
