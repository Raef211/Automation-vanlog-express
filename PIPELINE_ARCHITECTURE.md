# 📊 CI/CD Pipeline Architecture

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS WORKFLOWS                     │
└─────────────────────────────────────────────────────────────────┘

┌─ NIGHTLY SMOKE TESTS ────────────────────────────────────────────┐
│  ⏰ Schedule: Every day at 02:00 AM UTC                           │
│  🏃 Speed: ~5-10 minutes                                          │
│  🎯 Scope: @smoke tests only (critical path)                     │
│  💾 Artifacts: 7-day retention                                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Workflow Steps:                                            │  │
│  ├─ Checkout code                                           │  │
│  ├─ Setup Node.js 18                                        │  │
│  ├─ Install dependencies                                    │  │
│  ├─ Wait for app readiness                                 │  │
│  ├─ ▶️  RUN SMOKE TESTS (@smoke)                             │  │
│  ├─ Upload test reports                                     │  │
│  ├─ Upload Playwright reports                              │  │
│  └─ Send failure notifications                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Tests Included:                                                 │
│  ✓ Homepage functionality                                       │
│  ✓ Language switching                                           │
│  ✓ User signup                                                  │
│  ✓ Package tracking                                             │
└─────────────────────────────────────────────────────────────────┘


┌─ RELEASE FULL TEST SUITE ────────────────────────────────────────┐
│  ⏰ Schedule: Every 2 weeks (Monday at 00:00 UTC)                 │
│  🏃 Speed: ~30 minutes (parallel execution)                      │
│  🎯 Scope: Complete test suite (all test types)                  │
│  💾 Artifacts: 30-day retention                                  │
│  📢 Notifications: Slack alerts                                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Test Matrix (Parallel Execution):                         │  │
│  ├─┬─ SUITE 1: Smoke Tests (@smoke)          ▶ 5-10 min    │  │
│  │ │  • Homepage • Language • Signup • Tracking            │  │
│  │ │                                                        │  │
│  ├─┼─ SUITE 2: E2E Tests (@e2e)               ▶ 15-20 min   │  │
│  │ │  • Integration workflows • User flows                │  │
│  │ │                                                        │  │
│  ├─┼─ SUITE 3: Admin Tests (@admin)          ▶ 10-15 min   │  │
│  │ │  • Admin dashboard • Account approval                │  │
│  │ │                                                        │  │
│  ├─┼─ SUITE 4: Client Tests (@client)        ▶ 10-15 min   │  │
│  │ │  • Client signup & login • Client workflows          │  │
│  │ │                                                        │  │
│  ├─┴─ SUITE 5: Full Suite (all)               ▶ 20-30 min   │  │
│  │   • Complete test coverage                              │  │
│  │                                                          │  │
│  └─ All suites run IN PARALLEL ────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ After Test Suites Complete:                              │  │
│  ├─ Consolidate results from all 5 suites                  │  │
│  ├─ Generate release summary report                        │  │
│  ├─ Upload consolidated artifacts                         │  │
│  ├─ Post summary to repository                            │  │
│  └─ Send Slack notifications (success/failure)             │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Timeline

```
MON         TUE         WED         THU         FRI         SAT         SUN
│           │           │           │           │           │           │
├─ 00:00    │           │           │           │           │           │
│  Release  │           │           │           │           │           │
│  starts   │           │           │           │           │           │
│  (30min)  │           │           │           │           │           │
│           │           │           │           │           │           │
├─ 02:00    │  02:00    │  02:00    │  02:00    │  02:00    │  02:00    │  02:00
│ Nightly   │ Nightly   │ Nightly   │ Nightly   │ Nightly   │ Nightly   │ Nightly
│ (10min)   │ (10min)   │ (10min)   │ (10min)   │ (10min)   │ (10min)   │ (10min)
│           │           │           │           │           │           │
└─ 03:00    │  03:00    │  03:00    │  03:00    │  03:00    │  03:00    │  03:00
            │           │           │           │           │           │
            |← BIWEEKLY CYCLE REPEATS →|
```

## Test Coverage Matrix

```
Test Type       | Nightly | Release | Duration | Coverage
─────────────────────────────────────────────────────────────
Smoke Tests     | ✅ YES  | ✅ YES  | 5-10m    | Critical paths
E2E Tests       | ❌ NO   | ✅ YES  | 15-20m   | Full workflows
Admin Tests     | ❌ NO   | ✅ YES  | 10-15m   | Admin features
Client Tests    | ❌ NO   | ✅ YES  | 10-15m   | User features
Full Suite      | ❌ NO   | ✅ YES  | 20-30m   | All tests
─────────────────────────────────────────────────────────────
Total Time      | 5-10m   | ~30m    |          |
Frequency       | Daily   | 2 weeks |          |
```

## Artifact Generation

```
NIGHTLY (Smoke Tests)
├── reports/
│   ├── cucumber-report.json      (Machine-readable)
│   ├── cucumber-report.html      (Visual report)
│   └── tmp-result.json
├── playwright-report/            (Detailed traces)
├── screenshots/                  (Failed test screenshots)
└── videos/                        (Test execution videos)
   Retention: 7 days

RELEASE (Full Test Suite)
├── test-reports-smoke/           (5 test suites)
│   ├── reports/
│   ├── playwright-report/
│   ├── screenshots/
│   └── videos/
├── test-reports-e2e/
├── test-reports-admin/
├── test-reports-client/
├── test-reports-all/
├── release-summary/
│   └── RELEASE_SUMMARY.md
└── Slack notification: ✅ Success / ❌ Failed
   Retention: 30 days
```

## Data Flow

```
┌──────────────────────────┐
│   GitHub Repository      │
│  (main/master branch)    │
└────────────┬─────────────┘
             │
             │ Push code
             ▼
┌──────────────────────────────────────────┐
│     GitHub Actions Trigger              │
│  (Scheduled or Manual)                  │
└────────────┬─────────────────────────────┘
             │
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
    ┌──────────────────┐            ┌──────────────────┐
    │ NIGHTLY PIPELINE │            │ RELEASE PIPELINE │
    │  (Daily 2 AM)    │            │ (Biweekly Monday)│
    └────────┬─────────┘            └────────┬─────────┘
             │                               │
      Smoke Tests Run              5 Test Suites Run
             │                      (in parallel)
             ├──────────┬──────────┬───────────┬──────────┤
             │          │          │           │          │
             ▼          ▼          ▼           ▼          ▼
         Smoke      E2E Tests  Admin Tests  Client Tests Full Suite
         (5-10m)    (15-20m)   (10-15m)    (10-15m)    (20-30m)
             │          │          │           │          │
             └──────────┼──────────┼───────────┼──────────┘
                        │
                        ▼
            Generate Reports & Artifacts
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    GitHub         Slack          Email
    Artifacts      (Release       (GitHub
    (7-30d)        only)          Notif)
```

## Configuration

```yaml
NIGHTLY
├── Frequency: 0 2 * * * (Daily at 2 AM UTC)
├── Test Tags: @smoke
├── Parallel Jobs: 1 (Sequential)
├── Timeout: 30 minutes
├── Artifact Retention: 7 days
└── Notifications: GitHub (failures only)

RELEASE
├── Frequency: 0 0 ? * MON (Every Monday 00:00 UTC)
├── Test Tags: Multiple (@smoke, @e2e, @admin, @client, all)
├── Parallel Jobs: 5 (All at once)
├── Timeout: 180 minutes
├── Artifact Retention: 30 days
└── Notifications: GitHub + Slack
```

## Trigger Methods

```
Automatic Scheduling
│
├─ Nightly: 0 2 * * *
│  └─ Runs daily at 2 AM UTC
│
└─ Release: 0 0 ? * MON
   └─ Runs every 2 weeks (Monday 00:00 UTC)


Manual Trigger
│
├─ GitHub CLI:
│  ├─ gh workflow run nightly.yml
│  └─ gh workflow run release.yml
│
└─ GitHub UI:
   ├─ Actions tab
   ├─ Select workflow
   └─ "Run workflow" button
```

## Error Handling

```
Pipeline Execution
│
├─ If Tests Pass ✅
│  ├─ Upload artifacts (7 or 30 days)
│  ├─ Generate reports
│  └─ Notify Slack (Release only) ✅
│
└─ If Tests Fail ❌
   ├─ Stop pipeline
   ├─ Upload artifacts
   ├─ Generate failure reports
   ├─ Notify via GitHub
   ├─ Notify via Slack (Release only) ❌
   └─ Comment on repo with summary
```

---

## 🎯 Summary

| Aspect | Nightly | Release |
|--------|---------|---------|
| **When** | Daily @ 2 AM | Biweekly Monday |
| **Duration** | 5-10 min | ~30 min |
| **Tests** | Smoke only | All tests (5 suites) |
| **Artifacts** | 7 days | 30 days |
| **Notifications** | GitHub only | GitHub + Slack |
| **Purpose** | Quick validation | Comprehensive release prep |

---

*Created: May 21, 2026*
