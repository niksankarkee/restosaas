package handlers

import (
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"strconv"
)

type OwnerHandler struct{ DB *gorm.DB }

func (h *OwnerHandler) UpdateRestaurant(c *gin.Context) {
	id := c.Param("id")
	var payload struct {
		Name, Area, Address, Phone, Description string
		Capacity                                int
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Model(&db.Restaurant{}).Where("id = ?", id).Updates(map[string]any{
		"name": payload.Name, "area": payload.Area, "address": payload.Address,
		"phone": payload.Phone, "description": payload.Description, "capacity": payload.Capacity,
	}).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Restaurant updated successfully"})
}

func (h *OwnerHandler) ListReservations(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(400, gin.H{"error": "missing user ID"})
		return
	}
	var member db.OrgMember
	if err := h.DB.Where("user_id = ?", uid).First(&member).Error; err != nil {
		c.JSON(404, gin.H{"error": "organization member not found"})
		return
	}
	var r db.Restaurant
	if err := h.DB.Where("org_id = ?", member.OrgID).First(&r).Error; err != nil {
		c.JSON(404, gin.H{"error": "restaurant not found"})
		return
	}
	
	// Parse pagination parameters
	page := 1
	limit := 10
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Build query
	from := c.Query("from")
	to := c.Query("to")
	q := h.DB.Where("restaurant_id = ?", r.ID)
	if from != "" {
		q = q.Where("starts_at >= ?", from)
	}
	if to != "" {
		q = q.Where("starts_at < ?", to)
	}
	
	// Get total count
	var total int64
	if err := q.Model(&db.Reservation{}).Count(&total).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	
	// Get reservations with pagination
	var list []db.Reservation
	if err := q.Order("starts_at asc").Offset(offset).Limit(limit).Find(&list).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(200, gin.H{
		"reservations": list,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *OwnerHandler) ApproveReview(c *gin.Context) {
	// Check authentication
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(400, gin.H{"error": "missing user ID"})
		return
	}
	
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "invalid review ID"})
		return
	}
	
	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(400, gin.H{"error": "invalid review ID format"})
		return
	}
	
	// First check if the review exists
	var review db.Review
	if err := h.DB.Where("id = ?", id).First(&review).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "review not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	
	// Update the review
	if err := h.DB.Model(&review).Update("is_approved", true).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Review approved successfully"})
}
