# Git Helper Script
# Adds Git to PATH and runs git commands

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify Git remote configuration
Write-Host "Git Repository Configuration" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

git remote -v

Write-Host ""
Write-Host "Repository Status:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "Ready to commit and push to: https://github.com/0xgaut85/r1x" -ForegroundColor Green


