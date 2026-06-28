@echo off
:: ---------------------------------------------------------------------------
:: Plaee Automation - Full Test Runner
:: Functional checks (HTTP status, load time, navigation, a11y) run via
:: "npm test". Only visual specs are snapshotted by Chromatic - purely
:: functional specs (06-health-checks, 02-navigation) import @playwright/test,
:: so Chromatic skips them automatically. No config exclusions needed.
:: ---------------------------------------------------------------------------
echo ==========================================
echo   Plaee Automation - Full Test Runner
echo ==========================================
echo.

:: Check Node.js
echo [1/6] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Download from https://nodejs.org
    pause
    exit /b 1
)
echo OK - Node.js is installed
echo.

:: Setup Git
echo [2/6] Setting up Git...
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    echo No Git repo found - initializing...
    git init
    git add .
    git commit -m "initial commit"
) else (
    echo OK - Git already initialized
    git add .
    git commit -m "auto commit" >nul 2>&1
)
echo OK - Done
echo.

:: Install dependencies
echo [3/6] Installing dependencies...
call npm install --no-audit --no-fund
echo OK - Done
echo.

:: Install Playwright browsers
echo [4/6] Installing Playwright browsers...
call npx playwright install chromium
call npx playwright install-deps chromium
echo OK - Done
echo.

:: Run the full suite (functional + visual specs) and build the HTML report
echo [5/6] Running full Playwright suite - functional + visual...
call npm test
echo.

:: Run Chromatic - only visual specs snapshot here; functional specs
:: 06-health-checks and 02-navigation import @playwright/test and are auto-skipped
echo [6/6] Running Chromatic visual snapshots - functional specs auto-skipped...
set /p CHROMATIC_TOKEN="Enter your Chromatic project token: "
call npx chromatic --playwright --playwright-config=playwright.chromatic.config.js --project-token=%CHROMATIC_TOKEN%
echo.

echo ==========================================
echo   All done! Check: https://www.chromatic.com
echo ==========================================
pause
