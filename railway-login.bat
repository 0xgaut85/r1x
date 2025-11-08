@echo off
REM Refresh PATH to include Node.js
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "MACHINE_PATH=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%B"
set "PATH=%MACHINE_PATH%;%USER_PATH%"

REM Verify Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please restart your terminal or install Node.js.
    pause
    exit /b 1
)

echo Connecting to Railway CLI...
echo This will open your browser for authentication.
echo Login with: comptegautier34@gmail.com (gauthierc2001)
echo.

npx @railway/cli login

pause


