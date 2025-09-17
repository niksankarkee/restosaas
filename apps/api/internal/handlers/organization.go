package handlers

import (
	"net/http"
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
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
}

type OrganizationWithMembersResponse struct {
	OrganizationResponse
	Members []OrganizationMemberResponse `json:"members"`
}

type OrganizationMemberResponse struct {
	ID          string `json:"id"`
	UserID      string `json:"userId"`
	Role        string `json:"role"`
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
}

// POST /api/organizations - Create organization (OWNER only)
func (h *OrganizationHandler) CreateOrganization(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already has an organization
	var existingMember db.OrgMember
	if err := h.DB.Where("user_id = ?", uid).First(&existingMember).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "user already has an organization"})
		return
	}

	// Create organization
	org := db.Organization{
		ID:        uuid.New(),
		Name:      req.Name,
		CreatedAt: time.Now(),
	}

	// Create org member
	orgMember := db.OrgMember{
		ID:     uuid.New(),
		UserID: uuid.MustParse(uid),
		OrgID:  org.ID,
		Role:   db.RoleOwner,
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&org).Error; err != nil {
			return err
		}
		if err := tx.Create(&orgMember).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create organization"})
		return
	}

	c.JSON(http.StatusCreated, OrganizationResponse{
		ID:        org.ID.String(),
		Name:      org.Name,
		CreatedAt: org.CreatedAt,
	})
}

// GET /api/organizations/me - Get my organization (OWNER only)
func (h *OrganizationHandler) GetMyOrganization(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var member db.OrgMember
	if err := h.DB.Where("user_id = ?", uid).First(&member).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
		return
	}

	var org db.Organization
	if err := h.DB.Where("id = ?", member.OrgID).First(&org).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
		return
	}

	// Get organization members
	var members []db.OrgMember
	if err := h.DB.Where("org_id = ?", org.ID).Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch members"})
		return
	}

	// Get user details for each member
	var memberResponses []OrganizationMemberResponse
	for _, m := range members {
		var user db.User
		if err := h.DB.Where("id = ?", m.UserID).First(&user).Error; err != nil {
			// Skip members with invalid user references
			continue
		}

		memberResponses = append(memberResponses, OrganizationMemberResponse{
			ID:          m.ID.String(),
			UserID:      m.UserID.String(),
			Role:        string(m.Role),
			DisplayName: user.DisplayName,
			Email:       user.Email,
		})
	}

	response := OrganizationWithMembersResponse{
		OrganizationResponse: OrganizationResponse{
			ID:        org.ID.String(),
			Name:      org.Name,
			CreatedAt: org.CreatedAt,
		},
		Members: memberResponses,
	}

	c.JSON(http.StatusOK, response)
}

// PUT /api/organizations/me - Update my organization (OWNER only)
func (h *OrganizationHandler) UpdateMyOrganization(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var member db.OrgMember
	if err := h.DB.Where("user_id = ?", uid).First(&member).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
		return
	}

	var org db.Organization
	if err := h.DB.Where("id = ?", member.OrgID).First(&org).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
		return
	}

	var req UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != nil {
		org.Name = *req.Name
	}

	if err := h.DB.Save(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update organization"})
		return
	}

	c.JSON(http.StatusOK, OrganizationResponse{
		ID:        org.ID.String(),
		Name:      org.Name,
		CreatedAt: org.CreatedAt,
	})
}

// GET /api/organizations - List all organizations (SUPER_ADMIN only)
func (h *OrganizationHandler) ListOrganizations(c *gin.Context) {
	var orgs []db.Organization
	if err := h.DB.Find(&orgs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch organizations"})
		return
	}

	var response []OrganizationResponse
	for _, org := range orgs {
		response = append(response, OrganizationResponse{
			ID:        org.ID.String(),
			Name:      org.Name,
			CreatedAt: org.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}
