#!/bin/bash

# Migration script to move from old structure to new monorepo structure

echo "🚀 Starting migration to new monorepo structure..."

# Create backup of current web app
echo "📦 Creating backup of current web app..."
cp -r apps/web apps/web-backup

# Move customer-facing components to new customer app
echo "🔄 Moving customer-facing components..."

# Move restaurant pages
if [ -d "apps/web/app/r" ]; then
    echo "  - Moving restaurant pages..."
    cp -r apps/web/app/r apps/customer/src/app/
fi

# Move customer components
if [ -d "apps/web/components" ]; then
    echo "  - Moving customer components..."
    mkdir -p apps/customer/src/components
    # Copy specific customer components
    for component in restaurant-gallery restaurant-reviews restaurant-map write-review-dialog enhanced-reservation-dialog; do
        if [ -f "apps/web/components/${component}.tsx" ]; then
            cp "apps/web/components/${component}.tsx" "apps/customer/src/components/"
        fi
    done
fi

# Move owner/admin components to backoffice
echo "🔄 Moving owner/admin components..."

# Move owner dashboard components
if [ -d "apps/web/app/owner-dashboard" ]; then
    echo "  - Moving owner dashboard components..."
    mkdir -p apps/backoffice/src/pages/owner
    # Copy owner dashboard pages
    for page in dashboard restaurants menus reservations reviews; do
        if [ -f "apps/web/app/owner-dashboard/${page}/page.tsx" ]; then
            cp "apps/web/app/owner-dashboard/${page}/page.tsx" "apps/backoffice/src/pages/owner/${page}.tsx"
        fi
    done
fi

# Move super admin components
if [ -d "apps/web/app/super-admin" ]; then
    echo "  - Moving super admin components..."
    mkdir -p apps/backoffice/src/pages/admin
    # Copy super admin pages
    for page in dashboard users organizations restaurants; do
        if [ -f "apps/web/app/super-admin/${page}/page.tsx" ]; then
            cp "apps/web/app/super-admin/${page}/page.tsx" "apps/backoffice/src/pages/admin/${page}.tsx"
        fi
    done
fi

# Move shared components
echo "🔄 Moving shared components..."
if [ -d "apps/web/components" ]; then
    # Copy UI components to shared package
    for component in ui/button ui/card ui/input ui/badge ui/dialog ui/tabs ui/select ui/textarea ui/label; do
        if [ -f "apps/web/components/${component}.tsx" ]; then
            cp "apps/web/components/${component}.tsx" "packages/ui/src/"
        fi
    done
fi

# Move API utilities
echo "🔄 Moving API utilities..."
if [ -f "apps/web/lib/api.ts" ]; then
    # Extract API client logic and move to shared package
    echo "  - API client will be manually updated in shared package"
fi

# Move constants
echo "🔄 Moving constants..."
if [ -d "apps/web/lib/constants" ]; then
    # Move constants to shared types package
    echo "  - Constants will be manually updated in shared packages"
fi

# Update package.json files
echo "📝 Updating package.json files..."

# Install dependencies for new structure
echo "📦 Installing dependencies..."
cd apps/customer && npm install
cd ../backoffice && npm install
cd ../../packages/types && npm install
cd ../api-client && npm install
cd ../ui && npm install
cd ../..

echo "✅ Migration completed!"
echo ""
echo "Next steps:"
echo "1. Review the moved components and update imports"
echo "2. Update API calls to use the new shared API client"
echo "3. Test both applications"
echo "4. Remove the old web app when ready"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Backup of old web app saved in: apps/web-backup"
