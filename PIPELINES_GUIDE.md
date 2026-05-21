# 🚀 CI/CD Pipelines Guide

This project includes two automated testing pipelines for Cucumber tests:

## 📅 Pipeline Schedule

### 🌙 Nightly Smoke Tests
- **Frequency:** Every day at **2:00 AM UTC**
- **Test Suite:** `@smoke` tagged tests only (critical path)
- **Duration:** ~5-10 minutes
- **Report Retention:** 7 days
- **Purpose:** Quick validation of critical functionality

### 🚀 Release - Full Test Suite
- **Frequency:** Every **2 weeks on Monday at 00:00 UTC**
- **Test Suite:** All tests (smoke, e2e, admin, client, full)
- **Duration:** ~2-3 hours
- **Report Retention:** 30 days
- **Purpose:** Comprehensive testing before releases

---

## 🔧 Configuration

### 1. Environment Variables

Add these to your GitHub repository secrets:

```bash
# Required
BASE_URL=http://localhost:3000
DATABASE_URL=your-database-url

# Optional (for Slack notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**To set secrets:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its value

### 2. Cron Schedule Syntax

Both pipelines use cron expressions:

```yaml
# Nightly (Every day at 2 AM UTC)
0 2 * * *

# Release (Every 2 weeks on Monday at 00:00 UTC)
0 0 ? * MON
```

**Common Examples:**
```
0 2 * * *       # Daily at 2 AM
0 0 * * MON     # Every Monday at midnight
0 0 ? * MON/2   # Every 2 weeks (biweekly)
0 9 * * 1-5     # Weekdays at 9 AM
```

### 3. Update Schedule

To change when pipelines run, edit the files:
- `.github/workflows/nightly.yml` - Line 8
- `.github/workflows/release.yml` - Line 8

Example to run nightly at 3 AM:
```yaml
schedule:
  - cron: '0 3 * * *'
```

---

## 🧪 Test Suites

### Smoke Tests (@smoke)
```bash
npm run test:headless -- --tags "@smoke"
```

**Coverage:**
- Homepage functionality
- Language switching
- Signup process
- Tracking system

**Test Files:**
- `features/homepage.feature`
- `features/language.feature`
- `features/signup.feature`
- `features/tracking.feature`

### E2E Tests (@e2e)
```bash
npm run test:e2e
```

**Coverage:**
- End-to-end user workflows
- Integration testing
- Business process validation

### Admin Tests (@admin)
```bash
npm run test:e2e:admin
```

**Coverage:**
- Admin dashboard
- Account approval processes
- Admin-specific workflows

### Client Tests (@client)
```bash
npm run test:e2e:client
```

**Coverage:**
- Client signup & login
- Client dashboard
- Client workflows

### Full Test Suite
```bash
npm run test:headless
```

**Coverage:**
- All tests
- UI tests
- All tagged scenarios

---

## 📊 Artifacts & Reports

### Generated Reports

Each pipeline run generates:

1. **Cucumber Reports**
   - `reports/cucumber-report.json` - Machine-readable format
   - `reports/cucumber-report.html` - Human-readable HTML

2. **Playwright Reports**
   - `playwright-report/` - Detailed visual report with traces

3. **Screenshots & Videos**
   - `screenshots/` - Failed test screenshots
   - `videos/` - Test execution videos

### Accessing Reports

1. Go to your GitHub repo → Actions
2. Click on the workflow run
3. Scroll down to "Artifacts"
4. Download the report you need
5. Extract and open `.html` files in your browser

### Report Retention

- **Nightly:** 7 days (to save storage)
- **Release:** 30 days (for release documentation)

---

## 🔔 Notifications

### GitHub Notifications
- Built-in GitHub Actions notifications
- Subscribe to Actions notifications in repository settings

### Slack Integration

To enable Slack notifications:

1. Create a Slack Webhook:
   - Go to Slack workspace → Settings
   - Apps → Create New App
   - Incoming Webhooks → Add New Webhook to Workspace
   - Copy the webhook URL

2. Add to GitHub secrets:
   - Settings → Secrets → `SLACK_WEBHOOK_URL`

3. Pipelines will automatically notify on success/failure

---

## 🚀 Manual Trigger

Both pipelines can be triggered manually:

```bash
# GitHub UI Method:
1. Go to Actions tab
2. Select "🌙 Nightly Smoke Tests" or "🚀 Release - Full Test Suite"
3. Click "Run workflow" → "Run workflow"

# GitHub CLI Method:
gh workflow run nightly.yml
gh workflow run release.yml
```

---

## 📋 Pipeline Details

### Nightly Pipeline (`nightly.yml`)

**Steps:**
1. ✅ Checkout code
2. 🔧 Setup Node.js 18
3. 📦 Install dependencies
4. 🌐 Wait for app to be ready (optional)
5. 🧪 Run smoke tests (@smoke)
6. 📊 Upload reports
7. 📧 Send notification on failure

**Key Features:**
- Single test suite execution
- Fast feedback (~5-10 min)
- Minimal artifact retention
- Focused on critical paths

### Release Pipeline (`release.yml`)

**Steps:**
1. ✅ Checkout code
2. 🔧 Setup Node.js 18
3. 📦 Install dependencies
4. 🌐 Wait for app to be ready
5. 🧪 Run test matrix (5 suites in parallel)
6. 📊 Upload reports for each suite
7. 📋 Consolidate results
8. 🔔 Send Slack notifications

**Key Features:**
- Parallel test execution (5 suites at once)
- Comprehensive coverage
- Extended artifact retention (30 days)
- Slack notifications for team
- Summary report generation

**Test Matrix:**
```yaml
matrix:
  test-suite:
    - 'smoke'    # 5-10 min
    - 'e2e'      # 15-20 min
    - 'admin'    # 10-15 min
    - 'client'   # 10-15 min
    - 'all'      # 20-30 min
```

Total runtime: ~30 min (parallel execution)

---

## ✅ Troubleshooting

### Workflow not triggering

**Issue:** Scheduled workflow doesn't run at expected time

**Solutions:**
1. Check branch is `main` or `master`
2. Verify cron syntax at [crontab.guru](https://crontab.guru)
3. Ensure file exists in default branch
4. GitHub requires at least one commit in last 60 days

### Tests timing out

**Issue:** Tests fail with timeout errors

**Solutions:**
1. Increase `timeout-minutes` in workflow
2. Check if app/database is ready before tests
3. Add more verbose logging

### Artifacts not available

**Issue:** Artifact downloads show as expired

**Solutions:**
1. Nightly: 7 days retention (default)
2. Release: 30 days retention (set in workflow)
3. Download before expiration
4. Change retention in workflow file

### Slack notifications not working

**Issue:** No Slack messages received

**Solutions:**
1. Verify `SLACK_WEBHOOK_URL` secret is set correctly
2. Check webhook URL is active in Slack
3. Ensure `secrets.SLACK_WEBHOOK_URL` syntax is correct in workflow

---

## 🔍 Monitoring

### View Workflow Status

```bash
# Using GitHub CLI
gh run list --workflow=nightly.yml
gh run list --workflow=release.yml

# View specific run details
gh run view <RUN_ID>
```

### Create Alerts

Configure GitHub notifications:
1. Settings → Notifications
2. Enable "Send notifications for" → "Workflows"
3. Choose notification preferences

---

## 📝 Adding New Test Tags

To create new tagged test suites:

1. **Add tag to feature file:**
   ```gherkin
   @new-suite
   Scenario: Example test
   ```

2. **Update package.json script:**
   ```json
   "test:new-suite": "cross-env HEADLESS=true cucumber-js --config cucumber.js --tags \"@new-suite\""
   ```

3. **Add to workflow:**
   ```yaml
   - name: Run New Suite
     run: npm run test:new-suite
   ```

---

## 🎯 Best Practices

1. **Use @smoke for critical tests only**
   - Fast execution
   - Low maintenance burden
   - Business-critical flows

2. **Keep nightly focused and fast**
   - Don't add heavy tests
   - Quick feedback loop
   - Early issue detection

3. **Use release for comprehensive testing**
   - Run full suite
   - All edge cases
   - Before production deployment

4. **Monitor artifact usage**
   - Delete old reports manually
   - Use retention policies
   - Don't store sensitive data

5. **Regular cleanup**
   - Archive old test results
   - Update test cases
   - Remove flaky tests

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Crontab Guru - Cron Expression Helper](https://crontab.guru)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Playwright Documentation](https://playwright.dev)

---

**Created:** May 21, 2026  
**Last Updated:** May 21, 2026
