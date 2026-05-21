# 🎯 CI/CD Pipelines - Installation Complete

## ✅ What Was Created

Two automated testing pipelines have been configured for your Cucumber project:

### 1. 🌙 Nightly Pipeline (`nightly.yml`)
- **Schedule:** Every day at **2:00 AM UTC**
- **Tests:** `@smoke` tagged tests only (critical path)
- **Duration:** ~5-10 minutes
- **Reports:** Retained for 7 days
- **Purpose:** Quick daily validation of core functionality

### 2. 🚀 Release Pipeline (`release.yml`)
- **Schedule:** Every 2 weeks on **Monday at 00:00 UTC**
- **Tests:** Complete test suite (smoke + e2e + admin + client + all)
- **Duration:** ~30 minutes (parallel execution)
- **Reports:** Retained for 30 days
- **Purpose:** Comprehensive testing before releases
- **Notifications:** Slack alerts on success/failure

---

## 📁 Files Created

```
.github/
├── workflows/
│   ├── nightly.yml           # Daily smoke tests
│   ├── release.yml           # Biweekly full test suite
│   └── README.md             # Workflow documentation
├── PIPELINES_GUIDE.md        # Comprehensive configuration guide
└── scripts/
    ├── setup-github-actions.sh    # Setup script (Linux/Mac)
    └── setup-github-actions.ps1   # Setup script (Windows)
```

---

## 🚀 Next Steps

### Step 1: Add GitHub Secrets

These secrets are required for the pipelines to work:

#### Option A: Using GitHub UI (Easiest)
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Example Value | Required |
|-------------|------------------|----------|
| `BASE_URL` | `http://localhost:3000` | ✅ Yes |
| `DATABASE_URL` | `postgres://user:pass@localhost/db` | ❓ Optional |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/services/...` | ❓ Optional |

#### Option B: Using Setup Script (Mac/Linux)
```bash
chmod +x scripts/setup-github-actions.sh
./scripts/setup-github-actions.sh
```

#### Option C: Using Setup Script (Windows PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-github-actions.ps1
```

### Step 2: Push to GitHub

```bash
# Stage the workflow files
git add .github/workflows/
git add scripts/setup-github-actions.*
git add PIPELINES_GUIDE.md

# Commit
git commit -m "chore: add CI/CD pipelines (nightly smoke tests & biweekly release tests)"

# Push to GitHub
git push origin main
```

### Step 3: Verify Installation

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You should see:
   - ✅ `🌙 Nightly Smoke Tests` workflow
   - ✅ `🚀 Release - Full Test Suite` workflow

4. Click on either workflow → "Run workflow" to test immediately

### Step 4: Monitor First Runs

Check the first test runs:
1. Actions tab
2. Click workflow name
3. View logs and artifacts
4. Download test reports

---

## 🧪 Test Coverage

### Smoke Tests (Nightly) 🌙
- Homepage functionality
- Language switching
- User signup
- Package tracking
- **Files:** `features/homepage.feature`, `features/language.feature`, etc.
- **Command:** `npm run test:headless -- --tags "@smoke"`

### Full Tests (Release) 🚀
- **Smoke tests** - Critical path (5 min)
- **E2E tests** - Integration workflows (15 min)
- **Admin tests** - Admin functions (10 min)
- **Client tests** - Client workflows (10 min)
- **All tests** - Full suite (20 min)
- **Total:** ~30 min (parallel execution)

---

## 📊 Generated Reports

After each pipeline run, these artifacts are generated:

### Nightly
- `cucumber-report.json` - Machine-readable results
- `cucumber-report.html` - Visual HTML report
- `playwright-report/` - Detailed Playwright traces
- `screenshots/` - Failed test screenshots
- `videos/` - Test execution videos

### Release
- Same as nightly, but for each test suite
- Plus `RELEASE_SUMMARY.md` - Consolidated summary
- Extended retention (30 days vs 7 days)

---

## ⚙️ Customization

### Change Nightly Time

Edit `.github/workflows/nightly.yml` line ~8:

```yaml
schedule:
  - cron: '0 3 * * *'  # Change to 3 AM
```

**Common times:**
- `0 2 * * *` - 2 AM daily
- `0 9 * * 1-5` - 9 AM weekdays only
- `30 2 * * *` - 2:30 AM daily

### Change Release Schedule

Edit `.github/workflows/release.yml` line ~8:

```yaml
schedule:
  - cron: '0 0 ? * MON'  # Every Monday at midnight
```

**Common schedules:**
- `0 0 1 * *` - First day of month
- `0 0 ? * MON` - Every Monday (biweekly)
- `0 0 ? * THU` - Every Thursday

Use [crontab.guru](https://crontab.guru) to test your cron expression.

### Add New Test Tags

1. **Add `@your-tag` to features:**
```gherkin
@your-tag
Scenario: Your test
  Given step 1
  When step 2
  Then step 3
```

2. **Add npm script in `package.json`:**
```json
"test:your-tag": "cross-env HEADLESS=true cucumber-js --config cucumber.js --tags \"@your-tag\""
```

3. **Add to workflow:**
```yaml
- name: Run Your Tag Tests
  run: npm run test:your-tag
```

---

## 🔔 Notifications

### GitHub Notifications
Automatic - GitHub will notify you:
- On workflow failures
- On successful deployments (optional)
- Via email or mobile app

### Slack Notifications (Optional)

1. **Create Slack Webhook:**
   - Go to Slack workspace → Apps
   - Search "Incoming Webhooks"
   - Create New
   - Copy webhook URL

2. **Add Secret:**
   - GitHub repo → Settings → Secrets
   - Add secret: `SLACK_WEBHOOK_URL` = `your-webhook-url`

3. **Pipelines will automatically notify on success/failure**

---

## 📚 Full Documentation

See [PIPELINES_GUIDE.md](./PIPELINES_GUIDE.md) for:
- Detailed configuration options
- Cron expression syntax guide
- Artifact management
- Slack integration setup
- Troubleshooting guide
- Best practices

See [.github/workflows/README.md](./.github/workflows/README.md) for:
- Quick start guide
- Workflow file descriptions
- Manual trigger instructions
- Customization examples

---

## 🆘 Troubleshooting

### Workflow doesn't appear in Actions tab
- ✅ Push the `.github/workflows/` directory to GitHub
- ✅ Make sure you're on the default branch (main/master)
- ✅ Refresh the page after push

### Scheduled workflow not running
- ✅ Verify cron syntax at [crontab.guru](https://crontab.guru)
- ✅ Check there's been a commit in last 60 days
- ✅ Ensure secrets are set
- ✅ Wait up to 15 minutes after push

### Tests fail in pipeline but pass locally
- ✅ Check `BASE_URL` secret is correct
- ✅ Check database is accessible
- ✅ Verify environment variables are set
- ✅ Download test reports for details

### Artifacts not available
- ✅ Wait for job to complete
- ✅ Nightly: 7-day retention
- ✅ Release: 30-day retention
- ✅ Download before expiration

---

## 📋 Quick Reference

### Manual Trigger Workflows

```bash
# Using GitHub CLI
gh workflow run nightly.yml
gh workflow run release.yml

# Or visit GitHub UI:
# Actions → Workflow → "Run workflow" button
```

### View Workflow Results

```bash
# Using GitHub CLI
gh run list --workflow=nightly.yml
gh run list --workflow=release.yml
gh run view <RUN_ID>
```

### Check Test Status

```bash
# View workflow logs
gh run view <RUN_ID> --log

# Download artifacts
gh run download <RUN_ID>
```

---

## ✨ Features Included

✅ **Nightly Smoke Tests**
- Automated daily execution at 2 AM
- Fast feedback on critical paths
- 7-day artifact retention

✅ **Release Full Test Suite**
- Biweekly comprehensive testing
- Parallel execution (5 test suites)
- Slack notifications
- 30-day artifact retention

✅ **Detailed Reports**
- Cucumber JSON reports
- HTML visual reports
- Playwright traces
- Screenshots on failure

✅ **Easy Configuration**
- GitHub UI secrets management
- Cron schedule customization
- Setup scripts for both platforms
- Comprehensive documentation

✅ **Production Ready**
- Error handling
- Timeout configurations
- Parallel execution optimization
- Artifact management

---

## 🎉 You're All Set!

Your CI/CD pipelines are now configured. Here's what happens automatically:

1. **Every day at 2 AM** 🌙
   - Smoke tests run automatically
   - Reports available in artifacts
   - Notified of any failures

2. **Every 2 weeks on Monday** 🚀
   - Complete test suite runs
   - All test types executed in parallel
   - Slack notification sent
   - Results available for 30 days

3. **Anytime manually** 🖱️
   - Trigger workflows manually
   - Test immediately without waiting
   - Debug specific test suites

---

**Setup completed:** May 21, 2026  
**Ready to test:** ✅ Yes

For detailed information, see [PIPELINES_GUIDE.md](./PIPELINES_GUIDE.md)
