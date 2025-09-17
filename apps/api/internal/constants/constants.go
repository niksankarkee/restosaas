package constants

// HTTP Status Messages
const (
	StatusMessageOK                  = "OK"
	StatusMessageCreated             = "Created"
	StatusMessageBadRequest          = "Bad Request"
	StatusMessageUnauthorized        = "Unauthorized"
	StatusMessageForbidden           = "Forbidden"
	StatusMessageNotFound            = "Not Found"
	StatusMessageConflict            = "Conflict"
	StatusMessageInternalServerError = "Internal Server Error"
	StatusMessageUnprocessableEntity = "Unprocessable Entity"
)

// Error Messages
const (
	ErrUserNotFound                        = "user not found"
	ErrUserAlreadyExists                   = "user already exists"
	ErrInvalidCredentials                  = "invalid credentials"
	ErrInvalidUserID                       = "invalid user ID"
	ErrInvalidUserIDFormat                 = "invalid user ID format"
	ErrEmailAlreadyExists                  = "email already exists"
	ErrFailedToCreateUser                  = "failed to create user"
	ErrFailedToFetchUser                   = "failed to fetch user"
	ErrFailedToUpdateUser                  = "failed to update user"
	ErrFailedToDeleteUser                  = "failed to delete user"
	ErrFailedToGenerateToken               = "failed to generate token"
	ErrFailedToCountUsers                  = "failed to count users"
	ErrFailedToFetchUsers                  = "failed to fetch users"
	ErrUnauthorized                        = "unauthorized"
	ErrRestaurantNotFound                  = "restaurant not found"
	ErrFailedToCreateRestaurant            = "failed to create restaurant"
	ErrFailedToFetchRestaurant             = "failed to fetch restaurant"
	ErrFailedToUpdateRestaurant            = "failed to update restaurant"
	ErrFailedToDeleteRestaurant            = "failed to delete restaurant"
	ErrFailedToUploadImages                = "failed to upload images"
	ErrFailedToSetMainImage                = "failed to set main image"
	ErrFailedToSetOpeningHours             = "failed to set opening hours"
	ErrOrganizationNotFound                = "organization not found"
	ErrFailedToCreateOrganization          = "failed to create organization"
	ErrFailedToFetchOrganization           = "failed to fetch organization"
	ErrFailedToUpdateOrganization          = "failed to update organization"
	ErrFailedToDeleteOrganization          = "failed to delete organization"
	ErrFailedToAssignOwner                 = "failed to assign owner"
	ErrFailedToAssignUsers                 = "failed to assign users"
	ErrFailedToFetchMembers                = "failed to fetch members"
	ErrInvalidOrganizationID               = "invalid organization ID"
	ErrInvalidOwnerID                      = "invalid owner ID"
	ErrOwnerNotFound                       = "owner not found"
	ErrFailedToFetchOwner                  = "failed to fetch owner"
	ErrFailedToRemoveExistingMemberships   = "failed to remove existing memberships"
	ErrFailedToAssignOwnerToOrganization   = "failed to assign owner to organization"
	ErrFailedToAssignUsersToOrganization   = "failed to assign users to organization"
	ErrSomeUsersNotFound                   = "some users not found"
	ErrFailedToFetchOrganizationMembers    = "failed to fetch organization members"
	ErrFailedToFetchOrganizationMembership = "failed to fetch organization membership"
	ErrFailedToCountOrganizations          = "failed to count organizations"
	ErrFailedToFetchOrganizations          = "failed to fetch organizations"
	ErrFailedToCreateMenu                  = "failed to create menu"
	ErrFailedToFetchMenus                  = "failed to fetch menus"
	ErrFailedToUpdateMenu                  = "failed to update menu"
	ErrFailedToDeleteMenu                  = "failed to delete menu"
	ErrFailedToCreateCourse                = "failed to create course"
	ErrFailedToFetchCourses                = "failed to fetch courses"
	ErrFailedToUpdateCourse                = "failed to update course"
	ErrFailedToDeleteCourse                = "failed to delete course"
	ErrFailedToCreateReservation           = "failed to create reservation"
	ErrFailedToFetchReservations           = "failed to fetch reservations"
	ErrFailedToUpdateReservation           = "failed to update reservation"
	ErrFailedToDeleteReservation           = "failed to delete reservation"
	ErrFailedToCreateReview                = "failed to create review"
	ErrFailedToFetchReviews                = "failed to fetch reviews"
	ErrFailedToUpdateReview                = "failed to update review"
	ErrFailedToDeleteReview                = "failed to delete review"
	ErrFailedToApproveReview               = "failed to approve review"
	ErrFailedToRunMigration                = "failed to run migration"
	ErrFailedToExecuteMigration            = "failed to execute migration query"
	ErrReviewNotFound                      = "review not found"
	ErrImageNotFound                       = "image not found"
	ErrFailedToDeleteImage                 = "failed to delete image"
	ErrNoMainImage                         = "no main image found"
	ErrAlreadyMainImage                    = "image is already main image"
	ErrNotAnImage                          = "file is not an image"
	ErrUnsupportedFileType                 = "unsupported file type"
	ErrFileSizeExceeded                    = "file size exceeded"
	ErrFailedToParseUUID                   = "failed to parse UUID"
	ErrInvalidTimeFormat                   = "invalid time format"
	ErrInvalidDateRange                    = "invalid date range"
	ErrInvalidCapacity                     = "invalid capacity"
	ErrInvalidPrice                        = "invalid price"
	ErrInvalidRating                       = "invalid rating"
	ErrInvalidReviewLength                 = "invalid review length"
	ErrInvalidDisplayName                  = "invalid display name"
	ErrInvalidRole                         = "invalid role"
	ErrInvalidEmail                        = "invalid email"
	ErrInvalidPassword                     = "invalid password"
	ErrInvalidToken                        = "invalid token"
	ErrTokenExpired                        = "token expired"
	ErrMissingAuthHeader                   = "missing authorization header"
	ErrInvalidAuthHeader                   = "invalid authorization header"
	ErrInvalidOAuthProvider                = "invalid OAuth provider"
	ErrOAuthFailed                         = "OAuth failed"
	ErrFailedToFetchOAuthUser              = "failed to fetch OAuth user info"
	ErrFailedToExchangeToken               = "failed to exchange token"
	ErrFailedToGetUserInfo                 = "failed to get user info from provider"
	ErrFailedToCreateOrgMember             = "failed to create organization member"
	ErrOrgMemberNotFound                   = "organization member not found"
	ErrFailedToFetchOrgMembers             = "failed to fetch organization members"
	ErrFailedToUpdateOrgMember             = "failed to update organization member"
	ErrFailedToDeleteOrgMember             = "failed to delete organization member"
	ErrRestaurantNameExists                = "restaurant with this name already exists"
)

// Success Messages
const (
	MsgUserCreated                             = "user created successfully"
	MsgUserUpdated                             = "user updated successfully"
	MsgUserDeleted                             = "user deleted successfully"
	MsgRestaurantCreated                       = "restaurant created successfully"
	MsgRestaurantUpdated                       = "restaurant updated successfully"
	MsgRestaurantDeleted                       = "restaurant deleted successfully"
	MsgOrganizationCreated                     = "organization created successfully"
	MsgOrganizationUpdated                     = "organization updated successfully"
	MsgOrganizationDeleted                     = "organization deleted successfully"
	MsgMenuCreated                             = "menu created successfully"
	MsgMenuUpdated                             = "menu updated successfully"
	MsgMenuDeleted                             = "menu deleted successfully"
	MsgCourseCreated                           = "course created successfully"
	MsgCourseUpdated                           = "course updated successfully"
	MsgCourseDeleted                           = "course deleted successfully"
	MsgReservationCreated                      = "reservation created successfully"
	MsgReservationUpdated                      = "reservation updated successfully"
	MsgReservationDeleted                      = "reservation deleted successfully"
	MsgReviewCreated                           = "review created successfully"
	MsgReviewUpdated                           = "review updated successfully"
	MsgReviewDeleted                           = "review deleted successfully"
	MsgReviewApproved                          = "review approved successfully"
	MsgImagesUploaded                          = "images uploaded successfully"
	MsgMainImageSet                            = "main image set successfully"
	MsgOpeningHoursSet                         = "opening hours set successfully"
	MsgOwnerAssigned                           = "owner assigned successfully"
	MsgUsersAssigned                           = "users assigned successfully"
	MsgOwnerSuccessfullyAssignedToOrganization = "owner successfully assigned to organization"
	MsgUsersSuccessfullyAssignedToOrganization = "users successfully assigned to organization"
)

// Database Constants
const (
	DefaultPageSize   = 10
	MaxPageSize       = 100
	MinPasswordLength = 4
)

// JWT Constants
const (
	JWTSecretKey = "JWT_SECRET"
	AppEnvKey    = "APP_ENV"
	DevEnv       = "dev"
	ProdEnv      = "prod"
)

// Role Constants
const (
	RoleSuperAdmin = "SUPER_ADMIN"
	RoleOwner      = "OWNER"
	RoleCustomer   = "CUSTOMER"
)

// Menu Type Constants
const (
	MenuTypeFood  = "FOOD"
	MenuTypeDrink = "DRINK"
)

// Meal Type Constants
const (
	MealTypeLunch  = "LUNCH"
	MealTypeDinner = "DINNER"
	MealTypeBoth   = "BOTH"
)

// OAuth Provider Constants
const (
	OAuthProviderGoogle   = "google"
	OAuthProviderFacebook = "facebook"
	OAuthProviderTwitter  = "twitter"
)

// File Upload Constants
const (
	MaxFileSize       = 10 * 1024 * 1024 // 10MB
	AllowedImageTypes = "image/jpeg,image/png,image/gif,image/webp"
)

// Pagination Constants
const (
	DefaultPage     = 1
	DefaultLimit    = 10
	MaxLimit        = 100
	DefaultPageStr  = "1"
	DefaultLimitStr = "10"
)

// Time Constants
const (
	DefaultStayTime = 60 // minutes
	DefaultTimeout  = 30 // seconds
)

// Validation Constants
const (
	MinTitleLength       = 1
	MaxTitleLength       = 255
	MinDescriptionLength = 0
	MaxDescriptionLength = 1000
	MinNameLength        = 1
	MaxNameLength        = 100
	MinEmailLength       = 5
	MaxEmailLength       = 255
	MinPhoneLength       = 10
	MaxPhoneLength       = 20
	MinAddressLength     = 5
	MaxAddressLength     = 500
)

// Business Logic Constants
const (
	MinCapacity     = 1
	MaxCapacity     = 1000
	MinPrice        = 0
	MaxPrice        = 1000000 // 1 million
	MinRating       = 1
	MaxRating       = 5
	MinReviewLength = 10
	MaxReviewLength = 1000
)

// Subscription Status Constants
const (
	SubscriptionStatusInactive  = "INACTIVE"
	SubscriptionStatusActive    = "ACTIVE"
	SubscriptionStatusSuspended = "SUSPENDED"
)
