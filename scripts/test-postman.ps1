# Automated Postman Collection Tester (PowerShell)
# Click this script to run all API endpoint tests automatically

Write-Host "`n🚀 POSTMAN COLLECTION TEST RUNNER" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$collectionFile = Join-Path $projectRoot "postman\TUNLOG_full_postman_collection.json"
$reportDir = Join-Path $projectRoot "reports\postman"

# Check if collection exists
if (-not (Test-Path $collectionFile)) {
    Write-Host "❌ Collection not found: $collectionFile" -ForegroundColor Red
    Write-Host "`nGenerating collection first...`n" -ForegroundColor Yellow
    
    Push-Location $projectRoot
    & npm.cmd run generate:postman
    Pop-Location
    
    if (-not (Test-Path $collectionFile)) {
        Write-Host "❌ Failed to generate collection" -ForegroundColor Red
        exit 1
    }
}

# Ensure report directory exists
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

Write-Host "📋 Collection: $collectionFile" -ForegroundColor Green
Write-Host "📊 Reports will be saved to: $reportDir`n" -ForegroundColor Green

# Run the tests
Push-Location $projectRoot
Write-Host "Running tests with Newman..." -ForegroundColor Yellow
& npm.cmd run test:postman
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check the reports for details." -ForegroundColor Yellow
}

Write-Host "`n📈 Open the HTML report to see detailed results:`n" -ForegroundColor Cyan
Write-Host "   $reportDir\postman-test-results.html`n" -ForegroundColor Green

# Optionally open the report
$response = Read-Host "Open HTML report in browser? (Y/n)"
if ($response -ne 'n' -and $response -ne 'N') {
    $reportFile = Join-Path $reportDir "postman-test-results.html"
    if (Test-Path $reportFile) {
        Start-Process $reportFile
    } else {
        Write-Host "Report file not found yet" -ForegroundColor Yellow
    }
}

exit $exitCode
