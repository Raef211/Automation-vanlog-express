# GitHub Actions Workflows

This directory contains the CI/CD pipeline configurations for automated testing with Cucumber.

## 📁 Files

### `nightly.yml` 🌙
Runs smoke tests every day at 2:00 AM UTC
- **Test Suite:** `@smoke` tagged tests
- **Duration:** ~5-10 minutes
- **Schedule:** `0 2 * * *` (daily at 2 AM UTC)
- **Artifacts:** Retained for 7 days

### `release.yml` 🚀
Runs complete test suite every 2 weeks
- **Test Suite:** All tests (smoke, e2e, admin, client, full)
- **Duration:** ~30 minutes (parallel execution)
- **Schedule:** `0 0 ? * MON` (every 2 weeks on Monday)
- **Artifacts:** Retained for 30 days

## 🚀 Quick Start

### 1. Add GitHub Secrets

Go to your repository:
1. Settings → Secrets and variables → Actions
2. Add these secrets:
   ```
   BASE_URL=http://localhost:3000
   DATABASE_URL=your-database-url
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL (optional)
   ```

### 2. Configure Schedules (if needed)

Edit the `schedule` section in either workflow file:
```yaml
schedule:
  - cron: '0 2 * * *'  # Change this line
```

Common schedules:
- Daily at 2 AM: `0 2 * * *`
- Mondays at midnight: `0 0 ? * MON`
- Every 2 weeks Monday: `0 0 ? * MON` (natural biweekly)

### 3. Verify Installation

1. Go to Actions tab in your GitHub repo
2. You should see both workflows listed
3. They'll run on their scheduled times

## 🧪 Manual Trigger

To run workflows manually:

```bash
# Using GitHub CLI
gh workflow run nightly.yml
gh workflow run release.yml

# Or via GitHub UI:
# 1. Actions tab
# 2. Select workflow
# 3. "Run workflow" button
```

## 📊 View Results

1. Go to Actions tab
2. Click on workflow name
3. Click on the run
4. Scroll to "Artifacts" to download reports

## 🔧 Customization

### Change Nightly Time
Edit `nightly.yml` line ~8:
```yaml
- cron: '0 3 * * *'  # 3 AM instead of 2 AM
```

### Change Release Frequency
Edit `release.yml` line ~8:
```yaml
- cron: '0 0 ? * MON'  # Every Monday (biweekly)
```

### Modify Test Suites
Edit the `run:` commands in either workflow file to add/remove test tags.

## 📚 Full Documentation

See [PIPELINES_GUIDE.md](../PIPELINES_GUIDE.md) for comprehensive guide including:
- Detailed configuration options
- Cron expression syntax
- Report generation
- Slack integration
- Troubleshooting
- Best practices

## 🆘 Troubleshooting

### Workflow not running
- Check branch is `main` or `master`
- Verify cron syntax at [crontab.guru](https://crontab.guru)
- Ensure there's a recent commit (last 60 days)

### Tests failing
- Check logs in Actions tab
- Download artifacts for detailed reports
- Verify BASE_URL secret is correct

### No artifacts
- Wait for job to complete
- Check job didn't fail before artifact upload
- Verify retention policy (7 days for nightly, 30 for release)

---

**Workflow Files Created:** May 21, 2026
