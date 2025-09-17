package db

import (
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
	OrgID       uuid.UUID `gorm:"type:uuid;uniqueIndex;not null"`
	Slug        string    `gorm:"uniqueIndex;not null"`
	Name        string    `gorm:"not null"`
	Slogan      string    `gorm:"not null"`
	Place       string    `gorm:"not null;index"`                      // Near city or some place
	Genre       string    `gorm:"not null;index"`                      // Cuisine type
	Budget      string    `gorm:"not null"`                            // Budget range (e.g., "$$", "$$$") - kept for backward compatibility
	MinPrice    int       `gorm:"column:min_price;not null;default:0"` // Minimum price in Rs
	MaxPrice    int       `gorm:"column:max_price;not null;default:0"` // Maximum price in Rs
	Title       string    `gorm:"not null"`                            // Restaurant title
	Description string    `gorm:"type:text"`
	Area        string    `gorm:"index"`
	Address     string
	Phone       string
	Timezone    string     `gorm:"not null;default:Asia/Kathmandu"`
	Capacity    int        `gorm:"not null;default:30"`
	IsOpen      bool       `gorm:"column:is_open;not null;default:true"` // Optional if restaurant is closed
	MainImageID *uuid.UUID `gorm:"type:uuid"`                            // Reference to main image
	// Foreign key relationships will be added manually after migration
	CreatedAt time.Time
	UpdatedAt time.Time
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
	// Create tables manually to avoid foreign key constraint issues
	sql := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255),
		display_name VARCHAR(255),
		role VARCHAR(50) NOT NULL,
		oauth_provider VARCHAR(50),
		oauth_id VARCHAR(255),
		avatar_url VARCHAR(500),
		created_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS organizations (
		id UUID PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		subscription_status VARCHAR(50) NOT NULL DEFAULT 'INACTIVE',
		created_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS restaurants (
		id UUID PRIMARY KEY,
		org_id UUID NOT NULL,
		slug VARCHAR(255) UNIQUE NOT NULL,
		name VARCHAR(255) NOT NULL,
		slogan VARCHAR(255) NOT NULL,
		place VARCHAR(255) NOT NULL,
		genre VARCHAR(255) NOT NULL,
		budget VARCHAR(10) NOT NULL,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		address VARCHAR(255),
		phone VARCHAR(50),
		timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kathmandu',
		capacity INTEGER NOT NULL DEFAULT 30,
		is_open BOOLEAN NOT NULL DEFAULT true,
		main_image_id UUID,
		created_at TIMESTAMP,
		updated_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS org_members (
		id UUID PRIMARY KEY,
		user_id UUID NOT NULL,
		org_id UUID NOT NULL,
		role VARCHAR(50) NOT NULL
	);
	
	CREATE TABLE IF NOT EXISTS opening_hours (
		id UUID PRIMARY KEY,
		restaurant_id UUID NOT NULL,
		weekday INTEGER NOT NULL,
		open_time VARCHAR(10) NOT NULL,
		close_time VARCHAR(10) NOT NULL,
		is_closed BOOLEAN NOT NULL DEFAULT false
	);
	
	CREATE TABLE IF NOT EXISTS menus (
		id UUID PRIMARY KEY,
		restaurant_id UUID NOT NULL,
		name VARCHAR(255) NOT NULL,
		short_desc TEXT,
		image_url VARCHAR(500),
		price INTEGER NOT NULL,
		type VARCHAR(10) NOT NULL,
		meal_type VARCHAR(10) NOT NULL,
		created_at TIMESTAMP,
		updated_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS courses (
		id UUID PRIMARY KEY,
		restaurant_id UUID NOT NULL,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		image_url VARCHAR(500),
		course_price INTEGER NOT NULL,
		original_price INTEGER,
		number_of_items INTEGER NOT NULL DEFAULT 1,
		stay_time INTEGER NOT NULL,
		course_content TEXT,
		precautions TEXT,
		created_at TIMESTAMP,
		updated_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS images (
		id UUID PRIMARY KEY,
		restaurant_id UUID NOT NULL,
		url VARCHAR(500) NOT NULL,
		alt_text VARCHAR(255),
		is_main BOOLEAN NOT NULL DEFAULT false
	);
	
	CREATE TABLE IF NOT EXISTS customers (
		id UUID PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		email VARCHAR(255) NOT NULL,
		phone VARCHAR(50),
		created_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS reservations (
		id UUID PRIMARY KEY,
		restaurant_id UUID NOT NULL,
		customer_id UUID,
		course_id UUID,
		starts_at TIMESTAMP NOT NULL,
		duration_min INTEGER NOT NULL DEFAULT 90,
		party_size INTEGER NOT NULL,
		status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
		created_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS reviews (
		id UUID PRIMARY KEY,
		restaurant_id UUID NOT NULL,
		customer_id UUID,
		customer_name VARCHAR(255),
		rating INTEGER NOT NULL,
		title VARCHAR(255),
		comment TEXT,
		is_approved BOOLEAN NOT NULL DEFAULT false,
		created_at TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS landing_pages (
		id UUID PRIMARY KEY,
		restaurant_id UUID NOT NULL,
		slug VARCHAR(255) UNIQUE NOT NULL,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		hero_image_url VARCHAR(500),
		created_at TIMESTAMP,
		updated_at TIMESTAMP
	);
	`

	return db.Exec(sql).Error
}
