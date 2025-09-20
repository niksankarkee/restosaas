# RestoSaaS Migration Guide

## What We've Accomplished

### ✅ New Monorepo Structure Created

- **Customer App**: Next.js 14 with App Router for customer-facing features
- **Backoffice App**: Vite + React SPA for owner/admin interfaces
- **Shared Packages**: Types, API client, and UI components

### ✅ Technology Stack Implemented

- **Customer**: Next.js + Tailwind CSS + shadcn/ui
- **Backoffice**: Vite + React + TanStack Query + Zustand + React Hook Form + Zod
- **Shared**: TypeScript types, Axios API client, shadcn/ui components

### ✅ Basic Structure Setup

- Package.json files with correct dependencies
- TypeScript configurations
- Tailwind CSS configurations
- Basic routing and layouts
- Authentication store with Zustand
- API client with auth handling

## What Needs to Be Done Next

### 1. Complete Component Migration

```bash
# Run the migration script
./migrate-to-new-structure.sh
```

### 2. Update Imports and Dependencies

- Update all import statements to use new package structure
- Fix any missing dependencies
- Update API calls to use shared API client

### 3. Implement Missing Features

#### Customer App (Next.js)

- [ ] Restaurant listing with search and filters
- [ ] Restaurant detail pages with menus and courses
- [ ] Reservation booking system
- [ ] Review system
- [ ] User authentication (if needed)

#### Backoffice App (Vite React)

- [ ] Complete owner dashboard with charts
- [ ] Restaurant management (CRUD)
- [ ] Menu and course management
- [ ] Reservation management with calendar
- [ ] Review moderation
- [ ] Super admin features (users, organizations)

### 4. Environment Setup

Create environment files:

**apps/backoffice/.env.local**

```env
VITE_API_BASE=http://localhost:8080/api
```

**apps/customer/.env.local**

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080/api
```

### 5. Testing and Validation

- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Test responsive design
- [ ] Validate form submissions
- [ ] Test error handling

## Quick Start

### 1. Setup

```bash
# Install all dependencies
make install-all

# Or use the setup script
./setup-new-structure.sh
```

### 2. Development

```bash
# Start all services
make dev

# Or start individually
make dev-customer    # :3000
make dev-backoffice  # :3001
make dev-api         # :8080
```

### 3. Migration

```bash
# Run migration script
make migrate
```

## Key Benefits of New Structure

### Performance

- **Customer App**: SSR for better SEO and initial load
- **Backoffice App**: SPA for better interactivity and state management

### Developer Experience

- **Modern Tooling**: Vite for fast builds, TanStack Query for server state
- **Type Safety**: Shared TypeScript types across apps
- **Consistent Patterns**: Shared UI components and API client

### Scalability

- **Clear Separation**: Customer vs admin concerns
- **Shared Packages**: Reusable code across applications
- **Independent Deployment**: Each app can be deployed separately

## File Structure Overview

```
restosaas/
├── apps/
│   ├── customer/           # Next.js customer app
│   ├── backoffice/         # Vite React admin app
│   └── api/               # Go API (unchanged)
├── packages/
│   ├── types/             # Shared TypeScript types
│   ├── api-client/        # Shared API client
│   └── ui/               # Shared UI components
├── Makefile.new          # New Makefile
├── setup-new-structure.sh # Setup script
└── migrate-to-new-structure.sh # Migration script
```

## Next Steps

1. **Run the migration script** to move existing components
2. **Update imports** to use new package structure
3. **Implement missing features** based on requirements
4. **Test thoroughly** before removing old structure
5. **Update deployment** scripts for new structure

The new structure provides a solid foundation for scaling the application while maintaining good developer experience and performance.
