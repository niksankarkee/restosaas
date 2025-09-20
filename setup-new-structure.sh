#!/bin/bash

echo "🚀 Setting up new RestoSaaS monorepo structure..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."

# Customer app
echo "  - Installing customer app dependencies..."
cd apps/customer
npm install
cd ../..

# Backoffice app
echo "  - Installing backoffice app dependencies..."
cd apps/backoffice
npm install
cd ../..

# Shared packages
echo "  - Installing shared packages dependencies..."
cd packages/types
npm install
cd ../api-client
npm install
cd ../ui
npm install
cd ../..

echo "✅ Setup completed!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Or start individual services:"
echo "  npm run dev:customer    # Next.js app on :3000"
echo "  npm run dev:backoffice  # Vite app on :3001"
echo "  npm run dev:api         # Go API on :8080"
