#!/bin/bash

# Simple RestoSaaS Database Seeding Script
# This script creates sample data without user creation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Starting simple database seeding...${NC}"

# Create organization first
echo -e "${BLUE}🏢 Creating organization...${NC}"

docker exec restosaas_db psql -U postgres -d restosaas -c "
INSERT INTO organizations (id, name, subscription_status, created_at)
VALUES (
    gen_random_uuid(),
    'Golden Spoon Organization',
    'ACTIVE',
    NOW()
);
"

# Get the organization ID
ORG_ID=$(docker exec restosaas_db psql -U postgres -d restosaas -t -c "SELECT id FROM organizations WHERE name = 'Golden Spoon Organization';" | head -1 | tr -d ' \n\r')

echo -e "${BLUE}🏢 Creating restaurant...${NC}"

docker exec restosaas_db psql -U postgres -d restosaas -c "
INSERT INTO restaurants (id, org_id, slug, name, slogan, place, genre, budget, title, description, address, phone, timezone, capacity, is_open, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '$ORG_ID',
    'the-golden-spoon',
    'The Golden Spoon',
    'Where flavors come alive',
    'Kathmandu',
    'Nepali',
    '500-1500',
    'Authentic Nepali Cuisine',
    'Experience the rich flavors of traditional Nepali cuisine in a warm and welcoming atmosphere.',
    'Thamel, Kathmandu 44600, Nepal',
    '+977-1-1234567',
    'Asia/Kathmandu',
    50,
    true,
    NOW(),
    NOW()
);
"

echo -e "${GREEN}✅ Restaurant created successfully!${NC}"

echo -e "${BLUE}🕒 Setting opening hours...${NC}"

# Get the restaurant ID
RESTAURANT_ID=$(docker exec restosaas_db psql -U postgres -d restosaas -t -c "SELECT id FROM restaurants WHERE slug = 'the-golden-spoon';" | head -1 | tr -d ' \n\r')

# Set opening hours
docker exec restosaas_db psql -U postgres -d restosaas -c "
INSERT INTO opening_hours (id, restaurant_id, weekday, open_time, close_time, is_closed)
VALUES 
    (gen_random_uuid(), '$RESTAURANT_ID', 1, '09:00', '22:00', false),
    (gen_random_uuid(), '$RESTAURANT_ID', 2, '09:00', '22:00', false),
    (gen_random_uuid(), '$RESTAURANT_ID', 3, '09:00', '22:00', false),
    (gen_random_uuid(), '$RESTAURANT_ID', 4, '09:00', '22:00', false),
    (gen_random_uuid(), '$RESTAURANT_ID', 5, '09:00', '23:00', false),
    (gen_random_uuid(), '$RESTAURANT_ID', 6, '09:00', '23:00', false),
    (gen_random_uuid(), '$RESTAURANT_ID', 0, '10:00', '21:00', false);
"

echo -e "${GREEN}✅ Opening hours set successfully!${NC}"

echo -e "${BLUE}🍽️ Creating menu items...${NC}"

# Create Menu Items
docker exec restosaas_db psql -U postgres -d restosaas -c "
INSERT INTO menus (id, restaurant_id, name, short_desc, image_url, price, type, meal_type, created_at, updated_at)
VALUES 
    (gen_random_uuid(), '$RESTAURANT_ID', 'Momo (Steamed)', 'Traditional Nepali dumplings with meat filling', 'https://images.unsplash.com/photo-1563379091339-03246963d4d8?w=500&h=300&fit=crop', 25000, 'FOOD', 'BOTH', NOW(), NOW()),
    (gen_random_uuid(), '$RESTAURANT_ID', 'Dal Bhat', 'Traditional Nepali rice with lentil soup', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=300&fit=crop', 30000, 'FOOD', 'LUNCH', NOW(), NOW()),
    (gen_random_uuid(), '$RESTAURANT_ID', 'Nepali Tea', 'Traditional spiced milk tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=300&fit=crop', 5000, 'DRINK', 'BOTH', NOW(), NOW());
"

echo -e "${GREEN}✅ Menu items created successfully!${NC}"

echo -e "${BLUE}🎓 Creating courses...${NC}"

# Create Courses
docker exec restosaas_db psql -U postgres -d restosaas -c "
INSERT INTO courses (id, restaurant_id, title, description, image_url, course_price, original_price, number_of_items, stay_time, course_content, precautions, created_at, updated_at)
VALUES 
    (gen_random_uuid(), '$RESTAURANT_ID', 'Nepali Culinary Journey', 'A complete journey through traditional Nepali cuisine', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop', 150000, 200000, 8, 120, '<h2>Course Overview</h2><p>Experience the authentic flavors of Nepal through this comprehensive culinary journey.</p>', 'Please inform us of any food allergies. Vegetarian options available.', NOW(), NOW()),
    (gen_random_uuid(), '$RESTAURANT_ID', 'Momo Masterclass', 'Learn to make perfect momos from scratch', 'https://images.unsplash.com/photo-1563379091339-03246963d4d8?w=500&h=300&fit=crop', 120000, NULL, 5, 90, '<h2>Momo Masterclass</h2><p>Master the art of making perfect momos with our expert chefs.</p>', 'Hands-on cooking class. Aprons provided. Please wash hands before starting.', NOW(), NOW()),
    (gen_random_uuid(), '$RESTAURANT_ID', 'Spice Workshop', 'Understanding and using Nepali spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=300&fit=crop', 80000, NULL, 3, 60, '<h2>Spice Workshop</h2><p>Discover the secrets of Nepali spice blends and their uses.</p>', 'Some spices may cause mild irritation. Hand washing facilities available.', NOW(), NOW());
"

echo -e "${GREEN}✅ Courses created successfully!${NC}"

echo -e "${GREEN}🎉 Simple database seeding completed successfully!${NC}"
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
