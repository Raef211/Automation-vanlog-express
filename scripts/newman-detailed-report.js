#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function toUrl(urlObj) {
  if (!urlObj) return 'N/A';
  if (typeof urlObj === 'string') return urlObj;
  if (urlObj.raw) return urlObj.raw;

  const protocol = urlObj.protocol ? `${urlObj.protocol}://` : '';
  const host = Array.isArray(urlObj.host) ? urlObj.host.join('.') : (urlObj.host || '');
  const port = urlObj.port ? `:${urlObj.port}` : '';
  const pathPart = Array.isArray(urlObj.path)
    ? `/${urlObj.path
      .map((p) => String(p).replace(/^\/+/, ''))
      .filter((p) => p.length > 0)
      .join('/')}`
    : (urlObj.path || '');
  const queryPart = Array.isArray(urlObj.query) && urlObj.query.length > 0
    ? `?${urlObj.query.map((q) => `${q.key}=${q.value}`).join('&')}`
    : '';
  return `${protocol}${host}${port}${pathPart}${queryPart}` || 'N/A';
}

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function decodeStream(stream) {
  if (!stream || !Array.isArray(stream.data)) return '';
  try {
    return Buffer.from(stream.data).toString('utf8');
  } catch {
    return '';
  }
}

function inferRootCauses(ctx) {
  const hints = [];
  const code = ctx.code;
  const statusText = `${ctx.status || ''}`.toLowerCase();
  const allErrorsText = ctx.allErrors.join(' | ').toLowerCase();

  if (code === 404) {
    hints.push('Endpoint not found (404). Verify base URL and endpoint path mapping.');
  }

  if (code === 401 || code === 403) {
    hints.push('Authentication/authorization issue. Verify bearer token and user permissions.');
  }

  if (typeof code === 'number' && code >= 500) {
    hints.push('Server-side error (5xx). Check backend logs around request timestamp.');
  }

  if (allErrorsText.includes("unexpected token '<'")) {
    hints.push('Response body is HTML, not JSON. The request may be hitting a frontend route or fallback page.');
  }

  if (allErrorsText.includes('jsonerror') || allErrorsText.includes('no data, empty input')) {
    hints.push('Test script expected JSON but response body is empty or invalid JSON. Guard pm.response.json() with content checks.');
  }

  if (statusText.includes('not found') && !hints.some((h) => h.includes('Endpoint not found'))) {
    hints.push('Route looks unavailable in current environment. Confirm API service is running and routing prefix is correct.');
  }

  if (hints.length === 0 && ctx.isFailed) {
    hints.push('Assertion or script failure. Review failed assertion and response payload for mismatch.');
  }

  return hints;
}

function main() {
  const inputPath = process.argv[2] || 'reports/newman/e2e-processus-livraison.json';
  const outputPath = process.argv[3] || 'reports/newman/e2e-processus-livraison-detailed.md';

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const report = JSON.parse(raw);
  const run = report.run || {};
  const executions = Array.isArray(run.executions) ? run.executions : [];
  const failures = Array.isArray(run.failures) ? run.failures : [];

  const failuresByItemId = new Map();
  for (const failure of failures) {
    const itemId = failure?.source?.id;
    if (!itemId) continue;
    if (!failuresByItemId.has(itemId)) failuresByItemId.set(itemId, []);
    failuresByItemId.get(itemId).push(failure);
  }

  const rows = [];
  const failedDetails = [];

  executions.forEach((execution, index) => {
    const item = execution.item || {};
    const request = execution.request || item.request || {};
    const response = execution.response || {};
    const assertions = Array.isArray(execution.assertions) ? execution.assertions : [];
    const assertionFailures = assertions.filter((a) => a && a.error);

    const testScriptErrors = (Array.isArray(execution.testScript) ? execution.testScript : [])
      .map((t) => t && t.error)
      .filter(Boolean);

    const linkedFailures = failuresByItemId.get(item.id) || [];

    const allErrors = [];
    assertionFailures.forEach((a) => allErrors.push(`${a.assertion}: ${a.error.message || a.error.name || 'Assertion failed'}`));
    testScriptErrors.forEach((e) => allErrors.push(`${e.name || e.type || 'ScriptError'}: ${e.message || ''}`));
    linkedFailures.forEach((f) => allErrors.push(`${f.error?.name || 'Failure'}: ${f.error?.message || ''}`));

    const method = request.method || 'N/A';
    const url = toUrl(request.url);
    const code = typeof response.code === 'number' ? response.code : null;
    const status = response.status || 'NO_RESPONSE';
    const duration = typeof response.responseTime === 'number' ? `${response.responseTime} ms` : 'N/A';
    const assertionSummary = `${assertions.length - assertionFailures.length}/${assertions.length} passed`;

    const isFailed = assertionFailures.length > 0 || testScriptErrors.length > 0 || linkedFailures.length > 0;
    const verdict = isFailed ? 'FAILED' : 'PASSED';

    rows.push({
      index: index + 1,
      name: item.name || `Request ${index + 1}`,
      method,
      url,
      code: code === null ? 'N/A' : code,
      status,
      duration,
      assertions: assertionSummary,
      verdict
    });

    if (isFailed) {
      const bodyPreview = decodeStream(response.stream).slice(0, 500);
      const rootCauses = inferRootCauses({
        code,
        status,
        allErrors,
        isFailed
      });

      failedDetails.push({
        index: index + 1,
        name: item.name || `Request ${index + 1}`,
        method,
        url,
        code: code === null ? 'N/A' : code,
        status,
        errors: allErrors,
        rootCauses,
        bodyPreview
      });
    }
  });

  const passedCount = rows.filter((r) => r.verdict === 'PASSED').length;
  const failedCount = rows.length - passedCount;

  const lines = [];
  lines.push('# Newman Detailed API Report');
  lines.push('');
  lines.push(`- Source JSON: ${inputPath}`);
  lines.push(`- Total APIs: ${rows.length}`);
  lines.push(`- Passed: ${passedCount}`);
  lines.push(`- Failed: ${failedCount}`);
  lines.push('');
  lines.push('## All APIs Status');
  lines.push('');
  lines.push('| # | API | Method | URL | HTTP Code | HTTP Status | Duration | Assertions | Verdict |');
  lines.push('|---:|---|---|---|---:|---|---|---|---|');

  for (const row of rows) {
    lines.push(`| ${row.index} | ${escapeCell(row.name)} | ${escapeCell(row.method)} | ${escapeCell(row.url)} | ${escapeCell(row.code)} | ${escapeCell(row.status)} | ${escapeCell(row.duration)} | ${escapeCell(row.assertions)} | ${escapeCell(row.verdict)} |`);
  }

  lines.push('');
  lines.push('## Failed APIs Root Cause');
  lines.push('');

  if (failedDetails.length === 0) {
    lines.push('No failed API requests found.');
  } else {
    for (const fail of failedDetails) {
      lines.push(`### ${fail.index}. ${fail.name}`);
      lines.push('');
      lines.push(`- Method: ${fail.method}`);
      lines.push(`- URL: ${fail.url}`);
      lines.push(`- HTTP: ${fail.code} ${fail.status}`);
      lines.push('- Failure details:');
      if (fail.errors.length === 0) {
        lines.push('  - Unknown error (check Newman raw report).');
      } else {
        fail.errors.forEach((error) => lines.push(`  - ${error}`));
      }
      lines.push('- Root cause hints:');
      fail.rootCauses.forEach((hint) => lines.push(`  - ${hint}`));

      if (fail.bodyPreview) {
        lines.push('- Response body preview:');
        lines.push('```text');
        lines.push(fail.bodyPreview);
        lines.push('```');
      }
      lines.push('');
    }
  }

  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

  console.log(`Detailed report written to: ${outputPath}`);
  console.log(`APIs total=${rows.length}, passed=${passedCount}, failed=${failedCount}`);
}

main();
