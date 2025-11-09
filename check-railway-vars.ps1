# PowerShell script to check Railway environment variables
# Run this script manually: .\check-railway-vars.ps1

Write-Host "Checking Railway environment variables..." -ForegroundColor Cyan
Write-Host ""

# Link to r1x service (Next.js frontend)
Write-Host "Linking to 'r1x' service..." -ForegroundColor Yellow
railway service --service r1x

Write-Host ""
Write-Host "Checking NEXT_PUBLIC_SOLANA_RPC_URL..." -ForegroundColor Yellow
railway variables | Select-String "SOLANA"

Write-Host ""
Write-Host "All environment variables:" -ForegroundColor Yellow
railway variables

Write-Host ""
Write-Host "Done! Check the output above for NEXT_PUBLIC_SOLANA_RPC_URL" -ForegroundColor Green

