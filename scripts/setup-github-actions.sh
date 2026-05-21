#!/bin/bash
# Setup script for GitHub Actions Secrets
# This script helps configure secrets for the CI/CD pipelines

set -e

echo "🚀 GitHub Actions Secrets Setup"
echo "================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it first:"
    echo "   https://cli.github.com/manual/installation"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated to GitHub. Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Get current repository
REPO=$(gh repo view --json nameWithOwner -q .)

echo "📦 Repository: $REPO"
echo ""

# Function to prompt for and set secret
set_secret() {
    local secret_name=$1
    local prompt_text=$2
    local is_url=${3:-false}
    
    echo -n "Enter $prompt_text: "
    read -r secret_value
    
    if [ -z "$secret_value" ]; then
        echo "⚠️  Skipping $secret_name (empty value)"
        return
    fi
    
    # Validate URL if needed
    if [ "$is_url" = "true" ] && ! [[ "$secret_value" =~ ^https?:// ]]; then
        echo "❌ Invalid URL format for $secret_name"
        return
    fi
    
    # Set the secret
    gh secret set "$secret_name" --body "$secret_value"
    echo "✅ Secret '$secret_name' set successfully"
    echo ""
}

# Prompt for secrets
echo "Configure the following secrets:"
echo "================================"
echo ""

set_secret "BASE_URL" "Base URL for your application (e.g., http://localhost:3000 or https://app.example.com)" true
set_secret "DATABASE_URL" "Database connection string (optional, press Enter to skip)"
set_secret "SLACK_WEBHOOK_URL" "Slack Webhook URL for notifications (optional, press Enter to skip)" true

echo ""
echo "🎉 Setup complete!"
echo ""
echo "View your secrets at: https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "Next steps:"
echo "1. Commit and push the workflow files to GitHub"
echo "2. Go to the Actions tab to monitor runs"
echo "3. See PIPELINES_GUIDE.md for detailed documentation"
