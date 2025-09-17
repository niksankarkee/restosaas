#!/bin/bash

# Reset Database Script
# This script resets the database to ensure it matches the current code structure

set -e

echo "🔄 Resetting database to match current code structure..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if the database container exists
if ! docker ps -a | grep -q restosaas_db; then
    echo "❌ Database container 'restosaas_db' not found. Please run 'docker compose up -d' first."
    exit 1
fi

echo "📦 Stopping and removing existing database container..."
docker compose down

echo "🗑️  Removing database volume to ensure clean state..."
docker volume rm restosaas_postgres_data 2>/dev/null || true

echo "🚀 Starting fresh database container..."
docker compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔧 Running database migrations..."
cd apps/api
go run cmd/api/main.go &
API_PID=$!

# Wait for API to start and run migrations
sleep 5

echo "🛑 Stopping API server..."
kill $API_PID 2>/dev/null || true

echo "✅ Database reset complete!"
echo ""
echo "📋 Current database structure:"
docker exec restosaas_db psql -U postgres -d restosaas -c "\d"

echo ""
echo "🎉 You can now run the application with:"
echo "   cd apps/api && go run cmd/api/main.go"
echo "   cd apps/web && npm run dev"
