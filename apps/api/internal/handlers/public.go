package handlers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/example/restosaas/apps/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PublicHandler struct {
	DB            *gorm.DB
	SearchService *services.SearchService
}

func NewPublicHandler(db *gorm.DB) *PublicHandler {
	return &PublicHandler{
		DB:            db,
		SearchService: services.NewSearchService(db),
	}
}

// ListRestaurants godoc
// @Summary List restaurants
// @Description Get a list of restaurants with pagination and filtering
// @Tags public
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param sort_by query string false "Sort field" default(rating)
// @Param sort_dir query string false "Sort direction" default(desc)
// @Param area query string false "Filter by area"
// @Param cuisine query string false "Filter by cuisine"
// @Param budget query string false "Filter by budget"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /restaurants [get]
func (h *PublicHandler) ListRestaurants(c *gin.Context) {
	// Parse search parameters
	filters := services.SearchFilters{
		Area:    c.Query("area"),
		Cuisine: c.Query("cuisine"),
		Budget:  c.Query("budget"),
		People:  c.Query("people"),
		Date:    c.Query("date"),
		Time:    c.Query("time"),
		SortBy:  c.DefaultQuery("sort_by", "rating"),
		SortDir: c.DefaultQuery("sort_dir", "desc"),
	}

	// Parse pagination parameters with validation
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			filters.Page = page
		} else {
			filters.Page = 1 // Default to page 1 if invalid
		}
	} else {
		filters.Page = 1
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 && limit <= 100 {
			filters.Limit = limit
		} else {
			filters.Limit = 20 // Default to 20 if invalid
		}
	} else {
		filters.Limit = 20
	}

	// Validate and sanitize other parameters
	if filters.Budget != "" && filters.Budget != "all" && filters.Budget != "$" && filters.Budget != "$$" && filters.Budget != "$$$" && filters.Budget != "$$$$" {
		filters.Budget = "" // Reset invalid budget
	}

	if filters.SortBy != "rating" && filters.SortBy != "name" && filters.SortBy != "created_at" && filters.SortBy != "capacity" {
		filters.SortBy = "rating" // Default to rating sort
	}

	if filters.SortDir != "asc" && filters.SortDir != "desc" {
		filters.SortDir = "desc" // Default to descending
	}

	// Simplified query - just get all open restaurants
	var restaurants []db.Restaurant
	var total int64

	// Get total count first
	if err := h.DB.Model(&db.Restaurant{}).Where("is_open = ?", true).Count(&total).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to count restaurants: " + err.Error()})
		return
	}

	// Get restaurants with pagination
	offset := (filters.Page - 1) * filters.Limit
	if err := h.DB.Where("is_open = ?", true).Offset(offset).Limit(filters.Limit).Find(&restaurants).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch restaurants: " + err.Error()})
		return
	}

	// Convert to response format
	var response []gin.H
	for _, restaurant := range restaurants {
		response = append(response, gin.H{
			"id":          restaurant.ID.String(),
			"slug":        restaurant.Slug,
			"name":        restaurant.Name,
			"slogan":      restaurant.Slogan,
			"place":       restaurant.Place,
			"genre":       restaurant.Genre,
			"budget":      restaurant.Budget,
			"title":       restaurant.Title,
			"description": restaurant.Description,
			"area":        restaurant.Area,
			"address":     restaurant.Address,
			"phone":       restaurant.Phone,
			"capacity":    restaurant.Capacity,
			"isOpen":      restaurant.IsOpen,
			"createdAt":   restaurant.CreatedAt,
			"updatedAt":   restaurant.UpdatedAt,
		})
	}

	c.JSON(200, gin.H{
		"restaurants": response,
		"total":       total,
		"page":        filters.Page,
		"limit":       filters.Limit,
	})
}

// Advanced search endpoint
func (h *PublicHandler) AdvancedSearch(c *gin.Context) {
	query := c.Query("q")
	// Make query optional - if no query provided, search all restaurants

	// Parse search parameters
	filters := services.SearchFilters{
		Area:    c.Query("area"),
		Cuisine: c.Query("cuisine"),
		Budget:  c.Query("budget"),
		People:  c.Query("people"),
		Date:    c.Query("date"),
		Time:    c.Query("time"),
		SortBy:  c.DefaultQuery("sort_by", "rating"),
		SortDir: c.DefaultQuery("sort_dir", "desc"),
	}

	// Parse pagination parameters
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			filters.Page = page
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filters.Limit = limit
		}
	}

	// Use advanced search service
	result, err := h.SearchService.AdvancedSearch(query, filters)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, result)
}

// Search suggestions endpoint
func (h *PublicHandler) SearchSuggestions(c *gin.Context) {
	query := c.Query("q")
	if len(query) < 2 {
		c.JSON(200, gin.H{"suggestions": []string{}})
		return
	}

	// Get restaurant names and cuisines that match the query
	var suggestions []string

	// Search restaurant names
	var restaurants []db.Restaurant
	h.DB.Select("name, genre").Where("name LIKE ?", "%"+query+"%").Limit(5).Find(&restaurants)

	for _, restaurant := range restaurants {
		suggestions = append(suggestions, restaurant.Name)
	}

	// Search unique cuisines
	var cuisines []string
	h.DB.Model(&db.Restaurant{}).Distinct("genre").Where("genre LIKE ?", "%"+query+"%").Limit(5).Pluck("genre", &cuisines)

	suggestions = append(suggestions, cuisines...)

	// Search areas
	var areas []string
	h.DB.Model(&db.Restaurant{}).Distinct("area").Where("area LIKE ?", "%"+query+"%").Limit(5).Pluck("area", &areas)

	// Filter out empty areas and append to suggestions
	for _, area := range areas {
		if area != "" {
			suggestions = append(suggestions, area)
		}
	}

	// Remove duplicates and limit results
	seen := make(map[string]bool)
	var uniqueSuggestions []string
	for _, suggestion := range suggestions {
		if !seen[suggestion] && len(uniqueSuggestions) < 10 {
			seen[suggestion] = true
			uniqueSuggestions = append(uniqueSuggestions, suggestion)
		}
	}

	c.JSON(200, gin.H{"suggestions": uniqueSuggestions})
}

// Cache management endpoints
func (h *PublicHandler) ClearSearchCache(c *gin.Context) {
	h.SearchService.ClearCache()
	c.JSON(200, gin.H{"message": "Cache cleared successfully"})
}

func (h *PublicHandler) GetCacheStats(c *gin.Context) {
	stats := h.SearchService.GetCacheStats()
	c.JSON(200, stats)
}

func (h *PublicHandler) GetRestaurant(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		c.JSON(400, gin.H{"error": "invalid restaurant slug"})
		return
	}
	var r db.Restaurant
	if err := h.DB.Where("slug = ?", slug).First(&r).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get approved reviews for average rating
	var reviews []db.Review
	h.DB.Where("restaurant_id = ? AND is_approved = ?", r.ID, true).Find(&reviews)

	// Calculate average rating
	var totalRating int
	var reviewCount int
	for _, review := range reviews {
		totalRating += review.Rating
		reviewCount++
	}

	avgRating := 0.0
	if reviewCount > 0 {
		avgRating = float64(totalRating) / float64(reviewCount)
	}

	// Get opening hours
	var openHours []db.OpeningHour
	result := h.DB.Where("restaurant_id = ?", r.ID).Find(&openHours)
	fmt.Printf("Query result: %v, Error: %v, Count: %d\n", result.RowsAffected, result.Error, len(openHours))

	// Create response with additional fields
	response := gin.H{
		"ID":          r.ID,
		"Slug":        r.Slug,
		"Name":        r.Name,
		"Slogan":      r.Slogan,
		"Place":       r.Place,
		"Genre":       r.Genre,
		"Budget":      r.Budget,
		"Title":       r.Title,
		"Description": r.Description,
		"Area":        r.Area,
		"Address":     r.Address,
		"Phone":       r.Phone,
		"Timezone":    r.Timezone,
		"Capacity":    r.Capacity,
		"IsOpen":      r.IsOpen,
		"OpenHours":   openHours,
		"Menus":       []db.Menu{},  // Will be populated separately if needed
		"Images":      []db.Image{}, // Will be populated separately if needed
		"MainImageID": r.MainImageID,
		"AvgRating":   avgRating,
		"ReviewCount": reviewCount,
		"CreatedAt":   r.CreatedAt,
		"UpdatedAt":   r.UpdatedAt,
	}

	c.JSON(200, response)
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
		CourseID       *string                             `json:"courseId,omitempty"` // Optional course ID
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
	var cust db.Customer
	err = h.DB.Where("email = ? AND phone = ?", req.Customer.Email, req.Customer.Phone).First(&cust).Error
	if err != nil {
		// Customer doesn't exist, create new one
		cust = db.Customer{
			ID:        uuid.New(),
			Email:     req.Customer.Email,
			Phone:     req.Customer.Phone,
			Name:      req.Customer.Name,
			CreatedAt: time.Now(),
		}
		if err := h.DB.Create(&cust).Error; err != nil {
			c.JSON(500, gin.H{"error": "failed to create customer"})
			return
		}
	}
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
	// Parse course ID if provided
	var courseID *uuid.UUID
	if req.CourseID != nil && *req.CourseID != "" {
		parsedCourseID, err := uuid.Parse(*req.CourseID)
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid course ID"})
			return
		}
		courseID = &parsedCourseID
	}

	resv := db.Reservation{
		ID:           uuid.New(),
		RestaurantID: resto.ID,
		CustomerID:   cust.ID,
		CourseID:     courseID, // Include course ID if provided
		StartsAt:     start,
		DurationMin:  req.Duration,
		PartySize:    req.Party,
		Status:       db.ResvPending,
		CreatedAt:    time.Now(),
	}
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
		CustomerName   string `json:"customerName"`
		Rating         int    `json:"rating"`
		Title          string `json:"title"`
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

	// Parse customer ID if provided
	var customerUUID uuid.UUID
	if req.CustomerID != "" {
		if parsed, err := uuid.Parse(req.CustomerID); err == nil {
			customerUUID = parsed
		}
	}

	rev := db.Review{
		ID:           uuid.New(),
		RestaurantID: resto.ID,
		CustomerID:   customerUUID,
		CustomerName: req.CustomerName,
		Rating:       req.Rating,
		Title:        req.Title,
		Comment:      req.Comment,
		IsApproved:   false, // Reviews need approval
		CreatedAt:    time.Now(),
	}
	if err := h.DB.Create(&rev).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, rev)
}
