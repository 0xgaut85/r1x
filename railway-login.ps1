# Railway CLI Login
# Run this after Node.js is installed

# Refresh PATH to include Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found. Please restart your PowerShell terminal or install Node.js." -ForegroundColor Red
    exit 1
}

# Login to Railway
Write-Host "Connecting to Railway CLI..." -ForegroundColor Cyan
Write-Host "This will open your browser for authentication." -ForegroundColor Yellow
Write-Host "Login with: comptegautier34@gmail.com (gauthierc2001)" -ForegroundColor Yellow
Write-Host ""

npx @railway/cli login


