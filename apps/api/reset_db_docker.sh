#!/bin/bash

# Script to reset the database using Docker
echo "Resetting database using Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if the database container is running
if ! docker ps | grep -q postgres; then
    echo "PostgreSQL container is not running. Please start it first with:"
    echo "docker-compose up -d postgres"
    exit 1
fi

# Reset the database
echo "Dropping and recreating database..."
docker exec -it restosaas_db psql -U postgres -c "DROP SCHEMA public CASCADE;"
docker exec -it restosaas_db psql -U postgres -c "CREATE SCHEMA public;"
docker exec -it restosaas_db psql -U postgres -c "GRANT ALL ON SCHEMA public TO postgres;"
docker exec -it restosaas_db psql -U postgres -c "GRANT ALL ON SCHEMA public TO public;"

echo "Database reset complete. You can now run 'make run' again."
