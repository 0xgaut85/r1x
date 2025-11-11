# Railway CLI Installation and Connection Script
Write-Host "Railway CLI Setup" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""

# Check for npm/Node.js
$nodeFound = $false
$npmCmd = "npm"

# Check common Node.js locations
$nodePaths = @(
    "node",
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

foreach ($path in $nodePaths) {
    try {
        $result = & $path --version 2>&1
        if ($LASTEXITCODE -eq 0 -or $?) {
            $nodeFound = $true
            $npmCmd = if ($path -eq "node") { "npm" } else { $path.Replace("node.exe", "npm.cmd") }
            break
        }
    } catch {
        continue
    }
}

if (-not $nodeFound) {
    Write-Host "Node.js is not installed or not found in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://nodejs.org/" -ForegroundColor White
    Write-Host "  2. Install Node.js (includes npm)" -ForegroundColor White
    Write-Host "  3. Restart your terminal" -ForegroundColor White
    Write-Host "  4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternatively, install Railway CLI globally via npm:" -ForegroundColor Yellow
    Write-Host "  npm install -g @railway/cli" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use npx to run Railway CLI without installing:" -ForegroundColor Yellow
    Write-Host "  npx @railway/cli login" -ForegroundColor White
    exit 1
}

Write-Host "Found Node.js" -ForegroundColor Green
Write-Host ""

# Check if Railway CLI is already installed
Write-Host "Checking if Railway CLI is installed..." -ForegroundColor Cyan
try {
    $railwayVersion = & railway --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $?) {
        Write-Host "Railway CLI is already installed: $railwayVersion" -ForegroundColor Green
        $railwayInstalled = $true
    } else {
        $railwayInstalled = $false
    }
} catch {
    $railwayInstalled = $false
}

if (-not $railwayInstalled) {
    Write-Host "Installing Railway CLI globally..." -ForegroundColor Cyan
    & $npmCmd install -g @railway/cli
    
    if ($LASTEXITCODE -eq 0 -or $?) {
        Write-Host "Railway CLI installed successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to install Railway CLI" -ForegroundColor Red
        Write-Host "Try running manually: npm install -g @railway/cli" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Connecting to Railway..." -ForegroundColor Cyan
Write-Host "This will open your browser for authentication." -ForegroundColor Yellow
Write-Host ""

# Login to Railway
& railway login

if ($LASTEXITCODE -eq 0 -or $?) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Railway CLI Connected Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Link your project: railway link" -ForegroundColor White
    Write-Host "  2. Deploy: railway up" -ForegroundColor White
    Write-Host "  3. View logs: railway logs" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Login failed. Try running manually:" -ForegroundColor Yellow
    Write-Host "  railway login" -ForegroundColor White
    Write-Host ""
    Write-Host "For browserless login (SSH/CI):" -ForegroundColor Yellow
    Write-Host "  railway login --browserless" -ForegroundColor White
}








