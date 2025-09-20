# RestoSaaS

A comprehensive B2B multi-tenant restaurant management SaaS platform with a modern monorepo architecture.

## 🏗️ Architecture

### Monorepo Structure

- **Customer App**: Next.js (Customer-facing website)
- **Backoffice App**: Vite + React SPA (Owner/Admin dashboard)
- **API Server**: Go with Gin framework
- **Shared Packages**: TypeScript types, API client, UI components
- **Database**: PostgreSQL with Docker

### Tech Stack

- **Backend**: Go 1.24+ with Gin, GORM, PostgreSQL
- **Customer Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backoffice Frontend**: Vite + React with TanStack Query, Zustand, React Router
- **Shared**: TypeScript, Axios, shadcn/ui components
- **Package Manager**: pnpm workspaces
- **Authentication**: JWT-based with role-based access control

## 🚀 Quick Start

### Prerequisites

- **Go**: 1.24.0+
- **Node.js**: 18+ (with pnpm)
- **PostgreSQL**: 15+ (or Docker)
- **Docker & Docker Compose**: For database

### 1. Clone the Repository

```bash
git clone <repository-url>
cd restosaas
```

### 2. Install Dependencies

```bash
# Install all dependencies (root + all packages/apps)
make install-all
```

### 3. Start Database

```bash
# Start PostgreSQL with Docker
make docker-up
```

### 4. Run Database Migrations

```bash
# Run database migrations
make migrate-up
```

### 5. Start All Applications

```bash
# Start all services (API + Customer + Backoffice)
make dev
```

**Access the applications:**

- 🌐 **API Server**: http://localhost:8080
- 🛍️ **Customer App**: http://localhost:3000
- ⚙️ **Backoffice App**: http://localhost:3001
- 🗄️ **Database**: localhost:5432

### Alternative: Start Individual Services

```bash
# Start only API server
make dev-api

# Start only customer app
make dev-customer

# Start only backoffice app
make dev-backoffice
```

## 🔧 Alternative Setup Methods

### Method 1: Using npm (instead of pnpm)

If you prefer npm over pnpm:

```bash
# Install root dependencies
npm install

# Install dependencies for each package/app
cd packages/types && npm install
cd ../api-client && npm install
cd ../ui && npm install
cd ../../apps/customer && npm install
cd ../backoffice && npm install
cd ../../apps/api && go mod download
```

### Method 2: Manual Go Backend Setup

```bash
# Start database
docker-compose up -d postgres

# Set environment variables
export JWT_SECRET="your-secret-key"
export APP_ENV="dev"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_USER="postgres"
export DB_PASSWORD="postgres"
export DB_NAME="restosaas"

# Run migrations
cd apps/api
go run ./cmd/migrate up

# Start API server
go run ./cmd/api
```

### Method 3: Individual App Development

**Customer App (Next.js):**

```bash
cd apps/customer
npm install
npm run dev
# Runs on http://localhost:3000
```

**Backoffice App (Vite + React):**

```bash
cd apps/backoffice
npm install
npm run dev
# Runs on http://localhost:3001
```

**API Server (Go):**

```bash
cd apps/api
go mod download
export JWT_SECRET="your-secret-key"
export APP_ENV="dev"
go run ./cmd/api
# Runs on http://localhost:8080
```

## 🧪 Testing

### Run All Tests

```bash
# Run tests for all applications
make test-all
```

### Run Specific Tests

```bash
# API tests only
make test-api

# Customer app tests only
make test-customer

# Backoffice app tests only
make test-backoffice
```

### Run Tests with Docker

```bash
docker-compose -f docker-compose.ci.yml up --build
```

## 🐳 Docker

### Development

```bash
# Start database and services
make docker-up

# Stop all services
make docker-down
```

### Production Build

```bash
# Build all applications
make build-all

# Or build individually
make build-api
make build-customer
make build-backoffice
```

## 🔧 Available Commands

### Development Commands

| Command               | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `make dev`            | Start all applications (API + Customer + Backoffice) |
| `make dev-api`        | Start API server on http://localhost:8080            |
| `make dev-customer`   | Start customer app on http://localhost:3000          |
| `make dev-backoffice` | Start backoffice app on http://localhost:3001        |
| `make install-all`    | Install all dependencies                             |

### Build Commands

| Command                 | Description            |
| ----------------------- | ---------------------- |
| `make build-all`        | Build all applications |
| `make build-api`        | Build API server       |
| `make build-customer`   | Build customer app     |
| `make build-backoffice` | Build backoffice app   |

### Testing Commands

| Command                | Description              |
| ---------------------- | ------------------------ |
| `make test-all`        | Run all tests            |
| `make test-api`        | Run API tests            |
| `make test-customer`   | Run customer app tests   |
| `make test-backoffice` | Run backoffice app tests |

### Database Commands

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `make docker-up`    | Start PostgreSQL with Docker     |
| `make docker-down`  | Stop Docker services             |
| `make migrate-up`   | Run database migrations          |
| `make migrate-down` | Rollback database migrations     |
| `make reset-db`     | Reset database (drop + recreate) |
| `make seed-db`      | Seed database with sample data   |

### Utility Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `make lint-all`   | Run linting for all apps |
| `make format-all` | Format code for all apps |
| `make clean-all`  | Clean build artifacts    |

## 🚀 CI/CD

This project includes a comprehensive GitHub Actions CI/CD pipeline that:

### On Every Push/PR:

- **API Tests**: Runs Go unit tests with PostgreSQL
- **Web Tests**: Runs TypeScript compilation and linting
- **Docker Build**: Builds and tests Docker images
- **Security Scan**: Runs Trivy vulnerability scanner
- **Database Migration Tests**: Tests database migrations
- **Integration Tests**: Tests API and web integration

### On Develop Branch:

- **Staging Deployment**: Automatically deploys to staging environment

### On Main Branch:

- **Production Deployment**: Automatically deploys to production environment

### CI Pipeline Features:

- ✅ Multi-stage testing (unit, integration, e2e)
- ✅ Docker image building and caching
- ✅ Security vulnerability scanning
- ✅ Database migration testing
- ✅ Health check validation
- ✅ Artifact storage and deployment

## 📁 Project Structure

```
restosaas/
├── apps/
│   ├── api/                    # Go API server
│   │   ├── cmd/api/           # Main application entry point
│   │   ├── internal/          # Internal packages
│   │   │   ├── auth/          # JWT authentication
│   │   │   ├── db/            # Database models & migrations
│   │   │   ├── handlers/      # HTTP handlers
│   │   │   ├── constants/     # Application constants
│   │   │   └── logger/        # Structured logging
│   │   ├── go.mod             # Go dependencies
│   │   └── go.sum
│   ├── customer/               # Next.js customer app
│   │   ├── src/
│   │   │   ├── app/           # Next.js app directory
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Utility functions
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   └── tailwind.config.ts
│   └── backoffice/             # Vite + React SPA
│       ├── src/
│       │   ├── pages/         # Page components
│       │   ├── components/    # React components
│       │   ├── stores/        # Zustand stores
│       │   ├── layouts/       # Layout components
│       │   └── lib/           # Utility functions
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.ts
├── packages/                   # Shared packages
│   ├── types/                 # TypeScript type definitions
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── api-client/            # Axios-based API client
│   │   ├── src/index.ts
│   │   └── package.json
│   └── ui/                    # Shared UI components (shadcn/ui)
│       ├── src/
│       │   ├── button.tsx
│       │   ├── input.tsx
│       │   ├── card.tsx
│       │   └── index.ts
│       ├── package.json
│       └── tailwind.preset.ts
├── infra/                     # Infrastructure configuration
│   └── docker-compose.yml     # Development environment
├── .github/workflows/         # CI/CD pipeline
├── pnpm-workspace.yaml        # pnpm workspace configuration
├── package.json               # Root package.json
├── Makefile                   # Development commands
└── README.md                  # This file
```

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with three user roles:

- **SUPER_ADMIN**: Full system access, can manage all users and organizations
- **OWNER**: Can manage their restaurant and organization (uses Backoffice app)
- **CUSTOMER**: Can make reservations and write reviews (uses Customer app)

### Application Access

- **Customer App** (Next.js): Public restaurant listings, reservations, reviews
- **Backoffice App** (Vite + React): Owner/Admin dashboard for restaurant management
- **API Server** (Go): Backend services for both applications

## 🗄️ Database Schema

Key entities:

- **Users**: User accounts with role-based access
- **Organizations**: Restaurant organizations
- **Restaurants**: Restaurant information and settings
- **Menus & Courses**: Restaurant menu management
- **Reservations**: Customer reservations
- **Reviews**: Customer reviews

## 🛠️ Development

### Adding New Features

1. **API Changes**: Add handlers in `apps/api/internal/handlers/`
2. **Database Changes**: Update models in `apps/api/internal/db/models.go`
3. **Customer App**: Add components in `apps/customer/src/components/`
4. **Backoffice App**: Add components in `apps/backoffice/src/components/`
5. **Shared Types**: Update types in `packages/types/src/index.ts`
6. **API Client**: Update client in `packages/api-client/src/index.ts`
7. **UI Components**: Add components in `packages/ui/src/`

### Code Quality

- **Go**: Uses `golangci-lint` for linting
- **TypeScript**: Uses ESLint and Prettier
- **Formatting**: Run `make format-all` before committing
- **Testing**: Ensure all tests pass with `make test-all`
- **Linting**: Run `make lint-all` to check code quality

## 📝 Environment Variables

### API Server

```bash
JWT_SECRET=your-secret-key
APP_ENV=dev
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=restosaas
```

### Customer App (.env.local)

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8080/api
```

### Backoffice App (.env)

```bash
VITE_API_BASE=http://localhost:8080/api
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key  # Optional: for future auth integration
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use:**

```bash
# Kill processes using ports 3000, 3001, 8080
lsof -ti:3000,3001,8080 | xargs kill -9

# Or restart with different ports
make dev-customer PORT=3002
make dev-backoffice PORT=3003
```

**Database Connection Issues:**

```bash
# Restart database
make docker-down
make docker-up

# Check database status
docker ps | grep postgres
```

**Dependency Issues:**

```bash
# Clean and reinstall all dependencies
make clean-all
make install-all
```

**Build Errors:**

```bash
# Clean build artifacts
make clean-all

# Rebuild packages in order
cd packages/types && npm run build
cd ../api-client && npm run build
cd ../ui && npm run build
```

### Development Tips

1. **Use pnpm**: The project is optimized for pnpm workspaces
2. **Hot Reload**: All apps support hot reload during development
3. **Shared Packages**: Changes to shared packages require rebuilding
4. **Database**: Use `make reset-db` to start fresh with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`make test-all`)
5. Run linting (`make lint-all`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@restosaas.com or create an issue in the repository.
