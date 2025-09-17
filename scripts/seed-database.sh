#!/bin/bash

# RestoSaaS Database Seeding Script
# This script creates sample data using the simple-seed.sh approach

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Starting database seeding...${NC}"

# Run the simple seed script
echo -e "${BLUE}📦 Running simple-seed.sh...${NC}"
cd "$(dirname "$0")"
chmod +x simple-seed.sh
./simple-seed.sh

echo -e "${GREEN}🎉 Database seeding completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  🏢 Restaurant created: 1 (The Golden Spoon)"
echo -e "  🍽️ Menu items created: 3"
echo -e "  🎓 Courses created: 3"
echo -e "  🕒 Opening hours set: 7 days"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "  API: http://localhost:8080"
echo -e "  Web: http://localhost:3000"
echo -e "  Restaurant: http://localhost:3000/r/the-golden-spoon"
