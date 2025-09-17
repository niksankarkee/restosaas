package db

import (
	"fmt"

	"github.com/example/restosaas/apps/api/internal/logger"
	"gorm.io/gorm"
)

// RunMigrations runs all database migrations to ensure schema consistency
func RunMigrations(db *gorm.DB) error {
	logger.Info("RunMigrations: Starting database migrations")

	// First run GORM AutoMigrate
	if err := AutoMigrate(db); err != nil {
		logger.Errorf("RunMigrations: Failed to run GORM AutoMigrate - %v", err)
		return fmt.Errorf("failed to run auto migration: %w", err)
	}

	logger.Info("RunMigrations: GORM AutoMigrate completed successfully")

	// Then run custom migrations to match the current database state
	if err := runCustomMigrations(db); err != nil {
		logger.Errorf("RunMigrations: Failed to run custom migrations - %v", err)
		return fmt.Errorf("failed to run custom migrations: %w", err)
	}

	logger.Info("RunMigrations: All database migrations completed successfully")
	return nil
}

// runCustomMigrations runs custom SQL migrations to match the current database state
func runCustomMigrations(db *gorm.DB) error {
	migrations := []struct {
		name        string
		query       string
		checkQuery  string
		description string
	}{
		{
			name:        "add_area_column_to_restaurants",
			query:       `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS area TEXT`,
			checkQuery:  `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'area'`,
			description: "Add area column to restaurants table",
		},
		{
			name:        "add_area_index_to_restaurants",
			query:       `CREATE INDEX IF NOT EXISTS idx_restaurants_area ON restaurants(area)`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'restaurants' AND indexname = 'idx_restaurants_area'`,
			description: "Add index on area column",
		},
		{
			name:        "add_org_id_index_to_restaurants",
			query:       `CREATE INDEX IF NOT EXISTS idx_restaurants_org_id ON restaurants(org_id)`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'restaurants' AND indexname = 'idx_restaurants_org_id'`,
			description: "Add index on org_id column",
		},
		{
			name:        "add_place_index_to_restaurants",
			query:       `CREATE INDEX IF NOT EXISTS idx_restaurants_place ON restaurants(place)`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'restaurants' AND indexname = 'idx_restaurants_place'`,
			description: "Add index on place column",
		},
		{
			name:        "add_genre_index_to_restaurants",
			query:       `CREATE INDEX IF NOT EXISTS idx_restaurants_genre ON restaurants(genre)`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'restaurants' AND indexname = 'idx_restaurants_genre'`,
			description: "Add index on genre column",
		},
		{
			name:        "add_restaurant_id_index_to_images",
			query:       `CREATE INDEX IF NOT EXISTS idx_images_restaurant_id ON images(restaurant_id)`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'images' AND indexname = 'idx_images_restaurant_id'`,
			description: "Add index on restaurant_id in images table",
		},
		{
			name:        "add_unique_constraint_is_main_images",
			query:       `CREATE UNIQUE INDEX IF NOT EXISTS idx_images_restaurant_main ON images(restaurant_id) WHERE is_main = true`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'images' AND indexname = 'idx_images_restaurant_main'`,
			description: "Add unique constraint for main image per restaurant",
		},
		{
			name:        "add_org_id_index_to_org_members",
			query:       `CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(org_id)`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'org_members' AND indexname = 'idx_org_members_org_id'`,
			description: "Add index on org_id in org_members table",
		},
		{
			name:        "add_user_id_index_to_org_members",
			query:       `CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id)`,
			checkQuery:  `SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'org_members' AND indexname = 'idx_org_members_user_id'`,
			description: "Add index on user_id in org_members table",
		},
		{
			name:        "add_foreign_key_org_members_user",
			query:       `ALTER TABLE org_members ADD CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`,
			checkQuery:  `SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_org_members_user'`,
			description: "Add foreign key constraint for user_id in org_members",
		},
		{
			name:        "add_foreign_key_org_members_org",
			query:       `ALTER TABLE org_members ADD CONSTRAINT fk_organizations_users FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE`,
			checkQuery:  `SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_organizations_users'`,
			description: "Add foreign key constraint for org_id in org_members",
		},
		{
			name:        "add_foreign_key_restaurants_org",
			query:       `ALTER TABLE restaurants ADD CONSTRAINT fk_organizations_restaurant FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE`,
			checkQuery:  `SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_organizations_restaurant'`,
			description: "Add foreign key constraint for org_id in restaurants",
		},
		{
			name:        "add_foreign_key_images_restaurant",
			query:       `ALTER TABLE images ADD CONSTRAINT fk_restaurants_images FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE`,
			checkQuery:  `SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_restaurants_images'`,
			description: "Add foreign key constraint for restaurant_id in images",
		},
		{
			name:        "add_foreign_key_opening_hours_restaurant",
			query:       `ALTER TABLE opening_hours ADD CONSTRAINT fk_restaurants_open_hours FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE`,
			checkQuery:  `SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_restaurants_open_hours'`,
			description: "Add foreign key constraint for restaurant_id in opening_hours",
		},
	}

	for _, migration := range migrations {
		logger.Debugf("runCustomMigrations: Running migration %s - %s", migration.name, migration.description)
		if err := runMigration(db, migration); err != nil {
			logger.Errorf("runCustomMigrations: Failed to run migration %s - %v", migration.name, err)
			return fmt.Errorf("failed to run migration %s: %w", migration.name, err)
		}
		logger.Debugf("runCustomMigrations: Successfully completed migration %s", migration.name)
	}

	logger.Info("runCustomMigrations: All custom migrations completed successfully")
	return nil
}

// runMigration runs a single migration if it hasn't been applied yet
func runMigration(db *gorm.DB, migration struct {
	name        string
	query       string
	checkQuery  string
	description string
}) error {
	// Check if migration is already applied
	var count int64
	if err := db.Raw(migration.checkQuery).Scan(&count).Error; err != nil {
		logger.Errorf("runMigration: Failed to check migration status for %s - %v", migration.name, err)
		return fmt.Errorf("failed to check migration status: %w", err)
	}

	// If count > 0, migration is already applied
	if count > 0 {
		logger.Debugf("runMigration: Migration %s already applied, skipping", migration.name)
		return nil
	}

	// Run the migration
	logger.Debugf("runMigration: Executing migration %s", migration.name)
	if err := db.Exec(migration.query).Error; err != nil {
		logger.Errorf("runMigration: Failed to execute migration %s - %v", migration.name, err)
		return fmt.Errorf("failed to execute migration query: %w", err)
	}

	logger.Debugf("runMigration: Successfully executed migration %s", migration.name)
	return nil
}
