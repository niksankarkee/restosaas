package handlers

import (
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/example/restosaas/apps/api/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PublicHandler struct{ DB *gorm.DB }

func (h *PublicHandler) ListRestaurants(c *gin.Context) {
	area := c.Query("area")
	q := h.DB.Model(&db.Restaurant{})
	if area != "" {
		q = q.Where("area ILIKE ?", area)
	}
	var items []db.Restaurant
	if err := q.Preload("Images").Limit(100).Find(&items).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, items)
}

func (h *PublicHandler) GetRestaurant(c *gin.Context) {
	slug := c.Param("slug")
	var r db.Restaurant
	if err := h.DB.Where("slug = ?", slug).Preload("OpenHours").Preload("Menus.Courses").Preload("Images").First(&r).Error; err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, r)
}

func (h *PublicHandler) GetSlots(c *gin.Context) {
	slug := c.Param("slug")
	dateStr := c.Query("date")
	var r db.Restaurant
	if err := h.DB.Where("slug = ?", slug).First(&r).Error; err != nil {
		c.Status(404)
		return
	}
	d, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid date (YYYY-MM-DD)"})
		return
	}
	slots, err := services.GenerateSlots(h.DB, r.ID.String(), d)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, slots)
}

func (h *PublicHandler) CreateReservation(c *gin.Context) {
	type Req struct {
		RestaurantSlug string                              `json:"restaurantSlug"`
		StartsAt       string                              `json:"startsAt"`
		Duration       int                                 `json:"duration"`
		Party          int                                 `json:"party"`
		Customer       struct{ Name, Email, Phone string } `json:"customer"`
	}
	var req Req
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	var resto db.Restaurant
	if err := h.DB.Where("slug = ?", req.RestaurantSlug).First(&resto).Error; err != nil {
		c.Status(404)
		return
	}
	start, err := time.Parse(time.RFC3339, req.StartsAt)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid time"})
		return
	}
	// customer
	cust := db.Customer{Email: req.Customer.Email, Phone: req.Customer.Phone, Name: req.Customer.Name}
	h.DB.Where("email = ? AND phone = ?", cust.Email, cust.Phone).FirstOrCreate(&cust)
	// capacity
	end := start.Add(time.Duration(req.Duration) * time.Minute)
	var used int64
	h.DB.Model(&db.Reservation{}).
		Where("restaurant_id = ? AND status IN ? AND starts_at < ? AND (starts_at + (duration_min || ' minutes')::interval) > ?",
			resto.ID, []db.ReservationStatus{db.ResvPending, db.ResvConfirmed}, end, start).
		Select("COALESCE(SUM(party_size),0)").Scan(&used)
	if int(used)+req.Party > resto.Capacity {
		c.JSON(409, gin.H{"error": "restaurant is full at that time"})
		return
	}
	resv := db.Reservation{RestaurantID: resto.ID, CustomerID: cust.ID, StartsAt: start, DurationMin: req.Duration, PartySize: req.Party, Status: db.ResvPending}
	if err := h.DB.Create(&resv).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, resv)
}

func (h *PublicHandler) CreateReview(c *gin.Context) {
	type Req struct {
		RestaurantSlug string `json:"restaurantSlug"`
		CustomerID     string `json:"customerId"`
		Rating         int    `json:"rating"`
		Comment        string `json:"comment"`
	}
	var req Req
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	var resto db.Restaurant
	if err := h.DB.Where("slug = ?", req.RestaurantSlug).First(&resto).Error; err != nil {
		c.Status(404)
		return
	}
	rev := db.Review{RestaurantID: resto.ID, Rating: req.Rating, Comment: req.Comment}
	if err := h.DB.Create(&rev).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, rev)
}
