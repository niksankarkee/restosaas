package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupTestDB creates a test database connection
func setupTestDB(t *testing.T) *gorm.DB {
	// Get database URL from environment or use default
	dbURL := os.Getenv("TEST_DATABASE_URL")
	if dbURL == "" {
		t.Skip("Skipping integration test - no TEST_DATABASE_URL configured")
	}

	// Connect to test database
	gdb, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Auto-migrate the database
	err = db.AutoMigrate(gdb)
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return gdb
}

// cleanupTestDB cleans up test data
func cleanupTestDB(t *testing.T, gdb *gorm.DB) {
	// Clean up test data
	gdb.Exec("DELETE FROM reviews")
	gdb.Exec("DELETE FROM reservations")
	gdb.Exec("DELETE FROM restaurants")
	gdb.Exec("DELETE FROM org_members")
	gdb.Exec("DELETE FROM organizations")
	gdb.Exec("DELETE FROM users")
}

func TestUserHandler_Integration_CreateUser(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	gdb := setupTestDB(t)
	defer cleanupTestDB(t, gdb)

	handler := &UserHandler{DB: gdb}

	// Create request
	reqBody := CreateUserRequest{
		Email:       "integration@example.com",
		Password:    "password123",
		DisplayName: "Integration Test User",
		Role:        "CUSTOMER",
	}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/users", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Execute
	handler.CreateUser(c)

	// Assertions
	assert.Equal(t, http.StatusCreated, w.Code)

	var response UserWithTokenResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "integration@example.com", response.Email)
	assert.Equal(t, "Integration Test User", response.DisplayName)
	assert.Equal(t, "CUSTOMER", response.Role)
	assert.NotEmpty(t, response.Token)

	// Verify user was created in database
	var user db.User
	err = gdb.Where("email = ?", "integration@example.com").First(&user).Error
	assert.NoError(t, err)
	assert.Equal(t, "Integration Test User", user.DisplayName)
}

func TestUserHandler_Integration_CreateOwner(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	gdb := setupTestDB(t)
	defer cleanupTestDB(t, gdb)

	handler := &UserHandler{DB: gdb}

	// Create request
	reqBody := CreateUserRequest{
		Email:       "owner@example.com",
		Password:    "password123",
		DisplayName: "Restaurant Owner",
		Role:        "OWNER",
	}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/users", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Execute
	handler.CreateUser(c)

	// Assertions
	assert.Equal(t, http.StatusCreated, w.Code)

	var response UserWithTokenResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "owner@example.com", response.Email)
	assert.Equal(t, "OWNER", response.Role)

	// Verify user was created
	var user db.User
	err = gdb.Where("email = ?", "owner@example.com").First(&user).Error
	assert.NoError(t, err)
	assert.Equal(t, "OWNER", string(user.Role))

	// Verify organization was created
	var org db.Organization
	err = gdb.Where("name = ?", "Restaurant Owner's Organization").First(&org).Error
	assert.NoError(t, err)

	// Verify org member was created
	var orgMember db.OrgMember
	err = gdb.Where("user_id = ? AND org_id = ?", user.ID, org.ID).First(&orgMember).Error
	assert.NoError(t, err)
	assert.Equal(t, "OWNER", string(orgMember.Role))
}

func TestUserHandler_Integration_Login(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	gdb := setupTestDB(t)
	defer cleanupTestDB(t, gdb)

	handler := &UserHandler{DB: gdb}

	// Create a user first
	user := &db.User{
		ID:          uuid.New(),
		Email:       "login@example.com",
		Password:    "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f", // SHA256 of "password123"
		DisplayName: "Login Test User",
		Role:        db.RoleCustomer,
	}
	err := gdb.Create(user).Error
	assert.NoError(t, err)

	// Create login request
	reqBody := LoginRequest{
		Email:    "login@example.com",
		Password: "password123",
	}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/auth/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Execute
	handler.Login(c)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)

	var response UserWithTokenResponse
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "login@example.com", response.Email)
	assert.NotEmpty(t, response.Token)
}

func TestUserHandler_Integration_DuplicateEmail(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	gdb := setupTestDB(t)
	defer cleanupTestDB(t, gdb)

	handler := &UserHandler{DB: gdb}

	// Create a user first
	user := &db.User{
		ID:          uuid.New(),
		Email:       "duplicate@example.com",
		Password:    "hashedpassword",
		DisplayName: "First User",
		Role:        db.RoleCustomer,
	}
	err := gdb.Create(user).Error
	assert.NoError(t, err)

	// Try to create another user with the same email
	reqBody := CreateUserRequest{
		Email:       "duplicate@example.com",
		Password:    "password123",
		DisplayName: "Second User",
		Role:        "CUSTOMER",
	}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/users", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Execute
	handler.CreateUser(c)

	// Assertions
	assert.Equal(t, http.StatusConflict, w.Code)

	var response map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "user already exists", response["error"])
}
