# Makefile for Restaurant SaaS API

.PHONY: help test test-verbose test-coverage test-race build run clean deps install-tools

# Default target
help:
	@echo "Available targets:"
	@echo "  test          - Run all tests"
	@echo "  test-verbose  - Run tests with verbose output"
	@echo "  test-coverage - Run tests with coverage report"
	@echo "  test-race     - Run tests with race detection"
	@echo "  build         - Build the application"
	@echo "  run           - Run the application"
	@echo "  clean         - Clean build artifacts"
	@echo "  deps          - Download dependencies"
	@echo "  install-tools - Install required tools"

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

# Install required tools
install-tools:
	@echo "Installing required tools..."
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run all tests
test: test-unit test-integration

# Run unit tests (with mocks)
test-unit:
	@echo "Running unit tests..."
	go test ./internal/handlers -v -run "TestUserHandler_CreateUser_InvalidData|TestUserHandler_Login_InvalidData|TestUserHandler_GetUser_InvalidID|TestUserHandler_UpdateUser_InvalidID"

# Run integration tests (with real database)
test-integration:
	@echo "Running integration tests..."
	@if [ -z "$$TEST_DATABASE_URL" ]; then \
		echo "Skipping integration tests - no TEST_DATABASE_URL configured"; \
		echo "Set TEST_DATABASE_URL to run integration tests, e.g.:"; \
		echo "export TEST_DATABASE_URL=postgres://user:pass@localhost:5432/testdb?sslmode=disable"; \
	else \
		go test ./internal/handlers -v -run "TestUserHandler_Integration"; \
	fi

# Run tests with verbose output
test-verbose:
	@echo "Running tests with verbose output..."
	go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	go test -coverprofile=coverage.out ./internal/handlers -tags=unit
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Run tests with race detection
test-race:
	@echo "Running tests with race detection..."
	go test -race ./...

# Build the application
build:
	@echo "Building application..."
	go build -o bin/api cmd/api/main.go

# Run the application
run:
	@echo "Running application..."
	go run cmd/api/main.go

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -f coverage.out coverage.html

# Run linter
lint:
	@echo "Running linter..."
	golangci-lint run

# Generate Swagger documentation
swagger:
	@echo "Generating Swagger documentation..."
	swag init -g cmd/api/main.go -o ./docs

# Run all checks (tests, lint, build)
check: test lint build
	@echo "All checks passed!"

# CI/CD pipeline
ci: deps test-coverage lint build
	@echo "CI pipeline completed successfully!"
