# PowerShell Setup script for GitHub Actions Secrets
# This script helps configure secrets for the CI/CD pipelines

param(
    [switch]$SkipValidation
)

Write-Host "🚀 GitHub Actions Secrets Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if gh CLI is installed
try {
    $ghVersion = gh --version 2>$null
    if (-not $ghVersion) {
        throw "GitHub CLI not found"
    }
} catch {
    Write-Host "❌ GitHub CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   https://cli.github.com/manual/installation"
    exit 1
}

# Check if authenticated
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
} catch {
    Write-Host "❌ Not authenticated to GitHub. Please run: gh auth login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green
Write-Host ""

# Get current repository
try {
    $repo = gh repo view --json nameWithOwner -q .
    Write-Host "📦 Repository: $repo" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Could not determine repository" -ForegroundColor Red
    exit 1
}

# Function to prompt for and set secret
function Set-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$PromptText,
        [bool]$IsUrl = $false
    )
    
    $secretValue = Read-Host "Enter $PromptText"
    
    if ([string]::IsNullOrWhiteSpace($secretValue)) {
        Write-Host "⚠️  Skipping $SecretName (empty value)" -ForegroundColor Yellow
        return
    }
    
    # Validate URL if needed
    if ($IsUrl -and $secretValue -notmatch '^https?://') {
        Write-Host "❌ Invalid URL format for $SecretName" -ForegroundColor Red
        return
    }
    
    # Set the secret
    try {
        $secretValue | gh secret set $SecretName
        Write-Host "✅ Secret '$SecretName' set successfully" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ Failed to set secret '$SecretName': $_" -ForegroundColor Red
    }
}

# Prompt for secrets
Write-Host "Configure the following secrets:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-GitHubSecret -SecretName "BASE_URL" `
    -PromptText "Base URL for your application (e.g., http://localhost:3000 or https://app.example.com)" `
    -IsUrl $true

Set-GitHubSecret -SecretName "DATABASE_URL" `
    -PromptText "Database connection string (optional, press Enter to skip)"

Set-GitHubSecret -SecretName "SLACK_WEBHOOK_URL" `
    -PromptText "Slack Webhook URL for notifications (optional, press Enter to skip)" `
    -IsUrl $true

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "View your secrets at:" -ForegroundColor Cyan
Write-Host "   https://github.com/$repo/settings/secrets/actions"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit and push the workflow files to GitHub"
Write-Host "2. Go to the Actions tab to monitor runs"
Write-Host "3. See PIPELINES_GUIDE.md for detailed documentation"
