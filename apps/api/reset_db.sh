#!/bin/bash

# Script to reset the database and fix UUID issues
echo "Resetting database to fix UUID issues..."

# Get database URL from environment or use default
DB_URL=${DATABASE_URL:-"postgres://postgres:password@localhost:5432/restosaas?sslmode=disable"}

# Drop and recreate the database
echo "Dropping and recreating database..."
psql "$DB_URL" -c "DROP SCHEMA public CASCADE;"
psql "$DB_URL" -c "CREATE SCHEMA public;"
psql "$DB_URL" -c "GRANT ALL ON SCHEMA public TO postgres;"
psql "$DB_URL" -c "GRANT ALL ON SCHEMA public TO public;"

echo "Database reset complete. You can now run 'make run' again."
