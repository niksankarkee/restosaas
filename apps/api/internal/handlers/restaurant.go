package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RestaurantHandler struct{ DB *gorm.DB }

// CreateRestaurantRequest represents the request to create a restaurant
type CreateRestaurantRequest struct {
	Name        string `json:"name" binding:"required"`
	Slogan      string `json:"slogan" binding:"required"`
	Place       string `json:"place" binding:"required"`
	Genre       string `json:"genre" binding:"required"`
	Budget      string `json:"budget" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Address     string `json:"address"`
	Phone       string `json:"phone"`
	Capacity    int    `json:"capacity" binding:"min=1"`
	IsOpen      bool   `json:"isOpen"`
}

// UpdateRestaurantRequest represents the request to update a restaurant
type UpdateRestaurantRequest struct {
	Name        *string              `json:"name,omitempty"`
	Slogan      *string              `json:"slogan,omitempty"`
	Place       *string              `json:"place,omitempty"`
	Genre       *string              `json:"genre,omitempty"`
	Budget      *string              `json:"budget,omitempty"`
	Title       *string              `json:"title,omitempty"`
	Description *string              `json:"description,omitempty"`
	Address     *string              `json:"address,omitempty"`
	Phone       *string              `json:"phone,omitempty"`
	Capacity    *int                 `json:"capacity,omitempty"`
	IsOpen      *bool                `json:"isOpen,omitempty"`
	MainImageID *string              `json:"mainImageId,omitempty"`
	OpenHours   []OpeningHourRequest `json:"openHours,omitempty"`
	Images      []ImageRequest       `json:"images,omitempty"`
}

// OpeningHourRequest represents opening hours for a specific day
type OpeningHourRequest struct {
	Weekday   int    `json:"weekday"`   // 0=Sunday, 1=Monday, ..., 6=Saturday
	OpenTime  string `json:"openTime"`  // Format: "09:00"
	CloseTime string `json:"closeTime"` // Format: "22:00"
	IsClosed  bool   `json:"isClosed"`  // If restaurant is closed on this day
}

// ImageRequest represents an image upload request
type ImageRequest struct {
	URL          string `json:"url"`
	Alt          string `json:"alt"`
	IsMain       bool   `json:"isMain"`
	DisplayOrder int    `json:"displayOrder"`
}

// RestaurantResponse represents a restaurant in API responses
type RestaurantResponse struct {
	ID          string                `json:"id"`
	Slug        string                `json:"slug"`
	Name        string                `json:"name"`
	Slogan      string                `json:"slogan"`
	Place       string                `json:"place"`
	Genre       string                `json:"genre"`
	Budget      string                `json:"budget"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	Address     string                `json:"address"`
	Phone       string                `json:"phone"`
	Capacity    int                   `json:"capacity"`
	IsOpen      bool                  `json:"isOpen"`
	MainImageID *string               `json:"mainImageId,omitempty"`
	OpenHours   []OpeningHourResponse `json:"openHours,omitempty"`
	Images      []ImageResponse       `json:"images,omitempty"`
	CreatedAt   time.Time             `json:"createdAt"`
	UpdatedAt   time.Time             `json:"updatedAt"`
}

type OpeningHourResponse struct {
	ID        string `json:"id"`
	Weekday   int    `json:"weekday"`
	OpenTime  string `json:"openTime"`
	CloseTime string `json:"closeTime"`
	IsClosed  bool   `json:"isClosed"`
}

type ImageResponse struct {
	ID           string `json:"id"`
	URL          string `json:"url"`
	Alt          string `json:"alt"`
	IsMain       bool   `json:"isMain"`
	DisplayOrder int    `json:"displayOrder"`
}

// CreateMenuRequest represents the request to create a menu
// These types are now defined in the separate menu.go and courses.go handlers

// POST /api/owner/restaurants - Create restaurant (OWNER only)
func (h *RestaurantHandler) CreateRestaurant(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	var req CreateRestaurantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Get user's organization
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userID).First(&orgMember).Error; err != nil {
		c.JSON(404, gin.H{"error": "organization not found"})
		return
	}

	// Generate slug from name
	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))

	// Check if restaurant with same slug already exists
	var existingRestaurant db.Restaurant
	if err := h.DB.Where("slug = ?", slug).First(&existingRestaurant).Error; err == nil {
		c.JSON(409, gin.H{"error": "restaurant with this name already exists"})
		return
	}

	// Create restaurant
	restaurant := db.Restaurant{
		ID:          uuid.New(),
		OrgID:       orgMember.OrgID,
		Slug:        slug,
		Name:        req.Name,
		Slogan:      req.Slogan,
		Place:       req.Place,
		Genre:       req.Genre,
		Budget:      req.Budget,
		Title:       req.Title,
		Description: req.Description,
		Address:     req.Address,
		Phone:       req.Phone,
		Capacity:    req.Capacity,
		IsOpen:      req.IsOpen,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.DB.Create(&restaurant).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create restaurant"})
		return
	}

	response := RestaurantResponse{
		ID:          restaurant.ID.String(),
		Slug:        restaurant.Slug,
		Name:        restaurant.Name,
		Slogan:      restaurant.Slogan,
		Place:       restaurant.Place,
		Genre:       restaurant.Genre,
		Budget:      restaurant.Budget,
		Title:       restaurant.Title,
		Description: restaurant.Description,
		Address:     restaurant.Address,
		Phone:       restaurant.Phone,
		Capacity:    restaurant.Capacity,
		IsOpen:      restaurant.IsOpen,
		CreatedAt:   restaurant.CreatedAt,
		UpdatedAt:   restaurant.UpdatedAt,
	}

	c.JSON(201, response)
}

// GET /api/owner/restaurants/me - Get owner's restaurant (OWNER only)
func (h *RestaurantHandler) GetMyRestaurant(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	// Get user's organization
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userID).First(&orgMember).Error; err != nil {
		c.JSON(404, gin.H{"error": "organization not found"})
		return
	}

	// Get all restaurants for the organization
	var restaurants []db.Restaurant
	if err := h.DB.Where("org_id = ?", orgMember.OrgID).Preload("Images").Preload("OpenHours").Preload("Menus").Preload("Courses").Find(&restaurants).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch restaurants"})
		return
	}

	// Convert to response format
	var response []RestaurantResponse
	for _, restaurant := range restaurants {
		mainImageID := ""
		if restaurant.MainImageID != nil {
			mainImageID = restaurant.MainImageID.String()
		}

		restaurantResponse := RestaurantResponse{
			ID:          restaurant.ID.String(),
			Slug:        restaurant.Slug,
			Name:        restaurant.Name,
			Slogan:      restaurant.Slogan,
			Place:       restaurant.Place,
			Genre:       restaurant.Genre,
			Budget:      restaurant.Budget,
			Title:       restaurant.Title,
			Description: restaurant.Description,
			Address:     restaurant.Address,
			Phone:       restaurant.Phone,
			Capacity:    restaurant.Capacity,
			IsOpen:      restaurant.IsOpen,
			MainImageID: &mainImageID,
			CreatedAt:   restaurant.CreatedAt,
			UpdatedAt:   restaurant.UpdatedAt,
		}

		// Convert opening hours
		for _, hour := range restaurant.OpenHours {
			restaurantResponse.OpenHours = append(restaurantResponse.OpenHours, OpeningHourResponse{
				ID:        hour.ID.String(),
				Weekday:   hour.Weekday,
				OpenTime:  hour.OpenTime,
				CloseTime: hour.CloseTime,
				IsClosed:  hour.IsClosed,
			})
		}

		// Convert images
		for _, img := range restaurant.Images {
			restaurantResponse.Images = append(restaurantResponse.Images, ImageResponse{
				ID:           img.ID.String(),
				URL:          img.URL,
				Alt:          img.Alt,
				IsMain:       img.IsMain,
				DisplayOrder: img.DisplayOrder,
			})
		}

		response = append(response, restaurantResponse)
	}

	c.JSON(200, gin.H{"restaurants": response})
}

// PUT /api/owner/restaurants/:id - Update restaurant (OWNER or SUPER_ADMIN)
func (h *RestaurantHandler) UpdateRestaurant(c *gin.Context) {
	// Get user ID and role from context
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	userRole, roleExists := c.Get("role")
	if !roleExists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	// Get restaurant ID from URL
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	var req UpdateRestaurantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Get restaurant first
	var restaurant db.Restaurant
	if err := h.DB.Where("id = ?", restaurantUUID).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// Check access control
	if userRole == string(db.RoleSuper) {
		// SUPER_ADMIN can edit any restaurant
	} else if userRole == string(db.RoleOwner) {
		// OWNER can only edit their own restaurant
		var orgMember db.OrgMember
		if err := h.DB.Where("user_id = ?", userID).First(&orgMember).Error; err != nil {
			c.JSON(404, gin.H{"error": "organization not found"})
			return
		}

		if restaurant.OrgID != orgMember.OrgID {
			c.JSON(403, gin.H{"error": "access denied: you can only edit your own restaurant"})
			return
		}
	} else {
		c.JSON(403, gin.H{"error": "access denied: insufficient permissions"})
		return
	}

	// Update fields
	if req.Name != nil {
		restaurant.Name = *req.Name
		// Update slug if name changed
		restaurant.Slug = strings.ToLower(strings.ReplaceAll(*req.Name, " ", "-"))
	}
	if req.Slogan != nil {
		restaurant.Slogan = *req.Slogan
	}
	if req.Place != nil {
		restaurant.Place = *req.Place
	}
	if req.Genre != nil {
		restaurant.Genre = *req.Genre
	}
	if req.Budget != nil {
		restaurant.Budget = *req.Budget
	}
	if req.Title != nil {
		restaurant.Title = *req.Title
	}
	if req.Description != nil {
		restaurant.Description = *req.Description
	}
	if req.Address != nil {
		restaurant.Address = *req.Address
	}
	if req.Phone != nil {
		restaurant.Phone = *req.Phone
	}
	if req.Capacity != nil {
		restaurant.Capacity = *req.Capacity
	}
	if req.IsOpen != nil {
		restaurant.IsOpen = *req.IsOpen
	}

	restaurant.UpdatedAt = time.Now()

	if err := h.DB.Save(&restaurant).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to update restaurant"})
		return
	}

	response := RestaurantResponse{
		ID:          restaurant.ID.String(),
		Slug:        restaurant.Slug,
		Name:        restaurant.Name,
		Slogan:      restaurant.Slogan,
		Place:       restaurant.Place,
		Genre:       restaurant.Genre,
		Budget:      restaurant.Budget,
		Title:       restaurant.Title,
		Description: restaurant.Description,
		Address:     restaurant.Address,
		Phone:       restaurant.Phone,
		Capacity:    restaurant.Capacity,
		IsOpen:      restaurant.IsOpen,
		CreatedAt:   restaurant.CreatedAt,
		UpdatedAt:   restaurant.UpdatedAt,
	}

	c.JSON(200, response)
}

// DELETE /api/owner/restaurants/:id - Delete restaurant (OWNER only)
func (h *RestaurantHandler) DeleteRestaurant(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	// Get restaurant ID from URL
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	// Get user's organization
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userID).First(&orgMember).Error; err != nil {
		c.JSON(404, gin.H{"error": "organization not found"})
		return
	}

	// Get restaurant and verify ownership
	var restaurant db.Restaurant
	if err := h.DB.Where("id = ? AND org_id = ?", restaurantUUID, orgMember.OrgID).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// Delete restaurant (cascade will handle related records)
	if err := h.DB.Delete(&restaurant).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to delete restaurant"})
		return
	}

	c.Status(http.StatusNoContent)
}

// GET /api/super-admin/restaurants - List all restaurants (SUPER_ADMIN only)
func (h *RestaurantHandler) ListAllRestaurants(c *gin.Context) {
	// Get all restaurants with organization information
	var restaurants []struct {
		ID          string    `json:"id"`
		Slug        string    `json:"slug"`
		Name        string    `json:"name"`
		Slogan      string    `json:"slogan"`
		Place       string    `json:"place"`
		Genre       string    `json:"genre"`
		Budget      string    `json:"budget"`
		Title       string    `json:"title"`
		Description string    `json:"description"`
		Address     string    `json:"address"`
		Phone       string    `json:"phone"`
		Capacity    int       `json:"capacity"`
		IsOpen      bool      `json:"isOpen"`
		CreatedAt   time.Time `json:"createdAt"`
		UpdatedAt   time.Time `json:"updatedAt"`
		OrgID       string    `json:"orgId"`
		OrgName     string    `json:"orgName"`
		OwnerName   string    `json:"ownerName"`
		OwnerEmail  string    `json:"ownerEmail"`
	}

	if err := h.DB.Table("restaurants").
		Select("restaurants.id, restaurants.slug, restaurants.name, restaurants.slogan, restaurants.place, restaurants.genre, restaurants.budget, restaurants.title, restaurants.description, restaurants.address, restaurants.phone, restaurants.capacity, restaurants.is_open, restaurants.created_at, restaurants.updated_at, restaurants.org_id, organizations.name as org_name, users.display_name as owner_name, users.email as owner_email").
		Joins("JOIN organizations ON restaurants.org_id = organizations.id").
		Joins("JOIN org_members ON organizations.id = org_members.org_id").
		Joins("JOIN users ON org_members.user_id = users.id").
		Where("org_members.role = ?", db.RoleOwner).
		Find(&restaurants).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch restaurants"})
		return
	}

	c.JSON(200, gin.H{"restaurants": restaurants})
}

// GET /api/super-admin/restaurants/:id - Get restaurant by ID (SUPER_ADMIN only)
func (h *RestaurantHandler) GetRestaurantByID(c *gin.Context) {
	// Get restaurant ID from URL
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	// Get restaurant with organization information
	var result struct {
		ID          string    `json:"id"`
		Slug        string    `json:"slug"`
		Name        string    `json:"name"`
		Slogan      string    `json:"slogan"`
		Place       string    `json:"place"`
		Genre       string    `json:"genre"`
		Budget      string    `json:"budget"`
		Title       string    `json:"title"`
		Description string    `json:"description"`
		Address     string    `json:"address"`
		Phone       string    `json:"phone"`
		Capacity    int       `json:"capacity"`
		IsOpen      bool      `json:"isOpen"`
		CreatedAt   time.Time `json:"createdAt"`
		UpdatedAt   time.Time `json:"updatedAt"`
		OrgID       string    `json:"orgId"`
		OrgName     string    `json:"orgName"`
		OwnerName   string    `json:"ownerName"`
		OwnerEmail  string    `json:"ownerEmail"`
	}

	if err := h.DB.Table("restaurants").
		Select("restaurants.id, restaurants.slug, restaurants.name, restaurants.slogan, restaurants.place, restaurants.genre, restaurants.budget, restaurants.title, restaurants.description, restaurants.address, restaurants.phone, restaurants.capacity, restaurants.is_open, restaurants.created_at, restaurants.updated_at, restaurants.org_id, organizations.name as org_name, users.display_name as owner_name, users.email as owner_email").
		Joins("JOIN organizations ON restaurants.org_id = organizations.id").
		Joins("JOIN org_members ON organizations.id = org_members.org_id").
		Joins("JOIN users ON org_members.user_id = users.id").
		Where("restaurants.id = ? AND org_members.role = ?", restaurantUUID, db.RoleOwner).
		First(&result).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	c.JSON(200, result)
}

// POST /api/owner/restaurants/:id/hours - Set opening hours (OWNER only)
func (h *RestaurantHandler) SetOpeningHours(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	// Get restaurant ID from URL
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	var req struct {
		OpenHours []OpeningHourRequest `json:"openHours" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Verify restaurant ownership
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userID).First(&orgMember).Error; err != nil {
		c.JSON(404, gin.H{"error": "organization not found"})
		return
	}

	var restaurant db.Restaurant
	if err := h.DB.Where("id = ? AND org_id = ?", restaurantUUID, orgMember.OrgID).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// Delete existing opening hours
	if err := h.DB.Where("restaurant_id = ?", restaurantUUID).Delete(&db.OpeningHour{}).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to delete existing hours"})
		return
	}

	// Create new opening hours
	for _, hour := range req.OpenHours {
		openingHour := db.OpeningHour{
			ID:           uuid.New(),
			RestaurantID: restaurantUUID,
			Weekday:      hour.Weekday,
			OpenTime:     hour.OpenTime,
			CloseTime:    hour.CloseTime,
			IsClosed:     hour.IsClosed,
		}
		if err := h.DB.Create(&openingHour).Error; err != nil {
			c.JSON(500, gin.H{"error": "failed to create opening hour"})
			return
		}
	}

	c.JSON(200, gin.H{"message": "opening hours updated successfully"})
}

// POST /api/owner/restaurants/:id/images - Upload images (OWNER only)
func (h *RestaurantHandler) UploadImages(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	// Get restaurant ID from URL
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	var req struct {
		Images []ImageRequest `json:"images" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Verify restaurant ownership
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userID).First(&orgMember).Error; err != nil {
		c.JSON(404, gin.H{"error": "organization not found"})
		return
	}

	var restaurant db.Restaurant
	if err := h.DB.Where("id = ? AND org_id = ?", restaurantUUID, orgMember.OrgID).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// If any image is marked as main, unset current main image
	hasMainImage := false
	for _, img := range req.Images {
		if img.IsMain {
			hasMainImage = true
			break
		}
	}

	if hasMainImage {
		// Unset current main image
		if err := h.DB.Model(&restaurant).Update("main_image_id", nil).Error; err != nil {
			c.JSON(500, gin.H{"error": "failed to update main image"})
			return
		}
	}

	// Create new images
	var createdImages []db.Image
	for _, img := range req.Images {
		image := db.Image{
			ID:           uuid.New(),
			RestaurantID: restaurantUUID,
			URL:          img.URL,
			Alt:          img.Alt,
			IsMain:       img.IsMain,
			DisplayOrder: img.DisplayOrder,
		}
		if err := h.DB.Create(&image).Error; err != nil {
			c.JSON(500, gin.H{"error": "failed to create image"})
			return
		}

		// If this is the main image, update restaurant
		if img.IsMain {
			if err := h.DB.Model(&restaurant).Update("main_image_id", image.ID).Error; err != nil {
				c.JSON(500, gin.H{"error": "failed to set main image"})
				return
			}
		}

		createdImages = append(createdImages, image)
	}

	c.JSON(201, gin.H{
		"message": "images uploaded successfully",
		"images":  createdImages,
	})
}

// GET /api/restaurants/:slug/reviews - Get restaurant reviews (public)
func (h *RestaurantHandler) GetRestaurantReviews(c *gin.Context) {
	slug := c.Param("slug")

	// Get restaurant
	var restaurant db.Restaurant
	if err := h.DB.Where("slug = ?", slug).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// Get approved reviews
	var reviews []db.Review
	if err := h.DB.Where("restaurant_id = ? AND is_approved = ?", restaurant.ID, true).
		Order("created_at DESC").Find(&reviews).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch reviews"})
		return
	}

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

	c.JSON(200, gin.H{
		"reviews":     reviews,
		"avgRating":   avgRating,
		"reviewCount": reviewCount,
	})
}

// POST /api/owner/restaurants/:id/images/:imageId/set-main - Set main image
func (h *RestaurantHandler) SetMainImage(c *gin.Context) {
	restaurantID := c.Param("id")
	imageID := c.Param("imageId")

	// Parse UUIDs
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	imageUUID, err := uuid.Parse(imageID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid image ID"})
		return
	}

	// Check if restaurant exists
	var restaurant db.Restaurant
	if err := h.DB.Where("id = ?", restaurantUUID).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// Check if image exists and belongs to this restaurant
	var image db.Image
	if err := h.DB.Where("id = ? AND restaurant_id = ?", imageUUID, restaurantUUID).First(&image).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "image not found or doesn't belong to this restaurant"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch image"})
		return
	}

	// Start transaction to ensure only one main image
	err = h.DB.Transaction(func(tx *gorm.DB) error {
		// Set all images for this restaurant to not main
		if err := tx.Model(&db.Image{}).Where("restaurant_id = ?", restaurantUUID).Update("is_main", false).Error; err != nil {
			return err
		}

		// Set the selected image as main
		if err := tx.Model(&image).Update("is_main", true).Error; err != nil {
			return err
		}

		// Update restaurant's main_image_id
		if err := tx.Model(&restaurant).Update("main_image_id", imageUUID).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": "failed to set main image"})
		return
	}

	c.JSON(200, gin.H{
		"message": "main image set successfully",
		"imageId": imageID,
	})
}

// CreateRestaurantForOrganization godoc
// @Summary Create restaurant for organization (Super Admin only)
// @Description Create a new restaurant for a specific organization (only for super admins)
// @Tags restaurants
// @Accept json
// @Produce json
// @Param organizationId path string true "Organization ID"
// @Param restaurant body CreateRestaurantRequest true "Restaurant information"
// @Success 201 {object} RestaurantResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/organizations/{id}/restaurants [post]
func (h *RestaurantHandler) CreateRestaurantForOrganization(c *gin.Context) {
	organizationID := c.Param("id")
	orgUUID, err := uuid.Parse(organizationID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid organization ID"})
		return
	}

	var req CreateRestaurantRequest
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

	// Generate slug from name
	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))

	// Check if restaurant with same slug already exists
	var existingRestaurant db.Restaurant
	if err := h.DB.Where("slug = ?", slug).First(&existingRestaurant).Error; err == nil {
		c.JSON(409, gin.H{"error": "restaurant with this name already exists"})
		return
	}

	// Create restaurant
	restaurant := db.Restaurant{
		ID:          uuid.New(),
		OrgID:       orgUUID,
		Slug:        slug,
		Name:        req.Name,
		Slogan:      req.Slogan,
		Place:       req.Place,
		Genre:       req.Genre,
		Budget:      req.Budget,
		Title:       req.Title,
		Description: req.Description,
		Address:     req.Address,
		Phone:       req.Phone,
		Capacity:    req.Capacity,
		IsOpen:      req.IsOpen,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.DB.Create(&restaurant).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create restaurant"})
		return
	}

	// Get owner information
	var owner db.User
	h.DB.Table("org_members").
		Select("users.*").
		Joins("JOIN users ON org_members.user_id = users.id").
		Where("org_members.org_id = ? AND org_members.role = ?", orgUUID, db.RoleOwner).
		First(&owner)

	response := struct {
		ID          string    `json:"id"`
		Slug        string    `json:"slug"`
		Name        string    `json:"name"`
		Slogan      string    `json:"slogan"`
		Place       string    `json:"place"`
		Genre       string    `json:"genre"`
		Budget      string    `json:"budget"`
		Title       string    `json:"title"`
		Description string    `json:"description"`
		Address     string    `json:"address"`
		Phone       string    `json:"phone"`
		Capacity    int       `json:"capacity"`
		IsOpen      bool      `json:"isOpen"`
		CreatedAt   time.Time `json:"createdAt"`
		UpdatedAt   time.Time `json:"updatedAt"`
		OrgID       string    `json:"orgId"`
		OrgName     string    `json:"orgName"`
		OwnerName   string    `json:"ownerName"`
		OwnerEmail  string    `json:"ownerEmail"`
	}{
		ID:          restaurant.ID.String(),
		Slug:        restaurant.Slug,
		Name:        restaurant.Name,
		Slogan:      restaurant.Slogan,
		Place:       restaurant.Place,
		Genre:       restaurant.Genre,
		Budget:      restaurant.Budget,
		Title:       restaurant.Title,
		Description: restaurant.Description,
		Address:     restaurant.Address,
		Phone:       restaurant.Phone,
		Capacity:    restaurant.Capacity,
		IsOpen:      restaurant.IsOpen,
		CreatedAt:   restaurant.CreatedAt,
		UpdatedAt:   restaurant.UpdatedAt,
		OrgID:       org.ID.String(),
		OrgName:     org.Name,
		OwnerName:   owner.DisplayName,
		OwnerEmail:  owner.Email,
	}

	c.JSON(201, response)
}

// DeleteRestaurantByID godoc
// @Summary Delete restaurant by ID (Super Admin only)
// @Description Delete a restaurant by ID (super admin can delete any restaurant)
// @Tags restaurants
// @Accept json
// @Produce json
// @Param id path string true "Restaurant ID"
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /super-admin/restaurants/{id} [delete]
func (h *RestaurantHandler) DeleteRestaurantByID(c *gin.Context) {
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	// Get restaurant
	var restaurant db.Restaurant
	if err := h.DB.Where("id = ?", restaurantUUID).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// Delete restaurant (cascade will handle related records)
	if err := h.DB.Delete(&restaurant).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to delete restaurant"})
		return
	}

	c.Status(http.StatusNoContent)
}
