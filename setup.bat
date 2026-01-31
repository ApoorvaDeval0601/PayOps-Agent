@echo off
echo.
echo 🚀 PayOps Agent Setup
echo ====================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Check for .env.local
if not exist .env.local (
    echo ⚙️  Creating .env.local file...
    copy .env.local.example .env.local
    echo.
    echo ⚠️  IMPORTANT: Edit .env.local and add your Anthropic API key
    echo Get your API key from: https://console.anthropic.com/
    echo.
    notepad .env.local
) else (
    echo ✅ .env.local already exists
)

echo.
echo ✨ Setup complete!
echo.
echo Next steps:
echo 1. Add your Anthropic API key to .env.local
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo To deploy to Vercel:
echo 1. Run: npm install -g vercel
echo 2. Run: vercel
echo.
echo Happy coding! 🎉
echo.
pause
