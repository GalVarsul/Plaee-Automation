# sync-to-github.ps1
# Run this script to copy latest files and push to GitHub
# Usage: .\sync-to-github.ps1 "your commit message"

param([string]$message = "Update tests")

$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$dest   = "C:\Users\User\plaee-automation"

Write-Host "Copying from Claude workspace to $dest..." -ForegroundColor Cyan

# Copy everything except node_modules, test-results, screenshots
robocopy $source $dest /E /XD node_modules test-results playwright-report screenshots .git /XF "*.webm" /NFL /NDL /NJH

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Set-Location $dest
git add .
git commit -m $message
git push

Write-Host "Done!" -ForegroundColor Green
