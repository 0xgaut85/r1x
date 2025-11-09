# Railway CLI Connection Script
# Email: comptegautier34@gmail.com
# Username: gauthierc2001

Write-Host "Railway CLI Connection Setup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Railway Account:" -ForegroundColor Yellow
Write-Host "  Email: comptegautier34@gmail.com" -ForegroundColor White
Write-Host "  Username: gauthierc2001" -ForegroundColor White
Write-Host ""

# Function to find Node.js
function Find-NodeJS {
    $paths = @(
        "node",
        "C:\Program Files\nodejs\node.exe",
        "C:\Program Files (x86)\nodejs\node.exe",
        "$env:APPDATA\npm\node.exe",
        "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
    )
    
    foreach ($path in $paths) {
        try {
            if ($path -eq "node") {
                $result = & node --version 2>&1
            } else {
                if (Test-Path $path) {
                    $result = & $path --version 2>&1
                } else {
                    continue
                }
            }
            if ($LASTEXITCODE -eq 0 -or $?) {
                return $path
            }
        } catch {
            continue
        }
    }
    return $null
}

# Find Node.js
$nodePath = Find-NodeJS

if (-not $nodePath) {
    Write-Host "Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Node.js via winget..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    
    Write-Host ""
    Write-Host "Node.js installation completed. Please:" -ForegroundColor Yellow
    Write-Host "  1. Close and reopen this terminal" -ForegroundColor White
    Write-Host "  2. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or manually install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found Node.js" -ForegroundColor Green
$nodeVersion = if ($nodePath -eq "node") { & node --version } else { & $nodePath --version }
Write-Host "  Version: $nodeVersion" -ForegroundColor White
Write-Host ""

# Determine npm command
$npmCmd = if ($nodePath -eq "node") { "npm" } else { $nodePath.Replace("node.exe", "npm.cmd") }

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI..." -ForegroundColor Cyan
try {
    $railwayVersion = & railway --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $?) {
        Write-Host "Railway CLI is installed: $railwayVersion" -ForegroundColor Green
        $railwayInstalled = $true
    } else {
        $railwayInstalled = $false
    }
} catch {
    $railwayInstalled = $false
}

if (-not $railwayInstalled) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Cyan
    Write-Host "This may take a minute..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($npmCmd -eq "npm") {
        & npm install -g @railway/cli
    } else {
        & $npmCmd install -g @railway/cli
    }
    
    if ($LASTEXITCODE -eq 0 -or $?) {
        Write-Host "Railway CLI installed successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to install Railway CLI" -ForegroundColor Red
        Write-Host "Try running manually: npm install -g @railway/cli" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Connecting to Railway..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will open your browser for authentication." -ForegroundColor Yellow
Write-Host "Please log in with:" -ForegroundColor Yellow
Write-Host "  Email: comptegautier34@gmail.com" -ForegroundColor White
Write-Host "  Username: gauthierc2001" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Login to Railway
Write-Host ""
Write-Host "Opening Railway login..." -ForegroundColor Cyan
& railway login

if ($LASTEXITCODE -eq 0 -or $?) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Railway CLI Connected Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verify connection
    Write-Host "Verifying connection..." -ForegroundColor Cyan
    & railway whoami
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Link your project: railway link" -ForegroundColor White
    Write-Host "  2. Deploy: railway up" -ForegroundColor White
    Write-Host "  3. View services: railway status" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Login process started. If browser didn't open, use browserless login:" -ForegroundColor Yellow
    Write-Host "  railway login --browserless" -ForegroundColor White
    Write-Host ""
    Write-Host "This will give you a URL and code to visit manually." -ForegroundColor Yellow
}



