package handlers

import (
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct{ DB *gorm.DB }

func (h *AdminHandler) UpsertLanding(c *gin.Context) {
	var p db.LandingPage
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if p.Slug == "" {
		c.JSON(400, gin.H{"error": "slug required"})
		return
	}
	var existing db.LandingPage
	if err := h.DB.Where("slug = ?", p.Slug).First(&existing).Error; err == nil {
		existing.Title = p.Title
		existing.BodyMD = p.BodyMD
		existing.Published = p.Published
		h.DB.Save(&existing)
		c.JSON(200, existing)
		return
	}
	h.DB.Create(&p)
	c.JSON(201, p)
}

func (h *AdminHandler) PublicLanding(c *gin.Context) {
	slug := c.Param("slug")
	var p db.LandingPage
	if err := h.DB.Where("slug = ? AND published = true", slug).First(&p).Error; err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, p)
}
