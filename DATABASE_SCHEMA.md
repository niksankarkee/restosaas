# Database Schema Documentation

This document describes the current database schema and how to ensure consistency between code and database.

## Overview

The database uses PostgreSQL with GORM for ORM operations. The schema has been designed to support a multi-tenant B2B restaurant management system.

## Tables

### 1. `users`

Stores user accounts for the system.

| Column           | Type      | Constraints      | Description                                |
| ---------------- | --------- | ---------------- | ------------------------------------------ |
| `id`             | UUID      | PRIMARY KEY      | Unique user identifier                     |
| `email`          | TEXT      | UNIQUE, NOT NULL | User email address                         |
| `password`       | TEXT      |                  | Hashed password (nullable for OAuth users) |
| `display_name`   | TEXT      |                  | User's display name                        |
| `role`           | TEXT      | NOT NULL         | User role (SUPER_ADMIN, OWNER, CUSTOMER)   |
| `created_at`     | TIMESTAMP |                  | Account creation timestamp                 |
| `oauth_provider` | TEXT      |                  | OAuth provider (google, facebook, twitter) |
| `oauth_id`       | TEXT      |                  | OAuth provider's user ID                   |
| `avatar_url`     | TEXT      |                  | Profile picture URL from OAuth             |

**Indexes:**

- `idx_users_email` (UNIQUE) on `email`

### 2. `organizations`

Stores company/organization information.

| Column                | Type      | Constraints                  | Description                     |
| --------------------- | --------- | ---------------------------- | ------------------------------- |
| `id`                  | UUID      | PRIMARY KEY                  | Unique organization identifier  |
| `name`                | TEXT      | NOT NULL                     | Organization name               |
| `subscription_status` | TEXT      | NOT NULL, DEFAULT 'INACTIVE' | Subscription status             |
| `created_at`          | TIMESTAMP |                              | Organization creation timestamp |

### 3. `org_members`

Junction table linking users to organizations.

| Column    | Type | Constraints  | Description                   |
| --------- | ---- | ------------ | ----------------------------- |
| `id`      | UUID | PRIMARY KEY  | Unique membership identifier  |
| `user_id` | UUID | NOT NULL, FK | Reference to users.id         |
| `org_id`  | UUID | NOT NULL, FK | Reference to organizations.id |
| `role`    | TEXT | NOT NULL     | Role within the organization  |

**Indexes:**

- `idx_org_members_user_id` on `user_id`
- `idx_org_members_org_id` on `org_id`

**Foreign Keys:**

- `fk_org_members_user` → `users(id)` ON DELETE CASCADE
- `fk_organizations_users` → `organizations(id)` ON DELETE CASCADE

### 4. `restaurants`

Stores restaurant information.

| Column          | Type      | Constraints                        | Description                        |
| --------------- | --------- | ---------------------------------- | ---------------------------------- |
| `id`            | UUID      | PRIMARY KEY                        | Unique restaurant identifier       |
| `org_id`        | UUID      | NOT NULL, FK                       | Reference to organizations.id      |
| `slug`          | TEXT      | UNIQUE, NOT NULL                   | URL-friendly restaurant identifier |
| `name`          | TEXT      | NOT NULL                           | Restaurant name                    |
| `slogan`        | TEXT      | NOT NULL                           | Restaurant slogan                  |
| `place`         | TEXT      | NOT NULL                           | City or location                   |
| `genre`         | TEXT      | NOT NULL                           | Cuisine type                       |
| `budget`        | TEXT      | NOT NULL                           | Price range (e.g., "500-1500")     |
| `title`         | TEXT      | NOT NULL                           | Restaurant title                   |
| `description`   | TEXT      |                                    | Restaurant description             |
| `area`          | TEXT      |                                    | Area within the place              |
| `address`       | TEXT      |                                    | Full address                       |
| `phone`         | TEXT      |                                    | Contact phone                      |
| `timezone`      | TEXT      | NOT NULL, DEFAULT 'Asia/Kathmandu' | Restaurant timezone                |
| `capacity`      | BIGINT    | NOT NULL, DEFAULT 30               | Maximum capacity                   |
| `is_open`       | BOOLEAN   | NOT NULL, DEFAULT true             | Whether restaurant is open         |
| `main_image_id` | UUID      |                                    | Reference to main image            |
| `created_at`    | TIMESTAMP |                                    | Restaurant creation timestamp      |
| `updated_at`    | TIMESTAMP |                                    | Last update timestamp              |

**Indexes:**

- `idx_restaurants_slug` (UNIQUE) on `slug`
- `idx_restaurants_org_id` on `org_id`
- `idx_restaurants_place` on `place`
- `idx_restaurants_genre` on `genre`
- `idx_restaurants_area` on `area`

**Foreign Keys:**

- `fk_organizations_restaurant` → `organizations(id)` ON DELETE CASCADE

### 5. `images`

Stores restaurant images.

| Column          | Type    | Constraints             | Description                    |
| --------------- | ------- | ----------------------- | ------------------------------ |
| `id`            | UUID    | PRIMARY KEY             | Unique image identifier        |
| `restaurant_id` | UUID    | NOT NULL, FK            | Reference to restaurants.id    |
| `url`           | TEXT    | NOT NULL                | Image URL                      |
| `alt`           | TEXT    |                         | Alt text for accessibility     |
| `is_main`       | BOOLEAN | NOT NULL, DEFAULT false | Whether this is the main image |
| `display_order` | BIGINT  | NOT NULL, DEFAULT 0     | Order for gallery display      |

**Indexes:**

- `idx_images_restaurant_id` on `restaurant_id`
- `idx_images_restaurant_main` (UNIQUE) on `restaurant_id` WHERE `is_main = true`

**Foreign Keys:**

- `fk_restaurants_images` → `restaurants(id)` ON DELETE CASCADE

### 6. `opening_hours`

Stores restaurant opening hours.

| Column          | Type    | Constraints             | Description                        |
| --------------- | ------- | ----------------------- | ---------------------------------- |
| `id`            | UUID    | PRIMARY KEY             | Unique opening hour identifier     |
| `restaurant_id` | UUID    | NOT NULL, FK            | Reference to restaurants.id        |
| `weekday`       | INTEGER | NOT NULL                | Day of week (0=Sunday, 6=Saturday) |
| `open_time`     | TEXT    | NOT NULL                | Opening time (HH:MM format)        |
| `close_time`    | TEXT    | NOT NULL                | Closing time (HH:MM format)        |
| `is_closed`     | BOOLEAN | NOT NULL, DEFAULT false | Whether closed on this day         |

**Foreign Keys:**

- `fk_restaurants_open_hours` → `restaurants(id)` ON DELETE CASCADE

### 7. `menus`

Stores menu items.

| Column          | Type      | Constraints  | Description                     |
| --------------- | --------- | ------------ | ------------------------------- |
| `id`            | UUID      | PRIMARY KEY  | Unique menu item identifier     |
| `restaurant_id` | UUID      | NOT NULL, FK | Reference to restaurants.id     |
| `name`          | TEXT      | NOT NULL     | Menu item name                  |
| `short_desc`    | TEXT      |              | Short description               |
| `image_url`     | TEXT      |              | Image URL                       |
| `price`         | INTEGER   | NOT NULL     | Price in cents                  |
| `type`          | TEXT      | NOT NULL     | Item type (DRINK, FOOD)         |
| `meal_type`     | TEXT      | NOT NULL     | Meal type (LUNCH, DINNER, BOTH) |
| `created_at`    | TIMESTAMP |              | Creation timestamp              |
| `updated_at`    | TIMESTAMP |              | Last update timestamp           |

### 8. `courses`

Stores course/package information.

| Column            | Type      | Constraints         | Description                      |
| ----------------- | --------- | ------------------- | -------------------------------- |
| `id`              | UUID      | PRIMARY KEY         | Unique course identifier         |
| `restaurant_id`   | UUID      | NOT NULL, FK        | Reference to restaurants.id      |
| `title`           | TEXT      | NOT NULL            | Course title                     |
| `description`     | TEXT      |                     | Course description               |
| `image_url`       | TEXT      |                     | Image URL                        |
| `course_price`    | INTEGER   | NOT NULL            | Current price in cents           |
| `original_price`  | INTEGER   |                     | Original price for strikethrough |
| `number_of_items` | INTEGER   | NOT NULL, DEFAULT 1 | Number of items in course        |
| `stay_time`       | INTEGER   | NOT NULL            | Stay time in minutes             |
| `course_content`  | TEXT      |                     | Rich text content                |
| `precautions`     | TEXT      |                     | Precautions and notes            |
| `created_at`      | TIMESTAMP |                     | Creation timestamp               |
| `updated_at`      | TIMESTAMP |                     | Last update timestamp            |

### 9. `customers`

Stores customer information.

| Column       | Type      | Constraints | Description                |
| ------------ | --------- | ----------- | -------------------------- |
| `id`         | UUID      | PRIMARY KEY | Unique customer identifier |
| `email`      | TEXT      |             | Customer email             |
| `phone`      | TEXT      |             | Customer phone             |
| `name`       | TEXT      |             | Customer name              |
| `created_at` | TIMESTAMP |             | Creation timestamp         |

**Indexes:**

- `idx_customers_email` on `email`
- `idx_customers_phone` on `phone`

### 10. `reservations`

Stores reservation information.

| Column          | Type      | Constraints                 | Description                        |
| --------------- | --------- | --------------------------- | ---------------------------------- |
| `id`            | UUID      | PRIMARY KEY                 | Unique reservation identifier      |
| `restaurant_id` | UUID      | NOT NULL, FK                | Reference to restaurants.id        |
| `customer_id`   | UUID      | FK                          | Reference to customers.id          |
| `course_id`     | UUID      | FK                          | Reference to courses.id (optional) |
| `starts_at`     | TIMESTAMP | NOT NULL                    | Reservation start time             |
| `duration_min`  | INTEGER   | NOT NULL, DEFAULT 90        | Duration in minutes                |
| `party_size`    | INTEGER   | NOT NULL                    | Number of people                   |
| `status`        | TEXT      | NOT NULL, DEFAULT 'PENDING' | Reservation status                 |
| `created_at`    | TIMESTAMP |                             | Creation timestamp                 |

**Indexes:**

- `idx_reservations_restaurant_id` on `restaurant_id`
- `idx_reservations_customer_id` on `customer_id`
- `idx_reservations_course_id` on `course_id`
- `idx_reservations_starts_at` on `starts_at`

### 11. `reviews`

Stores customer reviews.

| Column          | Type      | Constraints             | Description                 |
| --------------- | --------- | ----------------------- | --------------------------- |
| `id`            | UUID      | PRIMARY KEY             | Unique review identifier    |
| `restaurant_id` | UUID      | NOT NULL, FK            | Reference to restaurants.id |
| `customer_id`   | UUID      | FK                      | Reference to customers.id   |
| `customer_name` | TEXT      |                         | Customer name for display   |
| `rating`        | INTEGER   | NOT NULL                | Rating (1-5 stars)          |
| `title`         | TEXT      |                         | Review title                |
| `comment`       | TEXT      |                         | Review comment              |
| `is_approved`   | BOOLEAN   | NOT NULL, DEFAULT false | Whether review is approved  |
| `created_at`    | TIMESTAMP |                         | Creation timestamp          |
| `updated_at`    | TIMESTAMP |                         | Last update timestamp       |

**Indexes:**

- `idx_reviews_restaurant_id` on `restaurant_id`
- `idx_reviews_customer_id` on `customer_id`

### 12. `landing_pages`

Stores landing page content.

| Column       | Type      | Constraints      | Description                  |
| ------------ | --------- | ---------------- | ---------------------------- |
| `id`         | UUID      | PRIMARY KEY      | Unique page identifier       |
| `slug`       | TEXT      | UNIQUE, NOT NULL | URL-friendly page identifier |
| `title`      | TEXT      |                  | Page title                   |
| `body_md`    | TEXT      |                  | Markdown content             |
| `published`  | BOOLEAN   |                  | Whether page is published    |
| `created_at` | TIMESTAMP |                  | Creation timestamp           |
| `updated_at` | TIMESTAMP |                  | Last update timestamp        |

**Indexes:**

- `idx_landing_pages_slug` (UNIQUE) on `slug`
- `idx_landing_pages_published` on `published`

## Migration System

The database uses a hybrid approach:

1. **GORM AutoMigrate**: Creates tables and basic structure
2. **Custom Migrations**: Adds indexes, constraints, and columns that GORM might miss

### Running Migrations

```bash
# Reset database completely (recommended for development)
make reset-db

# Or manually
./scripts/reset-database.sh
```

### Migration Files

- `apps/api/internal/db/models.go`: GORM model definitions
- `apps/api/internal/db/migrations.go`: Custom migration logic
- `apps/api/internal/server/server.go`: Migration execution

## Data Types

- **UUIDs**: Used for all primary keys
- **Timestamps**: `timestamp with time zone`
- **Text**: Used for most string fields
- **Integers**: Used for counts, ratings, and prices (in cents)
- **Booleans**: Used for flags and status fields

## Constraints

- **Cascade Deletes**: All foreign keys use `ON DELETE CASCADE`
- **Unique Constraints**: Applied to slugs, emails, and main images
- **Indexes**: Applied to frequently queried columns
- **Check Constraints**: Applied where appropriate (e.g., rating 1-5)

## Multi-Tenancy

The system supports multi-tenancy through:

1. **Organization-based isolation**: All restaurants belong to organizations
2. **User-organization mapping**: Users are linked to organizations via `org_members`
3. **Data filtering**: All queries filter by organization membership
4. **Role-based access**: Different permissions for SUPER_ADMIN, OWNER, and CUSTOMER

## Backup and Recovery

```bash
# Backup database
docker exec restosaas_db pg_dump -U postgres restosaas > backup.sql

# Restore database
docker exec -i restosaas_db psql -U postgres restosaas < backup.sql
```

## Troubleshooting

### Schema Mismatch

If you encounter schema mismatches:

1. Run `make reset-db` to reset the database
2. Check that all migrations are applied correctly
3. Verify that GORM models match the actual database structure

### Missing Columns

If columns are missing:

1. Add them to the GORM model
2. Add a migration in `migrations.go`
3. Run `make reset-db`

### Foreign Key Issues

If foreign key constraints are missing:

1. Check the migration in `migrations.go`
2. Verify the constraint name matches the database
3. Run `make reset-db`
