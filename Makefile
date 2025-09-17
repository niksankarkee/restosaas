# RestoSaaS Makefile

.PHONY: help build test clean dev api web docker-up docker-down migrate-up migrate-down

# Default target
help:
	@echo "Available commands:"
	@echo "  dev          - Start development environment"
	@echo "  api          - Start API server"
	@echo "  web          - Start web server"
	@echo "  build        - Build all services"
	@echo "  test         - Run all tests"
	@echo "  test-api     - Run API tests"
	@echo "  test-web     - Run web tests"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-up    - Start services with Docker Compose"
	@echo "  docker-down  - Stop services with Docker Compose"
	@echo "  migrate-up   - Run database migrations"
	@echo "  migrate-down - Rollback database migrations"
	@echo "  reset-db     - Reset Docker database (drop and recreate)"
	@echo "  seed-db      - Seed database with sample data"
	@echo "  setup-db     - Reset and seed database"
	@echo "  lint         - Run linting"
	@echo "  format       - Format code"

# Development
dev: docker-up
	@echo "Starting development environment..."

# Start API server
api:
	@echo "Starting API server..."
	cd apps/api && export JWT_SECRET="your-secret-key" && export APP_ENV="dev" && go run ./cmd/api

# Start web server
web:
	@echo "Starting web server..."
	cd apps/web && npm run dev

# Build all services
build:
	@echo "Building API..."
	cd apps/api && go build -o api ./cmd/api
	@echo "Building web..."
	cd apps/web && npm run build

# Testing
test: test-api test-web

test-api:
	@echo "Running API tests..."
	cd apps/api && go test -v ./...

test-web:
	@echo "Running web tests..."
	cd apps/web && npm test || true

# Docker commands
docker-up:
	@echo "Starting services with Docker Compose..."
	docker compose -f infra/docker-compose.yml up -d

docker-down:
	@echo "Stopping services with Docker Compose..."
	docker compose -f infra/docker-compose.yml down

# Database migrations
migrate-up:
	@echo "Running database migrations..."
	cd apps/api && go run ./cmd/migrate up

migrate-down:
	@echo "Rolling back database migrations..."
	cd apps/api && go run ./cmd/migrate down

# Code quality
lint:
	@echo "Running linters..."
	cd apps/api && golangci-lint run
	cd apps/web && npm run lint || true

format:
	@echo "Formatting code..."
	cd apps/api && go fmt ./...
	cd apps/web && npm run format || true

# Clean up
clean:
	@echo "Cleaning build artifacts..."
	cd apps/api && rm -f api
	cd apps/web && rm -rf .next
	cd apps/web && rm -rf node_modules/.cache

# CI/CD helpers
ci-test: test-api test-web
	@echo "CI tests completed"

ci-build: build
	@echo "CI build completed"

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd apps/api && go mod download
	cd apps/web && npm install

# Database reset and seeding
reset-db:
	@echo "Resetting Docker database..."
	docker compose -f infra/docker-compose.yml down -v
	docker compose -f infra/docker-compose.yml up -d db
	@echo "Waiting for database to be ready..."
	sleep 10
	@echo "Database reset complete!"

seed-db:
	@echo "Seeding database with sample data..."
	cd scripts && chmod +x simple-seed.sh && ./simple-seed.sh

setup-db: reset-db seed-db
	@echo "Database setup complete!"

# Setup development environment
setup: install docker-up
	@echo "Development environment setup complete!"
	@echo "API: http://localhost:8080"
	@echo "Web: http://localhost:3000"
	@echo "Database: localhost:5432"
