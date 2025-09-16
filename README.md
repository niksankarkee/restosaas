# RestoSaaS

A comprehensive restaurant management SaaS platform built with Go, Next.js, and PostgreSQL.

## 🏗️ Architecture

- **Backend API**: Go with Gin framework
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: PostgreSQL
- **Authentication**: JWT-based with role-based access control
- **Containerization**: Docker and Docker Compose

## 🚀 Quick Start

### Prerequisites

- Go 1.24.0+
- Node.js 18+
- PostgreSQL 15+
- Docker and Docker Compose

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd restosaas
   ```

2. **Start the development environment**

   ```bash
   make setup
   ```

   This will:

   - Install all dependencies
   - Start PostgreSQL and pgAdmin with Docker
   - Set up the development environment

3. **Start the services**

   ```bash
   # Start API server
   make api

   # In another terminal, start web server
   make web
   ```

4. **Access the application**
   - API: http://localhost:8080
   - Web: http://localhost:3000
   - Database: localhost:5432
   - pgAdmin: http://localhost:5050

### Manual Setup

If you prefer to set up manually:

1. **Start the database**

   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

2. **Install dependencies**

   ```bash
   # API dependencies
   cd apps/api
   go mod download

   # Web dependencies
   cd ../web
   npm install
   ```

3. **Start the API server**

   ```bash
   cd apps/api
   export JWT_SECRET="your-secret-key"
   export APP_ENV="dev"
   go run ./cmd/api
   ```

4. **Start the web server**
   ```bash
   cd apps/web
   npm run dev
   ```

## 🧪 Testing

### Run all tests

```bash
make test
```

### Run specific tests

```bash
# API tests only
make test-api

# Web tests only
make test-web
```

### Run tests with Docker

```bash
docker-compose -f docker-compose.ci.yml up --build
```

## 🐳 Docker

### Development

```bash
# Start all services
make docker-up

# Stop all services
make docker-down
```

### Production Build

```bash
# Build API image
cd apps/api
docker build -t restosaas-api .

# Build web image
cd apps/web
docker build -t restosaas-web .
```

## 🔧 Available Commands

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `make dev`         | Start development environment      |
| `make api`         | Start API server                   |
| `make web`         | Start web server                   |
| `make build`       | Build all services                 |
| `make test`        | Run all tests                      |
| `make test-api`    | Run API tests                      |
| `make test-web`    | Run web tests                      |
| `make clean`       | Clean build artifacts              |
| `make docker-up`   | Start services with Docker Compose |
| `make docker-down` | Stop services with Docker Compose  |
| `make lint`        | Run linting                        |
| `make format`      | Format code                        |

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
│   ├── api/                 # Go API server
│   │   ├── cmd/api/        # Main application entry point
│   │   ├── internal/       # Internal packages
│   │   │   ├── auth/       # JWT authentication
│   │   │   ├── db/         # Database models
│   │   │   ├── handlers/   # HTTP handlers
│   │   │   └── server/     # Server configuration
│   │   ├── Dockerfile      # API Docker configuration
│   │   └── go.mod          # Go dependencies
│   └── web/                # Next.js web application
│       ├── app/            # Next.js app directory
│       ├── components/     # React components
│       ├── lib/            # Utility functions
│       ├── Dockerfile      # Web Docker configuration
│       └── package.json    # Node.js dependencies
├── infra/                  # Infrastructure configuration
│   └── docker-compose.yml  # Development environment
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline
├── docker-compose.ci.yml   # CI testing environment
├── Makefile               # Development commands
└── README.md              # This file
```

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with three user roles:

- **SUPER_ADMIN**: Full system access, can manage all users and organizations
- **OWNER**: Can manage their restaurant and organization
- **CUSTOMER**: Can make reservations and write reviews

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
3. **Frontend Changes**: Add components in `apps/web/components/`
4. **Routes**: Update router in `apps/api/internal/server/router.go`

### Code Quality

- **Go**: Uses `golangci-lint` for linting
- **TypeScript**: Uses ESLint and Prettier
- **Formatting**: Run `make format` before committing
- **Testing**: Ensure all tests pass with `make test`

## 📝 Environment Variables

### API (.env)

```bash
JWT_SECRET=your-secret-key
APP_ENV=dev
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=restosaas
```

### Web (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@restosaas.com or create an issue in the repository.
