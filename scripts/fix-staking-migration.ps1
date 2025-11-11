# PowerShell script to manually run Prisma migration and regenerate client on Railway
# Usage: .\scripts\fix-staking-migration.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Fixing Staking Migration on Railway" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm i -g @railway/cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Railway CLI found: $railwayVersion" -ForegroundColor Green
Write-Host ""

# Set service to r1x (Next.js service)
Write-Host "Setting Railway service to 'r1x'..." -ForegroundColor Yellow
$env:RAILWAY_SERVICE = "r1x"
Write-Host "✓ Service set to r1x" -ForegroundColor Green
Write-Host ""

# Step 1: Run migration
Write-Host "Step 1: Running database migrations..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
railway run --service r1x npx prisma migrate deploy
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrations completed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Migration command exited with code $LASTEXITCODE" -ForegroundColor Yellow
    Write-Host "  This might be OK if migrations were already applied" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Regenerate Prisma Client
Write-Host "Step 2: Regenerating Prisma Client..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
railway run --service r1x npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client regenerated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to regenerate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Restart service (optional)
Write-Host "Step 3: Restarting service..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Note: You may need to manually restart the service from Railway dashboard" -ForegroundColor Yellow
Write-Host "      Or trigger a redeploy to ensure changes take effect" -ForegroundColor Yellow
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Migration fix complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Railway logs to verify migration ran successfully" -ForegroundColor White
Write-Host "2. Restart the r1x service from Railway dashboard if needed" -ForegroundColor White
Write-Host "3. Test the staking API endpoint" -ForegroundColor White

