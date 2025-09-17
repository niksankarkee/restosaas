package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestUserHandler_CreateUser_InvalidData(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	handler := &UserHandler{DB: nil} // We don't need DB for validation tests

	// Create request with invalid data
	reqBody := CreateUserRequest{
		Email:       "invalid-email",
		Password:    "123", // Too short
		DisplayName: "",
		Role:        "INVALID_ROLE",
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
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response["error"], "validation")
}

func TestUserHandler_Login_InvalidData(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	handler := &UserHandler{DB: nil} // We don't need DB for validation tests

	// Create request with invalid data
	reqBody := LoginRequest{
		Email:    "invalid-email",
		Password: "",
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
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response["error"], "validation")
}

func TestUserHandler_GetUser_InvalidID(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	handler := &UserHandler{DB: nil} // We don't need DB for validation tests

	// Create request with invalid UUID
	req, _ := http.NewRequest("GET", "/users/invalid-id", nil)

	// Create response recorder
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: "invalid-id"}}

	// Execute
	handler.GetUser(c)

	// Assertions
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid user ID", response["error"])
}

func TestUserHandler_UpdateUser_InvalidID(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	handler := &UserHandler{DB: nil} // We don't need DB for validation tests

	// Create request with invalid UUID
	req, _ := http.NewRequest("PUT", "/users/invalid-id", bytes.NewBuffer([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: "invalid-id"}}

	// Execute
	handler.UpdateUser(c)

	// Assertions
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid user ID", response["error"])
}

// Helper function to create string pointers
func stringPtr(s string) *string {
	return &s
}
