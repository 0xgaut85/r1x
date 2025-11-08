# Railway Configuration Script using API
$token = "928044a7-970d-4bd2-b412-ac8eede49728"
$projectId = "e6f4b052-d460-4f53-912d-a610960cb455"
$baseUrl = "https://api.railway.app/v1"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "🚂 Configuring Railway services via API..." -ForegroundColor Cyan

# Get project services
Write-Host "`n1. Fetching services..." -ForegroundColor Yellow
$servicesUrl = "$baseUrl/projects/$projectId/services"
try {
    $services = Invoke-RestMethod -Uri $servicesUrl -Headers $headers -Method Get
    Write-Host "Found services:" -ForegroundColor Green
    $services | ForEach-Object {
        Write-Host "  - $($_.name) (ID: $($_.id))" -ForegroundColor White
    }
    
    # Find Express service (usually the second one or named differently)
    $expressService = $services | Where-Object { $_.name -ne "r1x" -and $_.name -notlike "*next*" } | Select-Object -First 1
    $nextjsService = $services | Where-Object { $_.name -eq "r1x" -or $_.name -like "*next*" } | Select-Object -First 1
    
    if ($expressService) {
        Write-Host "`n2. Configuring Express service: $($expressService.name)" -ForegroundColor Yellow
        
        # Update service settings (root directory, build/start commands)
        $updateUrl = "$baseUrl/services/$($expressService.id)"
        $updateBody = @{
            rootDirectory = "x402-server"
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri $updateUrl -Headers $headers -Method Patch -Body $updateBody
            Write-Host "   ✓ Set root directory to 'x402-server'" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Could not update root directory via API (may need dashboard)" -ForegroundColor Yellow
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Get service URL
        Write-Host "`n3. Getting Express service URL..." -ForegroundColor Yellow
        $domainsUrl = "$baseUrl/services/$($expressService.id)/domains"
        try {
            $domains = Invoke-RestMethod -Uri $domainsUrl -Headers $headers -Method Get
            if ($domains -and $domains.Count -gt 0) {
                $expressUrl = $domains[0].domain
                Write-Host "   ✓ Express URL: $expressUrl" -ForegroundColor Green
                
                # Update Next.js service with X402_SERVER_URL
                if ($nextjsService) {
                    Write-Host "`n4. Updating Next.js service variables..." -ForegroundColor Yellow
                    $varsUrl = "$baseUrl/services/$($nextjsService.id)/variables"
                    
                    # Get existing variables
                    try {
                        $existingVars = Invoke-RestMethod -Uri $varsUrl -Headers $headers -Method Get
                        
                        # Check if X402_SERVER_URL exists
                        $x402Var = $existingVars | Where-Object { $_.name -eq "X402_SERVER_URL" }
                        
                        if ($x402Var) {
                            # Update existing variable
                            $updateVarUrl = "$baseUrl/variables/$($x402Var.id)"
                            $varBody = @{
                                value = $expressUrl
                            } | ConvertTo-Json
                            Invoke-RestMethod -Uri $updateVarUrl -Headers $headers -Method Patch -Body $varBody
                            Write-Host "   ✓ Updated X402_SERVER_URL = $expressUrl" -ForegroundColor Green
                        } else {
                            # Create new variable
                            $createVarUrl = "$baseUrl/services/$($nextjsService.id)/variables"
                            $varBody = @{
                                name = "X402_SERVER_URL"
                                value = $expressUrl
                            } | ConvertTo-Json
                            Invoke-RestMethod -Uri $createVarUrl -Headers $headers -Method Post -Body $varBody
                            Write-Host "   ✓ Created X402_SERVER_URL = $expressUrl" -ForegroundColor Green
                        }
                    } catch {
                        Write-Host "   ⚠ Could not update variables via API" -ForegroundColor Yellow
                        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
                        Write-Host "   Please set X402_SERVER_URL=$expressUrl manually in Railway dashboard" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "   ⚠ Next.js service not found" -ForegroundColor Yellow
                }
            } else {
                Write-Host "   ⚠ No domain found. Generate one in Railway dashboard." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ⚠ Could not get domains" -ForegroundColor Yellow
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n⚠ Express service not found!" -ForegroundColor Red
        Write-Host "Make sure you've created the Express service in Railway dashboard." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n✅ Configuration complete!" -ForegroundColor Green
Write-Host "`nNote: Some settings (like build/start commands) may need to be set manually in Railway dashboard:" -ForegroundColor Yellow
Write-Host "  - Express Service → Settings → Build Command: npm install && npm run build" -ForegroundColor White
Write-Host "  - Express Service → Settings → Start Command: npm start" -ForegroundColor White
