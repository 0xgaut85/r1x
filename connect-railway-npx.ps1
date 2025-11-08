# Railway CLI Connection using npx
# Email: comptegautier34@gmail.com
# Username: gauthierc2001

Write-Host "Railway CLI Connection (using npx)" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Railway Account:" -ForegroundColor Yellow
Write-Host "  Email: comptegautier34@gmail.com" -ForegroundColor White
Write-Host "  Username: gauthierc2001" -ForegroundColor White
Write-Host ""

# Check for npx
$npxAvailable = $false
try {
    $npxVersion = & npx --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $?) {
        $npxAvailable = $true
        Write-Host "Found npx: $npxVersion" -ForegroundColor Green
    }
} catch {
    # Try checking common Node.js paths
    $nodePaths = @(
        "C:\Program Files\nodejs\npx.cmd",
        "C:\Program Files (x86)\nodejs\npx.cmd",
        "$env:APPDATA\npm\npx.cmd"
    )
    
    foreach ($path in $nodePaths) {
        if (Test-Path $path) {
            $npxAvailable = $true
            Write-Host "Found npx at: $path" -ForegroundColor Green
            break
        }
    }
}

if (-not $npxAvailable) {
    Write-Host "npx is not available. Node.js needs to be installed first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Node.js via winget..." -ForegroundColor Yellow
    Write-Host "This will take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    
    Write-Host ""
    Write-Host "Node.js installation initiated." -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: After Node.js installation completes:" -ForegroundColor Yellow
    Write-Host "  1. Close and reopen this terminal/PowerShell window" -ForegroundColor White
    Write-Host "  2. Run this script again, OR" -ForegroundColor White
    Write-Host "  3. Run manually: npx @railway/cli login" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install Node.js manually from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Connecting to Railway..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will download and run Railway CLI via npx." -ForegroundColor Yellow
Write-Host "A browser window will open for authentication." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please log in with:" -ForegroundColor Yellow
Write-Host "  Email: comptegautier34@gmail.com" -ForegroundColor White
Write-Host "  Username: gauthierc2001" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Running: npx @railway/cli login" -ForegroundColor Cyan
Write-Host ""

# Login to Railway using npx
& npx @railway/cli login

if ($LASTEXITCODE -eq 0 -or $?) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Railway CLI Connected Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verify connection
    Write-Host "Verifying connection..." -ForegroundColor Cyan
    & npx @railway/cli whoami
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Link your project: npx @railway/cli link" -ForegroundColor White
    Write-Host "  2. Deploy: npx @railway/cli up" -ForegroundColor White
    Write-Host "  3. View status: npx @railway/cli status" -ForegroundColor White
    Write-Host ""
    Write-Host "Tip: You can create aliases to avoid typing 'npx @railway/cli' each time:" -ForegroundColor Cyan
    Write-Host "  Set-Alias railway 'npx @railway/cli'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Login process started." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If browser didn't open, use browserless login:" -ForegroundColor Yellow
    Write-Host "  npx @railway/cli login --browserless" -ForegroundColor White
    Write-Host ""
    Write-Host "This will give you a URL and code to visit manually." -ForegroundColor Yellow
}


