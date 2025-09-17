package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrganizationHandler struct{ DB *gorm.DB }

// Request/Response DTOs
type CreateOrganizationRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateOrganizationRequest struct {
	Name *string `json:"name,omitempty"`
}

type OrganizationResponse struct {
	ID                 string    `json:"id"`
	Name               string    `json:"name"`
	SubscriptionStatus string    `json:"subscriptionStatus"`
	CreatedAt          time.Time `json:"createdAt"`
	RestaurantCount    int       `json:"restaurantCount"`
}

type AssignOwnerRequest struct {
	OwnerID string `json:"ownerId" binding:"required"`
}

type AssignMultipleUsersRequest struct {
	UserIDs []string `json:"userIds" binding:"required"`
}

// CreateOrganization godoc
// @Summary Create a new organization
// @Description Create a new organization (only for super admins)
// @Tags organizations
// @Accept json
// @Produce json
// @Param organization body CreateOrganizationRequest true "Organization information"
// @Success 201 {object} OrganizationResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations [post]
func (h *OrganizationHandler) CreateOrganization(c *gin.Context) {
	var req CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Create organization
	org := db.Organization{
		ID:                 uuid.New(),
		Name:               req.Name,
		SubscriptionStatus: "INACTIVE",
		CreatedAt:          time.Now(),
	}

	if err := h.DB.Create(&org).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create organization"})
		return
	}

	response := OrganizationResponse{
		ID:                 org.ID.String(),
		Name:               org.Name,
		SubscriptionStatus: org.SubscriptionStatus,
		CreatedAt:          org.CreatedAt,
		RestaurantCount:    0,
	}

	c.JSON(201, response)
}

// ListOrganizations godoc
// @Summary List all organizations
// @Description Get a paginated list of all organizations (only for super admins)
// @Tags organizations
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations [get]
func (h *OrganizationHandler) ListOrganizations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var organizations []db.Organization
	var total int64

	// Get total count
	if err := h.DB.Model(&db.Organization{}).Count(&total).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to count organizations"})
		return
	}

	// Get organizations
	if err := h.DB.Offset(offset).Limit(limit).Find(&organizations).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch organizations"})
		return
	}

	// Convert to response format with restaurant counts
	var response []OrganizationResponse
	for _, org := range organizations {
		var restaurantCount int64
		h.DB.Model(&db.Restaurant{}).Where("org_id = ?", org.ID).Count(&restaurantCount)

		response = append(response, OrganizationResponse{
			ID:                 org.ID.String(),
			Name:               org.Name,
			SubscriptionStatus: org.SubscriptionStatus,
			CreatedAt:          org.CreatedAt,
			RestaurantCount:    int(restaurantCount),
		})
	}

	c.JSON(200, gin.H{
		"organizations": response,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetOrganization godoc
// @Summary Get organization by ID
// @Description Get organization details by ID (only for super admins)
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Success 200 {object} OrganizationResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations/{id} [get]
func (h *OrganizationHandler) GetOrganization(c *gin.Context) {
	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	var restaurantCount int64
	h.DB.Model(&db.Restaurant{}).Where("org_id = ?", org.ID).Count(&restaurantCount)

	response := OrganizationResponse{
		ID:                 org.ID.String(),
		Name:               org.Name,
		SubscriptionStatus: org.SubscriptionStatus,
		CreatedAt:          org.CreatedAt,
		RestaurantCount:    int(restaurantCount),
	}

	c.JSON(200, response)
}

// UpdateOrganization godoc
// @Summary Update organization
// @Description Update organization details (only for super admins)
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Param organization body UpdateOrganizationRequest true "Organization information"
// @Success 200 {object} OrganizationResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations/{id} [put]
func (h *OrganizationHandler) UpdateOrganization(c *gin.Context) {
	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	var req UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	// Update fields
	if req.Name != nil {
		org.Name = *req.Name
	}

	if err := h.DB.Save(&org).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to update organization"})
		return
	}

	var restaurantCount int64
	h.DB.Model(&db.Restaurant{}).Where("org_id = ?", org.ID).Count(&restaurantCount)

	response := OrganizationResponse{
		ID:                 org.ID.String(),
		Name:               org.Name,
		SubscriptionStatus: org.SubscriptionStatus,
		CreatedAt:          org.CreatedAt,
		RestaurantCount:    int(restaurantCount),
	}

	c.JSON(200, response)
}

// DeleteOrganization godoc
// @Summary Delete organization
// @Description Delete organization and all its restaurants (only for super admins)
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations/{id} [delete]
func (h *OrganizationHandler) DeleteOrganization(c *gin.Context) {
	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	// Delete organization (cascade will handle restaurants)
	if err := h.DB.Delete(&org).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to delete organization"})
		return
	}

	c.Status(http.StatusNoContent)
}

// AssignOwner godoc
// @Summary Assign owner to organization
// @Description Assign an owner to an organization (only for super admins)
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Param assignment body AssignOwnerRequest true "Owner assignment"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations/{id}/assign-owner [post]
func (h *OrganizationHandler) AssignOwner(c *gin.Context) {
	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	var req AssignOwnerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ownerID, err := uuid.Parse(req.OwnerID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid owner ID"})
		return
	}

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	// Check if user exists and is an owner
	var user db.User
	if err := h.DB.Where("id = ? AND role = ?", ownerID, db.RoleOwner).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "owner not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch owner"})
		return
	}

	// Remove owner from any other organization first (allow reassignment)
	if err := h.DB.Where("user_id = ?", ownerID).Delete(&db.OrgMember{}).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to remove existing memberships"})
		return
	}

	// Create new organization membership
	member := db.OrgMember{
		ID:     uuid.New(),
		UserID: ownerID,
		OrgID:  orgID,
		Role:   db.RoleOwner,
	}

	if err := h.DB.Create(&member).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to assign owner to organization"})
		return
	}

	c.JSON(200, gin.H{"message": "owner successfully assigned to organization"})
}

// AssignMultipleUsers godoc
// @Summary Assign multiple users to organization (Super Admin only)
// @Description Assign multiple users to an organization
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Param assignment body AssignMultipleUsersRequest true "User IDs"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations/{id}/assign-users [post]
func (h *OrganizationHandler) AssignMultipleUsers(c *gin.Context) {
	orgID := c.Param("id")
	orgUUID, err := uuid.Parse(orgID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	var req AssignMultipleUsersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgUUID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	// Validate all user IDs
	var users []db.User
	userUUIDs := make([]uuid.UUID, 0, len(req.UserIDs))
	for _, userIDStr := range req.UserIDs {
		userUUID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid user ID: " + userIDStr})
			return
		}
		userUUIDs = append(userUUIDs, userUUID)
	}

	if err := h.DB.Where("id IN ?", userUUIDs).Find(&users).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch users"})
		return
	}

	if len(users) != len(req.UserIDs) {
		c.JSON(400, gin.H{"error": "some users not found"})
		return
	}

	// Remove existing memberships for this organization
	if err := h.DB.Where("org_id = ?", orgUUID).Delete(&db.OrgMember{}).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to remove existing memberships"})
		return
	}

	// Create new memberships
	var orgMembers []db.OrgMember
	for _, user := range users {
		orgMember := db.OrgMember{
			ID:     uuid.New(),
			UserID: user.ID,
			OrgID:  orgUUID,
			Role:   user.Role, // Use the user's role
		}
		orgMembers = append(orgMembers, orgMember)
	}

	if err := h.DB.Create(&orgMembers).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to assign users to organization", "details": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "users successfully assigned to organization"})
}

// GetOrganizationMembers godoc
// @Summary Get organization members
// @Description Get all members of an organization (only for super admins)
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations/{id}/members [get]
func (h *OrganizationHandler) GetOrganizationMembers(c *gin.Context) {
	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	// Get organization members with user details
	var members []struct {
		ID          string    `json:"id"`
		UserID      string    `json:"userId"`
		OrgID       string    `json:"orgId"`
		Role        string    `json:"role"`
		Email       string    `json:"email"`
		DisplayName string    `json:"displayName"`
		CreatedAt   time.Time `json:"createdAt"`
	}

	if err := h.DB.Table("org_members").
		Select("org_members.id, org_members.user_id, org_members.org_id, org_members.role, users.email, users.display_name, users.created_at").
		Joins("JOIN users ON org_members.user_id = users.id").
		Where("org_members.org_id = ?", orgID).
		Scan(&members).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch organization members"})
		return
	}

	c.JSON(200, gin.H{"members": members})
}

// GetMyOrganization godoc
// @Summary Get my organization
// @Description Get the organization that the current user belongs to (for owners)
// @Tags organizations
// @Accept json
// @Produce json
// @Success 200 {object} OrganizationResponse
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /organizations/me [get]
func (h *OrganizationHandler) GetMyOrganization(c *gin.Context) {
	// Get user ID from context
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

	// Get user's organization membership
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userUUID).First(&orgMember).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization membership"})
		return
	}

	// Get organization details
	var org db.Organization
	if err := h.DB.Where("id = ?", orgMember.OrgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	var restaurantCount int64
	h.DB.Model(&db.Restaurant{}).Where("org_id = ?", org.ID).Count(&restaurantCount)

	response := OrganizationResponse{
		ID:                 org.ID.String(),
		Name:               org.Name,
		SubscriptionStatus: org.SubscriptionStatus,
		CreatedAt:          org.CreatedAt,
		RestaurantCount:    int(restaurantCount),
	}

	c.JSON(200, response)
}

// UpdateMyOrganization godoc
// @Summary Update my organization
// @Description Update the organization that the current user belongs to (for owners)
// @Tags organizations
// @Accept json
// @Produce json
// @Param organization body UpdateOrganizationRequest true "Organization information"
// @Success 200 {object} OrganizationResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /organizations/me [put]
func (h *OrganizationHandler) UpdateMyOrganization(c *gin.Context) {
	// Get user ID from context
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

	var req UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Get user's organization membership
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userUUID).First(&orgMember).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization membership"})
		return
	}

	// Get organization details
	var org db.Organization
	if err := h.DB.Where("id = ?", orgMember.OrgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch organization"})
		return
	}

	// Update fields
	if req.Name != nil {
		org.Name = *req.Name
	}

	if err := h.DB.Save(&org).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to update organization"})
		return
	}

	var restaurantCount int64
	h.DB.Model(&db.Restaurant{}).Where("org_id = ?", org.ID).Count(&restaurantCount)

	response := OrganizationResponse{
		ID:                 org.ID.String(),
		Name:               org.Name,
		SubscriptionStatus: org.SubscriptionStatus,
		CreatedAt:          org.CreatedAt,
		RestaurantCount:    int(restaurantCount),
	}

	c.JSON(200, response)
}
