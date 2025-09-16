package db

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	RoleSuper    Role = "SUPER_ADMIN"
	RoleOwner    Role = "OWNER"
	RoleCustomer Role = "CUSTOMER"
)

type User struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email       string    `gorm:"uniqueIndex;not null"`
	Password    string
	DisplayName string
	Role        Role `gorm:"type:text;not null"`
	CreatedAt   time.Time
}

type Organization struct {
	ID                 uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name               string    `gorm:"not null"`
	SubscriptionStatus string    `gorm:"not null;default:INACTIVE"`
	CreatedAt          time.Time
	Users              []OrgMember `gorm:"foreignKey:OrgID"`
	Restaurant         Restaurant  `gorm:"foreignKey:OrgID"`
}

type OrgMember struct {
	ID     uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID uuid.UUID    `gorm:"type:uuid;index;not null"`
	OrgID  uuid.UUID    `gorm:"type:uuid;index;not null"`
	Role   Role         `gorm:"type:text;not null"`
	User   User         `gorm:"constraint:OnDelete:CASCADE"`
	Org    Organization `gorm:"constraint:OnDelete:CASCADE"`
}

type Restaurant struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	OrgID       uuid.UUID `gorm:"type:uuid;uniqueIndex;not null"`
	Slug        string    `gorm:"uniqueIndex;not null"`
	Name        string    `gorm:"not null"`
	Slogan      string    `gorm:"not null"`
	Place       string    `gorm:"not null;index"` // Near city or some place
	Genre       string    `gorm:"not null;index"` // Cuisine type
	Budget      string    `gorm:"not null"`       // Budget range (e.g., "$$", "$$$")
	Title       string    `gorm:"not null"`       // Restaurant title
	Description string    `gorm:"type:text"`
	Area        string    `gorm:"index"`
	Address     string
	Phone       string
	Timezone    string        `gorm:"not null;default:Asia/Kathmandu"`
	Capacity    int           `gorm:"not null;default:30"`
	IsOpen      bool          `gorm:"not null;default:true"` // Optional if restaurant is closed
	OpenHours   []OpeningHour `gorm:"constraint:OnDelete:CASCADE"`
	Menus       []Menu        `gorm:"constraint:OnDelete:CASCADE"`
	Images      []Image       `gorm:"constraint:OnDelete:CASCADE"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type OpeningHour struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	Weekday      int       `gorm:"not null"`
	OpenTime     string    `gorm:"not null"`
	CloseTime    string    `gorm:"not null"`
}

type Menu struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	Title        string    `gorm:"not null"`
	Description  string
	Courses      []Course `gorm:"constraint:OnDelete:CASCADE"`
}

type Course struct {
	ID       uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	MenuID   uuid.UUID `gorm:"type:uuid;index;not null"`
	Name     string    `gorm:"not null"`
	Price    int       `gorm:"not null"`
	ImageURL string
}

type Image struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	URL          string    `gorm:"not null"`
	Alt          string
}

type Customer struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
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
	ID           uuid.UUID         `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RestaurantID uuid.UUID         `gorm:"type:uuid;index;not null"`
	CustomerID   uuid.UUID         `gorm:"type:uuid;index"`
	StartsAt     time.Time         `gorm:"index;not null"`
	DurationMin  int               `gorm:"not null;default:90"`
	PartySize    int               `gorm:"not null"`
	Status       ReservationStatus `gorm:"type:text;not null;default:PENDING"`
	CreatedAt    time.Time
	Customer     Customer
}

type Review struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RestaurantID uuid.UUID `gorm:"type:uuid;index;not null"`
	CustomerID   uuid.UUID `gorm:"type:uuid;index"`
	Rating       int       `gorm:"not null"`
	Comment      string
	IsApproved   bool `gorm:"not null;default:false"`
	CreatedAt    time.Time
}

type LandingPage struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Slug      string    `gorm:"uniqueIndex;not null"`
	Title     string
	BodyMD    string
	Published bool `gorm:"index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{}, &Organization{}, &OrgMember{}, &Restaurant{}, &OpeningHour{},
		&Menu{}, &Course{}, &Image{}, &Customer{}, &Reservation{}, &Review{}, &LandingPage{},
	)
}
