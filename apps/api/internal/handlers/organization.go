package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/example/restosaas/apps/api/internal/constants"
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/example/restosaas/apps/api/internal/logger"
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
	logger.Debug("CreateOrganization: Starting organization creation process")

	var req CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("CreateOrganization: Invalid request body - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Debugf("CreateOrganization: Processing request for organization %s", req.Name)

	// Create organization
	org := db.Organization{
		ID:                 uuid.New(),
		Name:               req.Name,
		SubscriptionStatus: constants.SubscriptionStatusInactive,
		CreatedAt:          time.Now(),
	}

	if err := h.DB.Create(&org).Error; err != nil {
		logger.Errorf("CreateOrganization: Failed to create organization in database - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToCreateOrganization})
		return
	}

	logger.Infof("CreateOrganization: Organization created successfully with ID %s", org.ID.String())

	response := OrganizationResponse{
		ID:                 org.ID.String(),
		Name:               org.Name,
		SubscriptionStatus: org.SubscriptionStatus,
		CreatedAt:          org.CreatedAt,
		RestaurantCount:    0,
	}

	logger.Infof("CreateOrganization: Organization creation completed successfully for %s", org.Name)
	c.JSON(http.StatusCreated, response)
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
	logger.Debug("ListOrganizations: Starting organization listing process")

	page, _ := strconv.Atoi(c.DefaultQuery("page", constants.DefaultPageStr))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", constants.DefaultLimitStr))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > constants.MaxLimit {
		limit = constants.DefaultLimit
	}

	offset := (page - 1) * limit

	logger.Debugf("ListOrganizations: Fetching organizations with page=%d, limit=%d, offset=%d", page, limit, offset)

	var organizations []db.Organization
	var total int64

	// Get total count
	if err := h.DB.Model(&db.Organization{}).Count(&total).Error; err != nil {
		logger.Errorf("ListOrganizations: Failed to count organizations - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToCountOrganizations})
		return
	}

	// Get organizations
	if err := h.DB.Offset(offset).Limit(limit).Find(&organizations).Error; err != nil {
		logger.Errorf("ListOrganizations: Failed to fetch organizations - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganizations})
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

	logger.Infof("ListOrganizations: Successfully fetched %d organizations (page %d of %d)", len(response), page, (int(total)+limit-1)/limit)

	c.JSON(http.StatusOK, gin.H{
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
	logger.Debug("GetOrganization: Starting organization retrieval process")

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("GetOrganization: Invalid organization ID format - %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidOrganizationID})
		return
	}

	logger.Debugf("GetOrganization: Fetching organization with ID %s", orgID.String())

	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("GetOrganization: Organization not found with ID %s", orgID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("GetOrganization: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
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

	logger.Infof("GetOrganization: Successfully retrieved organization %s", org.Name)
	c.JSON(http.StatusOK, response)
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
	logger.Debug("UpdateOrganization: Starting organization update process")

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("UpdateOrganization: Invalid organization ID format - %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidOrganizationID})
		return
	}

	var req UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("UpdateOrganization: Invalid request body - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Debugf("UpdateOrganization: Updating organization with ID %s", orgID.String())

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("UpdateOrganization: Organization not found with ID %s", orgID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("UpdateOrganization: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
		return
	}

	// Update fields
	if req.Name != nil {
		org.Name = *req.Name
	}

	if err := h.DB.Save(&org).Error; err != nil {
		logger.Errorf("UpdateOrganization: Failed to update organization in database - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToUpdateOrganization})
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

	logger.Infof("UpdateOrganization: Successfully updated organization %s", org.Name)
	c.JSON(http.StatusOK, response)
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
	logger.Debug("DeleteOrganization: Starting organization deletion process")

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("DeleteOrganization: Invalid organization ID format - %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidOrganizationID})
		return
	}

	logger.Debugf("DeleteOrganization: Deleting organization with ID %s", orgID.String())

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("DeleteOrganization: Organization not found with ID %s", orgID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("DeleteOrganization: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
		return
	}

	// Delete organization (cascade will handle restaurants)
	if err := h.DB.Delete(&org).Error; err != nil {
		logger.Errorf("DeleteOrganization: Failed to delete organization from database - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToDeleteOrganization})
		return
	}

	logger.Infof("DeleteOrganization: Successfully deleted organization %s", org.Name)
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
	logger.Debug("AssignOwner: Starting owner assignment process")

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("AssignOwner: Invalid organization ID format - %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidOrganizationID})
		return
	}

	var req AssignOwnerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("AssignOwner: Invalid request body - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ownerID, err := uuid.Parse(req.OwnerID)
	if err != nil {
		logger.Warnf("AssignOwner: Invalid owner ID format - %s", req.OwnerID)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidOwnerID})
		return
	}

	logger.Debugf("AssignOwner: Assigning owner %s to organization %s", ownerID.String(), orgID.String())

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("AssignOwner: Organization not found with ID %s", orgID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("AssignOwner: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
		return
	}

	// Check if user exists and is an owner
	var user db.User
	if err := h.DB.Where("id = ? AND role = ?", ownerID, db.RoleOwner).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("AssignOwner: Owner not found with ID %s", ownerID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOwnerNotFound})
			return
		}
		logger.Errorf("AssignOwner: Failed to fetch owner - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOwner})
		return
	}

	// Remove owner from any other organization first (allow reassignment)
	if err := h.DB.Where("user_id = ?", ownerID).Delete(&db.OrgMember{}).Error; err != nil {
		logger.Errorf("AssignOwner: Failed to remove existing memberships - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToRemoveExistingMemberships})
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
		logger.Errorf("AssignOwner: Failed to assign owner to organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToAssignOwnerToOrganization})
		return
	}

	logger.Infof("AssignOwner: Successfully assigned owner %s to organization %s", user.Email, org.Name)
	c.JSON(http.StatusOK, gin.H{"message": constants.MsgOwnerSuccessfullyAssignedToOrganization})
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
	logger.Debug("AssignMultipleUsers: Starting multiple users assignment process")

	orgID := c.Param("id")
	orgUUID, err := uuid.Parse(orgID)
	if err != nil {
		logger.Warnf("AssignMultipleUsers: Invalid organization ID format - %s", orgID)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidOrganizationID})
		return
	}

	var req AssignMultipleUsersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("AssignMultipleUsers: Invalid request body - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Debugf("AssignMultipleUsers: Assigning %d users to organization %s", len(req.UserIDs), orgUUID.String())

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgUUID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("AssignMultipleUsers: Organization not found with ID %s", orgUUID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("AssignMultipleUsers: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
		return
	}

	// Validate all user IDs
	var users []db.User
	userUUIDs := make([]uuid.UUID, 0, len(req.UserIDs))
	for _, userIDStr := range req.UserIDs {
		userUUID, err := uuid.Parse(userIDStr)
		if err != nil {
			logger.Warnf("AssignMultipleUsers: Invalid user ID format - %s", userIDStr)
			c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidUserID + ": " + userIDStr})
			return
		}
		userUUIDs = append(userUUIDs, userUUID)
	}

	if err := h.DB.Where("id IN ?", userUUIDs).Find(&users).Error; err != nil {
		logger.Errorf("AssignMultipleUsers: Failed to fetch users - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchUsers})
		return
	}

	if len(users) != len(req.UserIDs) {
		logger.Warnf("AssignMultipleUsers: Some users not found. Expected %d, found %d", len(req.UserIDs), len(users))
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrSomeUsersNotFound})
		return
	}

	// Remove existing memberships for this organization
	if err := h.DB.Where("org_id = ?", orgUUID).Delete(&db.OrgMember{}).Error; err != nil {
		logger.Errorf("AssignMultipleUsers: Failed to remove existing memberships - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToRemoveExistingMemberships})
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
		logger.Errorf("AssignMultipleUsers: Failed to assign users to organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToAssignUsersToOrganization, "details": err.Error()})
		return
	}

	logger.Infof("AssignMultipleUsers: Successfully assigned %d users to organization %s", len(orgMembers), org.Name)
	c.JSON(http.StatusOK, gin.H{"message": constants.MsgUsersSuccessfullyAssignedToOrganization})
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
	logger.Debug("GetOrganizationMembers: Starting organization members retrieval process")

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		logger.Warnf("GetOrganizationMembers: Invalid organization ID format - %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidOrganizationID})
		return
	}

	logger.Debugf("GetOrganizationMembers: Fetching members for organization %s", orgID.String())

	// Check if organization exists
	var org db.Organization
	if err := h.DB.Where("id = ?", orgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("GetOrganizationMembers: Organization not found with ID %s", orgID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("GetOrganizationMembers: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
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
		logger.Errorf("GetOrganizationMembers: Failed to fetch organization members - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganizationMembers})
		return
	}

	logger.Infof("GetOrganizationMembers: Successfully fetched %d members for organization %s", len(members), org.Name)
	c.JSON(http.StatusOK, gin.H{"members": members})
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
	logger.Debug("GetMyOrganization: Starting my organization retrieval process")

	// Get user ID from context
	userID, exists := c.Get("uid")
	if !exists {
		logger.Warn("GetMyOrganization: User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": constants.ErrUnauthorized})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		logger.Warn("GetMyOrganization: Invalid user ID type in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": constants.ErrInvalidUserID})
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		logger.Warnf("GetMyOrganization: Invalid user ID format - %s", userIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidUserIDFormat})
		return
	}

	logger.Debugf("GetMyOrganization: Fetching organization for user %s", userUUID.String())

	// Get user's organization membership
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userUUID).First(&orgMember).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("GetMyOrganization: Organization membership not found for user %s", userUUID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("GetMyOrganization: Failed to fetch organization membership - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganizationMembership})
		return
	}

	// Get organization details
	var org db.Organization
	if err := h.DB.Where("id = ?", orgMember.OrgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("GetMyOrganization: Organization not found with ID %s", orgMember.OrgID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("GetMyOrganization: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
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

	logger.Infof("GetMyOrganization: Successfully retrieved organization %s for user %s", org.Name, userUUID.String())
	c.JSON(http.StatusOK, response)
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
	logger.Debug("UpdateMyOrganization: Starting my organization update process")

	// Get user ID from context
	userID, exists := c.Get("uid")
	if !exists {
		logger.Warn("UpdateMyOrganization: User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": constants.ErrUnauthorized})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		logger.Warn("UpdateMyOrganization: Invalid user ID type in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": constants.ErrInvalidUserID})
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		logger.Warnf("UpdateMyOrganization: Invalid user ID format - %s", userIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": constants.ErrInvalidUserIDFormat})
		return
	}

	var req UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warnf("UpdateMyOrganization: Invalid request body - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Debugf("UpdateMyOrganization: Updating organization for user %s", userUUID.String())

	// Get user's organization membership
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userUUID).First(&orgMember).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("UpdateMyOrganization: Organization membership not found for user %s", userUUID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("UpdateMyOrganization: Failed to fetch organization membership - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganizationMembership})
		return
	}

	// Get organization details
	var org db.Organization
	if err := h.DB.Where("id = ?", orgMember.OrgID).First(&org).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Warnf("UpdateMyOrganization: Organization not found with ID %s", orgMember.OrgID.String())
			c.JSON(http.StatusNotFound, gin.H{"error": constants.ErrOrganizationNotFound})
			return
		}
		logger.Errorf("UpdateMyOrganization: Failed to fetch organization - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToFetchOrganization})
		return
	}

	// Update fields
	if req.Name != nil {
		org.Name = *req.Name
	}

	if err := h.DB.Save(&org).Error; err != nil {
		logger.Errorf("UpdateMyOrganization: Failed to update organization in database - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": constants.ErrFailedToUpdateOrganization})
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

	logger.Infof("UpdateMyOrganization: Successfully updated organization %s for user %s", org.Name, userUUID.String())
	c.JSON(http.StatusOK, response)
}
