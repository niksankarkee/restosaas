-- Migration script to fix UUID type issues
-- Run this if you encounter foreign key constraint errors

-- First, drop foreign key constraints
ALTER TABLE org_members DROP CONSTRAINT IF EXISTS fk_org_members_user;
ALTER TABLE org_members DROP CONSTRAINT IF EXISTS fk_org_members_org;
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS fk_restaurants_org;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS fk_reservations_restaurant;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_restaurant;

-- Convert text columns to UUID
ALTER TABLE org_members ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE org_members ALTER COLUMN org_id TYPE uuid USING org_id::uuid;
ALTER TABLE restaurants ALTER COLUMN org_id TYPE uuid USING org_id::uuid;
ALTER TABLE reservations ALTER COLUMN restaurant_id TYPE uuid USING restaurant_id::uuid;
ALTER TABLE reservations ALTER COLUMN customer_id TYPE uuid USING customer_id::uuid;
ALTER TABLE reviews ALTER COLUMN restaurant_id TYPE uuid USING restaurant_id::uuid;
ALTER TABLE reviews ALTER COLUMN customer_id TYPE uuid USING customer_id::uuid;

-- Recreate foreign key constraints
ALTER TABLE org_members ADD CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE org_members ADD CONSTRAINT fk_org_members_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restaurants ADD CONSTRAINT fk_restaurants_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE reservations ADD CONSTRAINT fk_reservations_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;
