# Development Helper Script
# Refreshes PATH and runs npm commands

# Refresh PATH to include Node.js and npm
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Node.js and npm PATH refreshed" -ForegroundColor Green
Write-Host "  Node.js: $(node --version)" -ForegroundColor White
Write-Host "  npm: $(npm --version)" -ForegroundColor White
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  npm run dev          - Start Next.js dev server" -ForegroundColor White
Write-Host "  npm run dev:x402     - Start x402 Express server" -ForegroundColor White
Write-Host "  npm run dev:all      - Start both servers" -ForegroundColor White
Write-Host "  npm run build        - Build for production" -ForegroundColor White
Write-Host "  npm run test         - Run tests" -ForegroundColor White
Write-Host ""







