#!/bin/bash

echo "🚀 PayOps Agent Setup"
echo "===================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚙️  Creating .env.local file..."
    cp .env.local.example .env.local
    echo "⚠️  IMPORTANT: Edit .env.local and add your Anthropic API key"
    echo ""
    echo "Get your API key from: https://console.anthropic.com/"
    echo ""
    read -p "Do you want to open .env.local now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v code &> /dev/null; then
            code .env.local
        elif command -v nano &> /dev/null; then
            nano .env.local
        elif command -v vim &> /dev/null; then
            vim .env.local
        else
            echo "Please edit .env.local manually"
        fi
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Anthropic API key to .env.local"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "To deploy to Vercel:"
echo "1. Run: npm install -g vercel"
echo "2. Run: vercel"
echo ""
echo "Happy coding! 🎉"
