package handlers

import (
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentHandler struct{ DB *gorm.DB }

// Stub: mark organization active (simulate eSewa/Khalti callback)
func (h *PaymentHandler) ActivateSubscription(c *gin.Context) {
	orgID := c.Param("id")
	if orgID == "" {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	// Validate UUID format
	if _, err := uuid.Parse(orgID); err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID format"})
		return
	}

	result := h.DB.Model(&db.Organization{}).Where("id = ?", orgID).Update("subscription_status", "ACTIVE")
	if err := result.Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Check if any records were affected
	if result.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "organization not found"})
		return
	}

	c.JSON(200, gin.H{"message": "Subscription activated successfully"})
}
