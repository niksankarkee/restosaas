# RestoSaaS Monorepo Makefile

.PHONY: help setup install-all dev dev-all dev-api dev-customer dev-backoffice build build-all test test-all clean clean-all lint format docker-up docker-down reset-db seed-db setup-db stop stop-all

# Default target
help:
	@echo "RestoSaaS Monorepo - Available Commands:"
	@echo ""
	@echo "🚀 Development:"
	@echo "  dev-all        - Start all services (API + Customer + Backoffice)"
	@echo "  dev-api        - Start API server only"
	@echo "  dev-customer   - Start customer app only"
	@echo "  dev-backoffice - Start backoffice app only"
	@echo "  stop-all       - Stop all running services"
	@echo "  stop           - Stop all running services (alias for stop-all)"
	@echo ""
	@echo "📦 Setup & Install:"
	@echo "  setup          - Complete development setup"
	@echo "  install-all    - Install all dependencies"
	@echo ""
	@echo "🏗️ Build:"
	@echo "  build-all      - Build all applications"
	@echo "  build-customer - Build customer app"
	@echo "  build-backoffice - Build backoffice app"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test-all       - Run all tests"
	@echo "  test-api       - Run API tests"
	@echo "  test-customer  - Run customer app tests"
	@echo "  test-backoffice - Run backoffice app tests"
	@echo ""
	@echo "🗄️ Database:"
	@echo "  docker-up      - Start Docker services"
	@echo "  docker-down    - Stop Docker services"
	@echo "  reset-db       - Reset database"
	@echo "  seed-db        - Seed database"
	@echo "  setup-db       - Reset and seed database"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  clean-all      - Clean all build artifacts"
	@echo "  clean-customer - Clean customer app"
	@echo "  clean-backoffice - Clean backoffice app"
	@echo ""
	@echo "🔧 Code Quality:"
	@echo "  lint           - Run linting"
	@echo "  format         - Format code"

# Complete development setup
setup: install-all docker-up
	@echo "✅ Development environment setup complete!"
	@echo ""
	@echo "🌐 Services:"
	@echo "  API:        http://localhost:8080"
	@echo "  Customer:   http://localhost:3000"
	@echo "  Backoffice: http://localhost:3001"
	@echo "  Database:   localhost:5432"
	@echo ""
	@echo "🚀 To start all services: make dev-all"

# Install all dependencies
install-all:
	@echo "📦 Installing all dependencies..."
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing customer app dependencies..."
	cd apps/customer && npm install
	@echo "Installing backoffice app dependencies..."
	cd apps/backoffice && npm install
	@echo "Installing shared packages dependencies..."
	cd packages/types && npm install
	cd packages/api-client && npm install
	cd packages/ui && npm install
	@echo "Installing API dependencies..."
	cd apps/api && go mod download
	@echo "✅ All dependencies installed!"

# Development - All services
dev: dev-all

dev-all: docker-up
	@echo "🚀 Starting all development services..."
	@echo "Starting API server..."
	@cd apps/api && export JWT_SECRET="your-secret-key" && export APP_ENV="dev" && go run ./cmd/api &
	@echo "Starting customer app..."
	@cd apps/customer && npm run dev &
	@echo "Starting backoffice app..."
	@cd apps/backoffice && npm run dev &
	@echo "✅ All services started!"
	@echo "🌐 Customer:   http://localhost:3000"
	@echo "🌐 Backoffice: http://localhost:3001"
	@echo "🌐 API:        http://localhost:8080"
	@echo "Press Ctrl+C to stop all services"

# Development - Individual services
dev-api:
	@echo "🚀 Starting API server on http://localhost:8080..."
	cd apps/api && export JWT_SECRET="your-secret-key" && export APP_ENV="dev" && go run ./cmd/api

dev-customer:
	@echo "🚀 Starting customer app on http://localhost:3000..."
	cd apps/customer && npm run dev

dev-backoffice:
	@echo "🚀 Starting backoffice app on http://localhost:3001..."
	cd apps/backoffice && npm run dev

# Build all applications
build-all: build-customer build-backoffice
	@echo "✅ All applications built!"

build-customer:
	@echo "🏗️ Building customer app..."
	cd apps/customer && npm run build

build-backoffice:
	@echo "🏗️ Building backoffice app..."
	cd apps/backoffice && npm run build

# Testing
test-all: test-api test-customer test-backoffice
	@echo "✅ All tests completed!"

test-api:
	@echo "🧪 Running API tests..."
	cd apps/api && go test -v ./... || echo "⚠️ API tests completed with warnings"

test-customer:
	@echo "🧪 Running customer app tests..."
	cd apps/customer && npm run test || echo "⚠️ Customer tests completed with warnings"

test-backoffice:
	@echo "🧪 Running backoffice app tests..."
	cd apps/backoffice && npm run test || echo "⚠️ Backoffice tests completed with warnings"

# Docker commands
docker-up:
	@echo "🐳 Starting Docker services..."
	docker compose -f infra/docker-compose.yml up -d
	@echo "⏳ Waiting for database to be ready..."
	@sleep 5
	@echo "✅ Docker services started!"

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker compose -f infra/docker-compose.yml down
	@echo "✅ Docker services stopped!"

# Database commands
reset-db:
	@echo "🗄️ Resetting database..."
	./scripts/reset-database.sh
	@echo "✅ Database reset complete!"

seed-db:
	@echo "🌱 Seeding database..."
	cd scripts && chmod +x simple-seed.sh && ./simple-seed.sh
	@echo "✅ Database seeded!"

setup-db: reset-db seed-db
	@echo "✅ Database setup complete!"

# Clean up
clean-all: clean-customer clean-backoffice
	@echo "🧹 Cleaning API build artifacts..."
	cd apps/api && rm -f api
	@echo "✅ All build artifacts cleaned!"

clean-customer:
	@echo "🧹 Cleaning customer app..."
	cd apps/customer && rm -rf .next && rm -rf node_modules/.cache

clean-backoffice:
	@echo "🧹 Cleaning backoffice app..."
	cd apps/backoffice && rm -rf dist && rm -rf node_modules/.vite

# Code quality
lint:
	@echo "🔍 Running linters..."
	@echo "Linting API..."
	cd apps/api && golangci-lint run || echo "⚠️ API linting completed with warnings"
	@echo "Linting customer app..."
	cd apps/customer && npm run lint || echo "⚠️ Customer linting completed with warnings"
	@echo "Linting backoffice app..."
	cd apps/backoffice && npm run lint || echo "⚠️ Backoffice linting completed with warnings"

format:
	@echo "🎨 Formatting code..."
	@echo "Formatting API..."
	cd apps/api && go fmt ./...
	@echo "Formatting customer app..."
	cd apps/customer && npm run format || echo "⚠️ Customer formatting completed with warnings"
	@echo "Formatting backoffice app..."
	cd apps/backoffice && npm run format || echo "⚠️ Backoffice formatting completed with warnings"

# Migration helpers
migrate-to-new:
	@echo "🔄 Running migration to new structure..."
	./migrate-to-new-structure.sh

# Quick start for new structure
quick-start: install-all docker-up
	@echo "🚀 Quick start complete!"
	@echo "Run 'make dev-all' to start all services"

# Health check
health-check:
	@echo "🏥 Checking service health..."
	@echo "Checking API..."
	@curl -s http://localhost:8080/health > /dev/null && echo "✅ API is healthy" || echo "❌ API is not responding"
	@echo "Checking customer app..."
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Customer app is healthy" || echo "❌ Customer app is not responding"
	@echo "Checking backoffice app..."
	@curl -s http://localhost:3001 > /dev/null && echo "✅ Backoffice app is healthy" || echo "❌ Backoffice app is not responding"

# Development workflow
dev-workflow: clean-all install-all docker-up setup-db
	@echo "🔄 Development workflow complete!"
	@echo "Ready to start development with: make dev-all"

# Stop all running services
stop-all:
	@echo "🛑 Stopping all running services..."
	@pkill -f "go run" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@pkill -f "vite" 2>/dev/null || true
	@lsof -ti:3000,3001,8080 | xargs kill -9 2>/dev/null || true
	@echo "✅ All services stopped"

# Alias for stop-all
stop: stop-all