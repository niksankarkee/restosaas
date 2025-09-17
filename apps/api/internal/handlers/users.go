package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strconv"
	"time"

	"github.com/example/restosaas/apps/api/internal/auth"
	"github.com/example/restosaas/apps/api/internal/constants"
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/example/restosaas/apps/api/internal/logger"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct{ DB *gorm.DB }

// Request/Response DTOs
type CreateUserRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=4"`
	DisplayName string `json:"displayName" binding:"required"`
	Role        string `json:"role" binding:"required,oneof=SUPER_ADMIN OWNER CUSTOMER"`
}

type UpdateUserRequest struct {
	Email       *string `json:"email,omitempty"`
	DisplayName *string `json:"displayName,omitempty"`
	Role        *string `json:"role,omitempty"`
}

type UserResponse struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	DisplayName string    `json:"displayName"`
	Role        string    `json:"role"`
	CreatedAt   time.Time `json:"createdAt"`
}

type UserWithTokenResponse struct {
	UserResponse
	Token string `json:"token"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// CreateUser godoc
// @Summary Create a new user
// @Description Create a new user account with the provided information
// @Tags users
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "User information"
// @Success 201 {object} UserWithTokenResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	logger.Debug("CreateUser: Starting user creation process")

	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("CreateUser: Invalid request body - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Debugf("CreateUser: Processing request for email %s with role %s", req.Email, req.Role)

	// Check if user already exists
	var existingUser db.User
	if err := h.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		logger.Warnf("CreateUser: User with email %s already exists", req.Email)
		c.JSON(http.StatusConflict, gin.H{"error": constants.ErrUserAlreadyExists})
		return
	}

	// Hash password
	hasher := sha256.New()
	hasher.Write([]byte(req.Password))
	hashedPassword := hex.EncodeToString(hasher.Sum(nil))

	// Create user
	user := db.User{
		ID:          uuid.New(),
		Email:       req.Email,
		Password:    hashedPassword,
		DisplayName: req.DisplayName,
		Role:        db.Role(req.Role),
		CreatedAt:   time.Now(),
	}

	// Create user (organizations will be assigned separately by super admins)
	if err := h.DB.Create(&user).Error; err != nil {
		logger.Errorf("CreateUser: Failed to create user in database - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToCreateUser, "details": err.Error()})
		return
	}

	logger.Infof("CreateUser: User created successfully with ID %s", user.ID.String())

	// Generate JWT token
	token, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		logger.Errorf("CreateUser: Failed to generate JWT token - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToGenerateToken})
		return
	}

	response := UserWithTokenResponse{
		UserResponse: UserResponse{
			ID:          user.ID.String(),
			Email:       user.Email,
			DisplayName: user.DisplayName,
			Role:        string(user.Role),
			CreatedAt:   user.CreatedAt,
		},
		Token: token,
	}

	logger.Infof("CreateUser: User creation completed successfully for %s", user.Email)
	c.JSON(http.StatusCreated, response)
}

// ListUsers godoc
// @Summary List all users
// @Description Get a paginated list of all users with optional filtering
// @Tags users
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param role query string false "Filter by role"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /users [get]
func (h *UserHandler) ListUsers(c *gin.Context) {
	logger.Debug("ListUsers: Starting user listing process")

	page, _ := strconv.Atoi(c.DefaultQuery("page", strconv.Itoa(constants.DefaultPage)))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(constants.DefaultLimit)))
	role := c.Query("role")

	if page < 1 {
		page = constants.DefaultPage
	}
	if limit < 1 || limit > constants.MaxPageSize {
		limit = constants.DefaultLimit
	}

	offset := (page - 1) * limit

	logger.Debugf("ListUsers: Fetching users with page=%d, limit=%d, role=%s", page, limit, role)

	var users []db.User
	var total int64

	query := h.DB.Model(&db.User{})
	if role != "" {
		query = query.Where("role = ?", role)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		logger.Errorf("ListUsers: Failed to count users - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToCountUsers})
		return
	}

	// Get users
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		logger.Errorf("ListUsers: Failed to fetch users - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchUsers})
		return
	}

	// Convert to response format
	var response []UserResponse
	for _, user := range users {
		response = append(response, UserResponse{
			ID:          user.ID.String(),
			Email:       user.Email,
			DisplayName: user.DisplayName,
			Role:        string(user.Role),
			CreatedAt:   user.CreatedAt,
		})
	}

	logger.Infof("ListUsers: Successfully fetched %d users out of %d total", len(response), total)
	c.JSON(http.StatusOK, gin.H{
		"users": response,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GET /api/users/:id - Get user by ID
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	logger.Debugf("GetUser: Fetching user with ID %s", id)

	userID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("GetUser: Invalid user ID format %s - %v", id, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidUserID})
		return
	}

	var user db.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("GetUser: User with ID %s not found", id)
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrUserNotFound})
			return
		}
		logger.Errorf("GetUser: Failed to fetch user with ID %s - %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchUser})
		return
	}

	response := UserResponse{
		ID:          user.ID.String(),
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        string(user.Role),
		CreatedAt:   user.CreatedAt,
	}

	logger.Debugf("GetUser: Successfully fetched user %s", user.Email)
	c.JSON(http.StatusOK, response)
}

// PUT /api/users/:id - Update user
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	logger.Debugf("UpdateUser: Updating user with ID %s", id)

	userID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("UpdateUser: Invalid user ID format %s - %v", id, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidUserID})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("UpdateUser: Invalid request body for user %s - %v", id, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user exists
	var user db.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("UpdateUser: User with ID %s not found", id)
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrUserNotFound})
			return
		}
		logger.Errorf("UpdateUser: Failed to fetch user with ID %s - %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchUser})
		return
	}

	// Check if email is being changed and if it already exists
	if req.Email != nil && *req.Email != user.Email {
		var existingUser db.User
		if err := h.DB.Where("email = ? AND id != ?", *req.Email, userID).First(&existingUser).Error; err == nil {
			logger.Warnf("UpdateUser: Email %s already exists for another user", *req.Email)
			c.JSON(http.StatusConflict, gin.H{"error": constants.ErrEmailAlreadyExists})
			return
		}
		user.Email = *req.Email
	}

	// Update fields
	if req.DisplayName != nil {
		user.DisplayName = *req.DisplayName
	}
	if req.Role != nil {
		user.Role = db.Role(*req.Role)
	}

	if err := h.DB.Save(&user).Error; err != nil {
		logger.Errorf("UpdateUser: Failed to update user with ID %s - %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToUpdateUser})
		return
	}

	response := UserResponse{
		ID:          user.ID.String(),
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        string(user.Role),
		CreatedAt:   user.CreatedAt,
	}

	logger.Infof("UpdateUser: Successfully updated user %s", user.Email)
	c.JSON(http.StatusOK, response)
}

// DELETE /api/users/:id - Delete user
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	logger.Debugf("DeleteUser: Deleting user with ID %s", id)

	userID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("DeleteUser: Invalid user ID format %s - %v", id, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidUserID})
		return
	}

	// Check if user exists
	var user db.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("DeleteUser: User with ID %s not found", id)
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrUserNotFound})
			return
		}
		logger.Errorf("DeleteUser: Failed to fetch user with ID %s - %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchUser})
		return
	}

	// Delete user (GORM will handle cascade deletes based on foreign key constraints)
	if err := h.DB.Delete(&user).Error; err != nil {
		logger.Errorf("DeleteUser: Failed to delete user with ID %s - %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToDeleteUser})
		return
	}

	logger.Infof("DeleteUser: Successfully deleted user %s", user.Email)
	c.Status(http.StatusNoContent)
}

// Login godoc
// @Summary User login
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body LoginRequest true "Login credentials"
// @Success 200 {object} UserWithTokenResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	logger.Debug("Login: Starting user login process")

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("Login: Invalid request body - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Debugf("Login: Attempting login for email %s", req.Email)

	// Hash provided password
	hasher := sha256.New()
	hasher.Write([]byte(req.Password))
	hashedPassword := hex.EncodeToString(hasher.Sum(nil))

	// Find user
	var user db.User
	if err := h.DB.Where("email = ? AND password = ?", req.Email, hashedPassword).First(&user).Error; err != nil {
		logger.Warnf("Login: Invalid credentials for email %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": constants.ErrInvalidCredentials})
		return
	}

	// Generate JWT token
	token, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		logger.Errorf("Login: Failed to generate JWT token for user %s - %v", user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToGenerateToken})
		return
	}

	response := UserWithTokenResponse{
		UserResponse: UserResponse{
			ID:          user.ID.String(),
			Email:       user.Email,
			DisplayName: user.DisplayName,
			Role:        string(user.Role),
			CreatedAt:   user.CreatedAt,
		},
		Token: token,
	}

	logger.Infof("Login: Successful login for user %s with role %s", user.Email, user.Role)
	c.JSON(http.StatusOK, response)
}

// GET /api/users/me - Get current user
func (h *UserHandler) GetMe(c *gin.Context) {
	logger.Debug("GetMe: Getting current user information")

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("uid")
	if !exists {
		logger.Warn("GetMe: User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": constants.ErrUnauthorized})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		logger.Warn("GetMe: Invalid user ID type in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": constants.ErrInvalidUserID})
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		logger.Warnf("GetMe: Invalid user ID format %s - %v", userIDStr, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidUserIDFormat})
		return
	}

	var user db.User
	if err := h.DB.Where("id = ?", userUUID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("GetMe: User with ID %s not found", userIDStr)
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrUserNotFound})
			return
		}
		logger.Errorf("GetMe: Failed to fetch user with ID %s - %v", userIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchUser})
		return
	}

	response := UserResponse{
		ID:          user.ID.String(),
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        string(user.Role),
		CreatedAt:   user.CreatedAt,
	}

	logger.Debugf("GetMe: Successfully fetched current user %s", user.Email)
	c.JSON(http.StatusOK, response)
}
