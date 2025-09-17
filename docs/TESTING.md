# Testing Documentation

## Overview

This document provides comprehensive information about the testing setup for the Restaurant SaaS application, including backend unit tests, frontend unit tests, integration tests, and CI/CD pipeline.

## Backend Testing

### Test Framework

- **Go Testing**: Built-in Go testing package
- **Testify**: For assertions and test suites
- **SQLite**: In-memory database for testing

### Running Backend Tests

```bash
# Navigate to backend directory
cd apps/api

# Run all tests
make test

# Run tests with verbose output
make test-verbose

# Run tests with coverage
make test-coverage

# Run tests with race detection
make test-race

# Run linter
make lint

# Run all checks (tests, lint, build)
make check
```

### Test Structure

```
apps/api/
├── internal/
│   ├── handlers/
│   │   ├── users_test.go
│   │   ├── restaurant_test.go
│   │   └── public_test.go
│   └── services/
│       └── search_test.go
├── test_config.go
└── Makefile
```

### Test Coverage

The backend test suite covers:

- **User Management**: Create, read, update, delete users
- **Authentication**: Login, registration, JWT token handling
- **Restaurant Management**: CRUD operations for restaurants
- **Search Functionality**: Advanced search with filters and caching
- **Public API**: Restaurant listing and public endpoints
- **Error Handling**: Various error scenarios and edge cases

### Test Database

Tests use an in-memory SQLite database to ensure:

- Fast test execution
- Isolation between tests
- No external dependencies
- Consistent test environment

## Frontend Testing

### Test Framework

- **Jest**: JavaScript testing framework
- **React Testing Library**: For component testing
- **jsdom**: DOM environment for testing

### Running Frontend Tests

```bash
# Navigate to frontend directory
cd apps/web

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure

```
apps/web/
├── lib/
│   └── __tests__/
│       ├── utils.test.ts
│       ├── validations.test.ts
│       └── api.test.ts
├── components/
│   └── ui/
│       └── __tests__/
│           ├── enhanced-button.test.tsx
│           └── enhanced-input.test.tsx
├── contexts/
│   └── __tests__/
│       └── auth-context.test.tsx
├── jest.config.js
└── jest.setup.js
```

### Test Coverage

The frontend test suite covers:

- **Utility Functions**: String manipulation, class name merging
- **Validation Schemas**: Form validation using Zod
- **API Layer**: HTTP client and request handling
- **UI Components**: Button, input, and other reusable components
- **Context Providers**: Authentication state management
- **Form Handling**: React Hook Form integration

### Mocking

The frontend tests use comprehensive mocking:

- **Next.js Router**: Mocked for navigation testing
- **Axios**: Mocked for API calls
- **Browser APIs**: matchMedia, IntersectionObserver, ResizeObserver
- **Local Storage**: Cleared between tests

## Integration Testing

### Test Environment

- **Backend**: Go API server
- **Frontend**: Next.js application
- **Database**: PostgreSQL (test instance)
- **Test Runner**: GitHub Actions

### Running Integration Tests

Integration tests are automatically run in the CI/CD pipeline:

```bash
# The integration tests are run in GitHub Actions
# They test the full application stack:
# 1. Backend API health check
# 2. API endpoint functionality
# 3. Frontend application loading
# 4. End-to-end user flows
```

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Backend Tests**

   - Unit tests with coverage
   - Linting with golangci-lint
   - Database integration tests

2. **Frontend Tests**

   - Unit tests with coverage
   - Linting with ESLint
   - Build verification

3. **Integration Tests**

   - Full stack testing
   - API endpoint verification
   - Frontend-backend communication

4. **Security Scanning**

   - Vulnerability scanning with Trivy
   - Dependency security checks

5. **Deployment**
   - Staging deployment (develop branch)
   - Production deployment (main branch)

### Pipeline Triggers

- **Push to main/develop**: Full pipeline execution
- **Pull Requests**: Test and security scanning
- **Manual**: On-demand execution

## Test Data Management

### Backend Test Data

- Created in `SetupTest()` methods
- Cleaned up in `TearDownTest()` methods
- Uses realistic but minimal data sets

### Frontend Test Data

- Mock data in test files
- Isolated test scenarios
- No persistent data between tests

## Coverage Requirements

### Backend Coverage

- **Minimum**: 70% overall coverage
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Frontend Coverage

- **Minimum**: 70% overall coverage
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

### Backend Testing

1. **Test Isolation**: Each test is independent
2. **Database Cleanup**: Clean state between tests
3. **Error Scenarios**: Test both success and failure cases
4. **Edge Cases**: Test boundary conditions
5. **Performance**: Use race detection for concurrency tests

### Frontend Testing

1. **Component Testing**: Test behavior, not implementation
2. **User Interactions**: Test user-facing functionality
3. **Accessibility**: Ensure components are accessible
4. **Error Boundaries**: Test error handling
5. **Mocking**: Mock external dependencies appropriately

### General Testing

1. **Descriptive Names**: Clear test descriptions
2. **Single Responsibility**: One test per scenario
3. **Arrange-Act-Assert**: Clear test structure
4. **Fast Execution**: Keep tests fast and reliable
5. **Maintainable**: Easy to update and extend

## Debugging Tests

### Backend Debugging

```bash
# Run specific test with verbose output
go test -v ./internal/handlers -run TestUserHandler

# Run test with race detection
go test -race ./internal/handlers

# Run test with coverage and open HTML report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Frontend Debugging

```bash
# Run specific test file
npm test -- enhanced-button.test.tsx

# Run tests in watch mode for development
npm run test:watch

# Run tests with debug output
npm test -- --verbose
```

## Continuous Improvement

### Test Metrics

- **Coverage**: Track coverage trends
- **Performance**: Monitor test execution time
- **Reliability**: Track flaky tests
- **Maintenance**: Test maintenance overhead

### Regular Reviews

- **Monthly**: Review test coverage and quality
- **Quarterly**: Update testing frameworks and tools
- **Annually**: Comprehensive testing strategy review

## Troubleshooting

### Common Issues

1. **Test Database Connection**

   - Ensure PostgreSQL is running
   - Check connection parameters
   - Verify database permissions

2. **Frontend Test Failures**

   - Clear node_modules and reinstall
   - Check Jest configuration
   - Verify mock setup

3. **CI/CD Pipeline Failures**
   - Check GitHub Actions logs
   - Verify environment variables
   - Test locally first

### Getting Help

- **Documentation**: Check this file and API documentation
- **Logs**: Review test output and CI logs
- **Team**: Consult with development team
- **Issues**: Create GitHub issues for bugs

## Future Enhancements

### Planned Improvements

1. **E2E Testing**: Add Playwright or Cypress tests
2. **Performance Testing**: Load testing for API endpoints
3. **Visual Testing**: Screenshot comparison tests
4. **API Testing**: Contract testing with Pact
5. **Mobile Testing**: React Native testing setup

### Monitoring

1. **Test Metrics**: Track test execution metrics
2. **Coverage Trends**: Monitor coverage over time
3. **Flaky Tests**: Identify and fix unreliable tests
4. **Performance**: Monitor test execution time
