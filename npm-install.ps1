# Refresh PATH and run npm install
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Refreshing PATH..." -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)" -ForegroundColor Green
Write-Host "npm: $(npm --version)" -ForegroundColor Green
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install


