package db

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DatabaseType represents the type of database being used
type DatabaseType string

const (
	PostgreSQL DatabaseType = "postgres"
)

// GetUUIDType returns the appropriate GORM type for UUID based on database type
func GetUUIDType(dbType DatabaseType) string {
	switch dbType {
	case PostgreSQL:
		return "uuid"
	default:
		return "uuid"
	}
}

type Role string

const (
	RoleSuper    Role = "SUPER_ADMIN"
	RoleOwner    Role = "OWNER"
	RoleCustomer Role = "CUSTOMER"
)

type OAuthProvider string

const (
	OAuthGoogle   OAuthProvider = "google"
	OAuthFacebook OAuthProvider = "facebook"
	OAuthTwitter  OAuthProvider = "twitter"
)

type User struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Email       string    `gorm:"uniqueIndex;not null"`
	Password    string
	DisplayName string
	Role        Role `gorm:"type:text;not null"`
	CreatedAt   time.Time
	// OAuth fields
	OAuthProvider string `gorm:"column:oauth_provider"` // google, facebook, twitter
	OAuthID       string `gorm:"column:oauth_id"`       // OAuth provider's user ID
	AvatarURL     string `gorm:"column:avatar_url"`     // Profile picture from OAuth
}

// TableName explicitly sets the table name for GORM
func (User) TableName() string {
	return "users"
}

type Organization struct {
	ID                 uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name               string    `gorm:"not null"`
	SubscriptionStatus string    `gorm:"not null;default:INACTIVE"`
	CreatedAt          time.Time
	// Foreign key relationships will be added manually after migration
}

type OrgMember struct {
	ID     uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID uuid.UUID `gorm:"type:uuid;index;not null"`
	OrgID  uuid.UUID `gorm:"type:uuid;index;not null"`
	Role   Role      `gorm:"type:text;not null"`
	// Foreign key constraints will be added manually after migration
}

type Restaurant struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	OrgID       uuid.UUID `gorm:"type:uuid;index;not null"`
	Slug        string    `gorm:"uniqueIndex;not null"`
	Name        string    `gorm:"not null"`
	Slogan      string    `gorm:"not null"`
	Place       string    `gorm:"not null;index"` // Near city or some place
	Genre       string    `gorm:"not null;index"` // Cuisine type
	Budget      string    `gorm:"not null"`       // Budget range (e.g., "500-1500")
	Title       string    `gorm:"not null"`       // Restaurant title
	Description string    `gorm:"type:text"`
	Address     string
	Phone       string
	Timezone    string     `gorm:"not null;default:Asia/Kathmandu"`
	Capacity    int        `gorm:"not null;default:30"`
	IsOpen      bool       `gorm:"column:is_open;not null;default:true"` // Optional if restaurant is closed
	MainImageID *uuid.UUID `gorm:"type:uuid"`                            // Reference to main image
	// Relationships
	Images       []Image       `gorm:"foreignKey:RestaurantID"`
	OpenHours    []OpeningHour `gorm:"foreignKey:RestaurantID"`
	Menus        []Menu        `gorm:"foreignKey:RestaurantID"`
	Courses      []Course      `gorm:"foreignKey:RestaurantID"`
	Reservations []Reservation `gorm:"foreignKey:RestaurantID"`
	Reviews      []Review      `gorm:"foreignKey:RestaurantID"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type OpeningHour struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	Weekday      int       `gorm:"not null"`                                // 0=Sunday, 1=Monday, ..., 6=Saturday
	OpenTime     string    `gorm:"column:open_time;not null"`               // Format: "09:00"
	CloseTime    string    `gorm:"column:close_time;not null"`              // Format: "22:00"
	IsClosed     bool      `gorm:"column:is_closed;not null;default:false"` // If restaurant is closed on this day
}

func (OpeningHour) TableName() string {
	return "opening_hours"
}

type MenuType string
type MealType string

const (
	MenuTypeDrink MenuType = "DRINK"
	MenuTypeFood  MenuType = "FOOD"
)

const (
	MealTypeLunch  MealType = "LUNCH"
	MealTypeDinner MealType = "DINNER"
	MealTypeBoth   MealType = "BOTH"
)

type Menu struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	Name         string    `gorm:"not null"`  // Title/Name of the menu item
	ShortDesc    string    `gorm:"type:text"` // Short description
	ImageURL     string
	Price        int      `gorm:"not null"`
	Type         MenuType `gorm:"type:text;not null"` // DRINK or FOOD
	MealType     MealType `gorm:"type:text;not null"` // LUNCH, DINNER, or BOTH
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type Course struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey"`
	RestaurantID  uuid.UUID `gorm:"type:uuid;index;not null"`
	Title         string    `gorm:"not null"`
	Description   string
	ImageURL      string
	CoursePrice   int    `gorm:"not null"`     // Current price
	OriginalPrice *int   `gorm:"default:null"` // Optional original price for strikethrough
	NumberOfItems int    `gorm:"not null;default:1"`
	StayTime      int    `gorm:"not null"`  // Stay time in minutes
	CourseContent string `gorm:"type:text"` // Rich text content
	Precautions   string `gorm:"type:text"` // Precautions items
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type Image struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	URL          string    `gorm:"not null"`
	Alt          string
	IsMain       bool `gorm:"not null;default:false"` // Main image for restaurant list
	DisplayOrder int  `gorm:"not null;default:0"`     // Order for gallery display
}

type Customer struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Email     string    `gorm:"index"`
	Phone     string    `gorm:"index"`
	Name      string
	CreatedAt time.Time
}

type ReservationStatus string

const (
	ResvPending   ReservationStatus = "PENDING"
	ResvConfirmed ReservationStatus = "CONFIRMED"
	ResvCancelled ReservationStatus = "CANCELLED"
)

type Reservation struct {
	ID           uuid.UUID         `gorm:"type:uuid;primaryKey"`
	RestaurantID uuid.UUID         `gorm:"type:uuid;index;not null"`
	CustomerID   uuid.UUID         `gorm:"type:uuid;index"`
	CourseID     *uuid.UUID        `gorm:"type:uuid;index"` // Optional course reservation
	StartsAt     time.Time         `gorm:"index;not null"`
	DurationMin  int               `gorm:"not null;default:90"`
	PartySize    int               `gorm:"not null"`
	Status       ReservationStatus `gorm:"type:text;not null;default:PENDING"`
	CreatedAt    time.Time
	Customer     Customer
	Course       *Course `gorm:"foreignKey:CourseID"` // Course details if reserved
}

type Review struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	CustomerID   uuid.UUID `gorm:"type:uuid;index"`
	CustomerName string    `gorm:"type:text"` // Customer name for display
	Rating       int       `gorm:"not null"`  // 1-5 stars
	Title        string    `gorm:"type:text"` // Review title
	Comment      string    `gorm:"type:text"`
	IsApproved   bool      `gorm:"not null;default:false"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type LandingPage struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Slug      string    `gorm:"uniqueIndex;not null"`
	Title     string
	BodyMD    string
	Published bool `gorm:"index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// DetectDatabaseType detects the database type from the DSN
func DetectDatabaseType(db *gorm.DB) DatabaseType {
	// Get the underlying sql.DB to check the driver name
	sqlDB, err := db.DB()
	if err != nil {
		return PostgreSQL // Default to PostgreSQL
	}

	driverName := sqlDB.Driver().(interface{ DriverName() string }).DriverName()
	switch driverName {
	case "postgres":
		return PostgreSQL
	default:
		return PostgreSQL
	}
}

func AutoMigrate(db *gorm.DB) error {
	// Use GORM's AutoMigrate to create tables with proper relationships
	if err := db.AutoMigrate(
		&User{},
		&Organization{},
		&OrgMember{},
		&Restaurant{},
		&OpeningHour{},
		&Menu{},
		&Course{},
		&Image{},
		&Customer{},
		&Reservation{},
		&Review{},
		&LandingPage{},
	); err != nil {
		return fmt.Errorf("failed to run auto migration: %w", err)
	}

	// Add any missing columns that might not be created by AutoMigrate
	if err := addMissingColumns(db); err != nil {
		return fmt.Errorf("failed to add missing columns: %w", err)
	}

	return nil
}

// addMissingColumns adds any missing columns that GORM might not create automatically
func addMissingColumns(db *gorm.DB) error {
	// Check if oauth columns exist in users table
	var count int64
	if err := db.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'oauth_provider'").Scan(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		// Add OAuth columns to users table
		if err := db.Exec("ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50)").Error; err != nil {
			return err
		}
		if err := db.Exec("ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255)").Error; err != nil {
			return err
		}
		if err := db.Exec("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)").Error; err != nil {
			return err
		}
	}

	// Check if is_closed column exists in opening_hours table
	if err := db.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'opening_hours' AND column_name = 'is_closed'").Scan(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		// Add is_closed column to opening_hours table
		if err := db.Exec("ALTER TABLE opening_hours ADD COLUMN is_closed BOOLEAN NOT NULL DEFAULT false").Error; err != nil {
			return err
		}
	}

	return nil
}
