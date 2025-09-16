package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strconv"
	"time"

	"github.com/example/restosaas/apps/api/internal/auth"
	"github.com/example/restosaas/apps/api/internal/db"
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

// POST /api/users - Create user
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser db.User
	if err := h.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(409, gin.H{"error": "user already exists"})
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

	// If user is an OWNER, create organization and org member in a transaction
	if db.Role(req.Role) == db.RoleOwner {
		org := db.Organization{
			ID:        uuid.New(),
			Name:      req.DisplayName + "'s Organization", // Default org name
			CreatedAt: time.Now(),
		}

		orgMember := db.OrgMember{
			ID:     uuid.New(),
			UserID: user.ID,
			OrgID:  org.ID,
			Role:   db.RoleOwner,
		}

		err := h.DB.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&user).Error; err != nil {
				return err
			}
			if err := tx.Create(&org).Error; err != nil {
				return err
			}
			if err := tx.Create(&orgMember).Error; err != nil {
				return err
			}
			return nil
		})

		if err != nil {
			c.JSON(500, gin.H{"error": "failed to create user and organization"})
			return
		}
	} else {
		// For non-OWNER users, just create the user
		if err := h.DB.Create(&user).Error; err != nil {
			c.JSON(500, gin.H{"error": "failed to create user"})
			return
		}
	}

	// Generate JWT token
	token, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to generate token"})
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

	c.JSON(201, response)
}

// GET /api/users - List users (with pagination)
func (h *UserHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	role := c.Query("role")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var users []db.User
	var total int64

	query := h.DB.Model(&db.User{})
	if role != "" {
		query = query.Where("role = ?", role)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to count users"})
		return
	}

	// Get users
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch users"})
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

	c.JSON(200, gin.H{
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
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user ID"})
		return
	}

	var user db.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch user"})
		return
	}

	response := UserResponse{
		ID:          user.ID.String(),
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        string(user.Role),
		CreatedAt:   user.CreatedAt,
	}

	c.JSON(200, response)
}

// PUT /api/users/:id - Update user
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user ID"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Check if user exists
	var user db.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch user"})
		return
	}

	// Check if email is being changed and if it already exists
	if req.Email != nil && *req.Email != user.Email {
		var existingUser db.User
		if err := h.DB.Where("email = ? AND id != ?", *req.Email, userID).First(&existingUser).Error; err == nil {
			c.JSON(409, gin.H{"error": "email already exists"})
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
		c.JSON(500, gin.H{"error": "failed to update user"})
		return
	}

	response := UserResponse{
		ID:          user.ID.String(),
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        string(user.Role),
		CreatedAt:   user.CreatedAt,
	}

	c.JSON(200, response)
}

// DELETE /api/users/:id - Delete user
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user ID"})
		return
	}

	// Check if user exists
	var user db.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch user"})
		return
	}

	// Delete user (GORM will handle cascade deletes based on foreign key constraints)
	if err := h.DB.Delete(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to delete user"})
		return
	}

	c.Status(http.StatusNoContent)
}

// POST /api/auth/login - Login user
func (h *UserHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Hash provided password
	hasher := sha256.New()
	hasher.Write([]byte(req.Password))
	hashedPassword := hex.EncodeToString(hasher.Sum(nil))

	// Find user
	var user db.User
	if err := h.DB.Where("email = ? AND password = ?", req.Email, hashedPassword).First(&user).Error; err != nil {
		c.JSON(401, gin.H{"error": "invalid credentials"})
		return
	}

	// Generate JWT token
	token, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to generate token"})
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

	c.JSON(200, response)
}

// GET /api/users/me - Get current user
func (h *UserHandler) GetMe(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(401, gin.H{"error": "invalid user ID"})
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user ID format"})
		return
	}

	var user db.User
	if err := h.DB.Where("id = ?", userUUID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "user not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch user"})
		return
	}

	response := UserResponse{
		ID:          user.ID.String(),
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        string(user.Role),
		CreatedAt:   user.CreatedAt,
	}

	c.JSON(200, response)
}
