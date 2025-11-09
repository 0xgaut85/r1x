@echo off
REM Refresh PATH and run npm install

REM Add Node.js to PATH
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Verify Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please restart your terminal or install Node.js.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo npm version:
npm --version
echo.

echo Installing dependencies...
npm install

pause


