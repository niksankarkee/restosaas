package handlers

import (
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
	c.Status(204)
}

func (h *OwnerHandler) ListReservations(c *gin.Context) {
	uid := c.GetString("uid")
	var member db.OrgMember
	if err := h.DB.Where("user_id = ?", uid).First(&member).Error; err != nil {
		c.Status(404)
		return
	}
	var r db.Restaurant
	if err := h.DB.Where("org_id = ?", member.OrgID).First(&r).Error; err != nil {
		c.Status(404)
		return
	}
	var list []db.Reservation
	from := c.Query("from")
	to := c.Query("to")
	q := h.DB.Where("restaurant_id = ?", r.ID)
	if from != "" {
		q = q.Where("starts_at >= ?", from)
	}
	if to != "" {
		q = q.Where("starts_at < ?", to)
	}
	if err := q.Order("starts_at asc").Find(&list).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}

func (h *OwnerHandler) ApproveReview(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Model(&db.Review{}).Where("id = ?", id).Update("is_approved", true).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.Status(204)
}
