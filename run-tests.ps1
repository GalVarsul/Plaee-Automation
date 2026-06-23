# ============================================================
#  Plaee Automation - Full Setup & Test Runner
#  Run this once on any new computer to install everything
#  and launch the tests automatically.
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "===> $msg" -ForegroundColor Cyan
}

# ── 1. Check Node.js ────────────────────────────────────────
Write-Step "Checking for Node.js..."

$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "Node.js is NOT installed." -ForegroundColor Yellow
    Write-Host "Opening the Node.js download page. Please install the LTS version, then re-run this script." -ForegroundColor Yellow
    Start-Process "https://nodejs.org/en/download"
    Read-Host "Press Enter after Node.js is installed to continue"

    # Refresh PATH in this session
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodePath) {
        Write-Host "Node.js still not found. Please close this window, reopen PowerShell, and run the script again." -ForegroundColor Red
        exit 1
    }
}

$nodeVersion = node --version
Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green

# ── 2. Fix PowerShell execution policy if needed ────────────
Write-Step "Checking execution policy..."
$policy = Get-ExecutionPolicy -Scope CurrentUser
if ($policy -eq "Restricted" -or $policy -eq "Undefined") {
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
    Write-Host "Execution policy updated to RemoteSigned." -ForegroundColor Green
} else {
    Write-Host "Execution policy OK ($policy)." -ForegroundColor Green
}

# ── 3. Move into the project folder ─────────────────────────
Write-Step "Navigating to project folder..."
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir
Write-Host "Working directory: $scriptDir" -ForegroundColor Green

# ── 4. Install npm dependencies ──────────────────────────────
Write-Step "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed. Check your internet connection and try again." -ForegroundColor Red
    exit 1
}
Write-Host "npm dependencies installed." -ForegroundColor Green

# ── 5. Install Playwright browsers ──────────────────────────
Write-Step "Installing Playwright browsers (Chromium)..."
npx playwright install chromium
if ($LASTEXITCODE -ne 0) {
    Write-Host "Playwright browser install failed. Check your internet connection and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Playwright browsers installed." -ForegroundColor Green

# ── 6. Run the tests ─────────────────────────────────────────
Write-Step "Running tests (headed mode - browser will open)..."
Write-Host "Website under test: https://cms.plaee.cloud" -ForegroundColor White
Write-Host ""
npm run test:headed
$testExitCode = $LASTEXITCODE

# ── 7. Open the HTML report ──────────────────────────────────
Write-Step "Opening test report..."
if (Test-Path ".\playwright-report\index.html") {
    Start-Process ".\playwright-report\index.html"
    Write-Host "Report opened in your browser." -ForegroundColor Green
} else {
    npx playwright show-report
}

# ── 8. Summary ───────────────────────────────────────────────
Write-Host ""
if ($testExitCode -eq 0) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED - check the report that just opened for details." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to close"
