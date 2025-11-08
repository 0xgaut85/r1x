# Railway CLI - Add Daydreams Facilitator Variable
# This script links to the r1x service and adds the environment variable

Write-Host "Adding DAYDREAMS_FACILITATOR_URL to Railway..." -ForegroundColor Cyan

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Link to r1x service (non-interactive)
Write-Host "Linking to r1x service..." -ForegroundColor Yellow
$linkResult = npx @railway/cli service r1x 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Service linked successfully" -ForegroundColor Green
} else {
    Write-Host "Note: Service linking may require interactive selection" -ForegroundColor Yellow
    Write-Host "Please run manually: npx @railway/cli service" -ForegroundColor Yellow
    Write-Host "Then select 'r1x' service" -ForegroundColor Yellow
    exit 1
}

# Add the environment variable
Write-Host "Adding environment variable..." -ForegroundColor Yellow
$varResult = npx @railway/cli variables --set "DAYDREAMS_FACILITATOR_URL=https://facilitator.daydreams.systems" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Environment variable added successfully!" -ForegroundColor Green
    Write-Host "  DAYDREAMS_FACILITATOR_URL=https://facilitator.daydreams.systems" -ForegroundColor White
} else {
    Write-Host "Error adding variable:" -ForegroundColor Red
    Write-Host $varResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying variable..." -ForegroundColor Cyan
npx @railway/cli variables | Select-String DAYDREAMS

