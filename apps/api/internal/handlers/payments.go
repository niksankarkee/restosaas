package handlers

import (
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentHandler struct{ DB *gorm.DB }

// Stub: mark organization active (simulate eSewa/Khalti callback)
func (h *PaymentHandler) ActivateSubscription(c *gin.Context) {
	orgID := c.Param("id")
	if err := h.DB.Model(&db.Organization{}).Where("id = ?", orgID).Update("subscription_status", "ACTIVE").Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.Status(204)
}
