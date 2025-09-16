package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"time"

	"github.com/example/restosaas/apps/api/internal/auth"
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SuperAdminHandler struct{ DB *gorm.DB }

// CreateOwnerRequest represents the request to create an owner
type CreateOwnerRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	DisplayName string `json:"displayName" binding:"required"`
	OrgName     string `json:"orgName" binding:"required"`
}

// CreateOwnerResponse represents the response after creating an owner
type CreateOwnerResponse struct {
	User         OwnerUserResponse `json:"user"`
	Organization struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"organization"`
	Token string `json:"token"`
}

// OwnerUserResponse represents a user in API responses for super admin
type OwnerUserResponse struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	DisplayName string    `json:"displayName"`
	Role        string    `json:"role"`
	CreatedAt   time.Time `json:"createdAt"`
}

// POST /api/super-admin/owners - Create owner (SUPER_ADMIN only)
func (h *SuperAdminHandler) CreateOwner(c *gin.Context) {
	var req CreateOwnerRequest
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

	// Start transaction
	tx := h.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create user
	user := db.User{
		ID:          uuid.New(),
		Email:       req.Email,
		Password:    hashedPassword,
		DisplayName: req.DisplayName,
		Role:        db.RoleOwner,
		CreatedAt:   time.Now(),
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "failed to create user"})
		return
	}

	// Create organization
	org := db.Organization{
		ID:                 uuid.New(),
		Name:               req.OrgName,
		SubscriptionStatus: "INACTIVE",
		CreatedAt:          time.Now(),
	}

	if err := tx.Create(&org).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "failed to create organization"})
		return
	}

	// Create organization member
	orgMember := db.OrgMember{
		ID:     uuid.New(),
		UserID: user.ID,
		OrgID:  org.ID,
		Role:   db.RoleOwner,
	}

	if err := tx.Create(&orgMember).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "failed to create organization member"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to commit transaction"})
		return
	}

	// Generate JWT token
	token, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to generate token"})
		return
	}

	response := CreateOwnerResponse{
		User: OwnerUserResponse{
			ID:          user.ID.String(),
			Email:       user.Email,
			DisplayName: user.DisplayName,
			Role:        string(user.Role),
			CreatedAt:   user.CreatedAt,
		},
		Organization: struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}{
			ID:   org.ID.String(),
			Name: org.Name,
		},
		Token: token,
	}

	c.JSON(201, response)
}

// GET /api/super-admin/owners - List all owners (SUPER_ADMIN only)
func (h *SuperAdminHandler) ListOwners(c *gin.Context) {
	var results []struct {
		UserID      string    `json:"user_id"`
		Email       string    `json:"email"`
		DisplayName string    `json:"display_name"`
		Role        string    `json:"role"`
		CreatedAt   time.Time `json:"created_at"`
		OrgID       string    `json:"org_id"`
		OrgName     string    `json:"org_name"`
	}

	if err := h.DB.Table("users").
		Select("users.id as user_id, users.email, users.display_name, users.role, users.created_at, organizations.id as org_id, organizations.name as org_name").
		Joins("JOIN org_members ON users.id = org_members.user_id").
		Joins("JOIN organizations ON org_members.org_id = organizations.id").
		Where("users.role = ?", db.RoleOwner).
		Scan(&results).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch owners"})
		return
	}

	// Convert to response format
	var owners []struct {
		User         OwnerUserResponse `json:"user"`
		Organization struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"organization"`
	}

	for _, result := range results {
		owners = append(owners, struct {
			User         OwnerUserResponse `json:"user"`
			Organization struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"organization"`
		}{
			User: OwnerUserResponse{
				ID:          result.UserID,
				Email:       result.Email,
				DisplayName: result.DisplayName,
				Role:        result.Role,
				CreatedAt:   result.CreatedAt,
			},
			Organization: struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			}{
				ID:   result.OrgID,
				Name: result.OrgName,
			},
		})
	}

	c.JSON(200, owners)
}

// GET /api/super-admin/users - List all users (SUPER_ADMIN only)
func (h *SuperAdminHandler) ListAllUsers(c *gin.Context) {
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
	var response []OwnerUserResponse
	for _, user := range users {
		response = append(response, OwnerUserResponse{
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

// PUT /api/super-admin/users/:id - Update user (SUPER_ADMIN only)
func (h *SuperAdminHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user ID"})
		return
	}

	var req struct {
		Email       *string `json:"email,omitempty"`
		DisplayName *string `json:"displayName,omitempty"`
		Role        *string `json:"role,omitempty"`
	}

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

	response := OwnerUserResponse{
		ID:          user.ID.String(),
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        string(user.Role),
		CreatedAt:   user.CreatedAt,
	}

	c.JSON(200, response)
}

// DELETE /api/super-admin/users/:id - Delete user (SUPER_ADMIN only)
func (h *SuperAdminHandler) DeleteUser(c *gin.Context) {
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

	c.Status(204)
}
