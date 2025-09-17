#!/bin/bash

# Restaurant SaaS - Test Runner Script
# This script runs all tests for both backend and frontend

set -e

echo "🚀 Starting Restaurant SaaS Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
BACKEND_ONLY=false
FRONTEND_ONLY=false
COVERAGE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backend-only    Run only backend tests"
            echo "  --frontend-only   Run only frontend tests"
            echo "  --coverage        Generate coverage reports"
            echo "  --verbose         Verbose output"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Backend Tests
if [ "$FRONTEND_ONLY" = false ]; then
    print_status "Running Backend Tests..."
    echo "================================"
    
    cd apps/api
    
    # Check if Go is installed
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.24.0 or later."
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing Go dependencies..."
    go mod download
    go mod tidy
    
    # Run tests
    if [ "$COVERAGE" = true ]; then
        print_status "Running backend tests with coverage..."
        make test-coverage
    elif [ "$VERBOSE" = true ]; then
        print_status "Running backend tests with verbose output..."
        make test-verbose
    else
        print_status "Running backend tests..."
        make test
    fi
    
    # Run linter
    print_status "Running backend linter..."
    if command -v golangci-lint &> /dev/null; then
        make lint
    else
        print_warning "golangci-lint not installed. Skipping linting."
        print_warning "Install with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"
    fi
    
    cd ../..
    
    if [ $? -eq 0 ]; then
        print_success "Backend tests passed!"
    else
        print_error "Backend tests failed!"
        exit 1
    fi
fi

# Frontend Tests
if [ "$BACKEND_ONLY" = false ]; then
    print_status "Running Frontend Tests..."
    echo "================================="
    
    cd apps/web
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm ci
    
    # Run tests
    if [ "$COVERAGE" = true ]; then
        print_status "Running frontend tests with coverage..."
        npm run test:coverage
    elif [ "$VERBOSE" = true ]; then
        print_status "Running frontend tests with verbose output..."
        npm test -- --verbose
    else
        print_status "Running frontend tests..."
        npm run test:ci
    fi
    
    # Run linter
    print_status "Running frontend linter..."
    if command -v npx &> /dev/null; then
        npx eslint . --ext .ts,.tsx --max-warnings 0 || print_warning "ESLint found warnings or errors"
    else
        print_warning "ESLint not available. Skipping linting."
    fi
    
    cd ../..
    
    if [ $? -eq 0 ]; then
        print_success "Frontend tests passed!"
    else
        print_error "Frontend tests failed!"
        exit 1
    fi
fi

# Summary
echo ""
echo "======================================"
print_success "All tests completed successfully!"
echo "======================================"

if [ "$COVERAGE" = true ]; then
    echo ""
    print_status "Coverage reports generated:"
    echo "  Backend: apps/api/coverage.html"
    echo "  Frontend: apps/web/coverage/lcov-report/index.html"
fi

echo ""
print_status "Next steps:"
echo "  - Review test results above"
echo "  - Check coverage reports if --coverage was used"
echo "  - Run 'make check' in apps/api for backend checks"
echo "  - Run 'npm run build' in apps/web to verify build"
echo ""
