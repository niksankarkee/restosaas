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
	Name        *string `json:"name,omitempty"`
	Slogan      *string `json:"slogan,omitempty"`
	Place       *string `json:"place,omitempty"`
	Genre       *string `json:"genre,omitempty"`
	Budget      *string `json:"budget,omitempty"`
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	Address     *string `json:"address,omitempty"`
	Phone       *string `json:"phone,omitempty"`
	Capacity    *int    `json:"capacity,omitempty"`
	IsOpen      *bool   `json:"isOpen,omitempty"`
}

// RestaurantResponse represents a restaurant in API responses
type RestaurantResponse struct {
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
}

// CreateMenuRequest represents the request to create a menu
type CreateMenuRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

// CreateCourseRequest represents the request to create a course
type CreateCourseRequest struct {
	Name     string `json:"name" binding:"required"`
	Price    int    `json:"price" binding:"min=0"`
	ImageURL string `json:"imageUrl"`
}

// MenuResponse represents a menu in API responses
type MenuResponse struct {
	ID          string           `json:"id"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Courses     []CourseResponse `json:"courses"`
}

// CourseResponse represents a course in API responses
type CourseResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Price    int    `json:"price"`
	ImageURL string `json:"imageUrl"`
}

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

	// Check if restaurant already exists for this organization
	var existingRestaurant db.Restaurant
	if err := h.DB.Where("org_id = ?", orgMember.OrgID).First(&existingRestaurant).Error; err == nil {
		c.JSON(409, gin.H{"error": "restaurant already exists for this organization"})
		return
	}

	// Generate slug from name
	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))

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

	// Get restaurant
	var restaurant db.Restaurant
	if err := h.DB.Where("org_id = ?", orgMember.OrgID).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
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

// PUT /api/owner/restaurants/:id - Update restaurant (OWNER only)
func (h *RestaurantHandler) UpdateRestaurant(c *gin.Context) {
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

	var req UpdateRestaurantRequest
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

// GET /api/owner/restaurants/:id/menus - Get menus for restaurant (OWNER only)
func (h *RestaurantHandler) GetMenus(c *gin.Context) {
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

	// Get menus for this restaurant
	var menus []db.Menu
	if err := h.DB.Where("restaurant_id = ?", restaurantUUID).Preload("Courses").Find(&menus).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch menus"})
		return
	}

	// Convert to response format
	var response []MenuResponse
	for _, menu := range menus {
		var courses []CourseResponse
		for _, course := range menu.Courses {
			courses = append(courses, CourseResponse{
				ID:       course.ID.String(),
				Name:     course.Name,
				Price:    course.Price,
				ImageURL: course.ImageURL,
			})
		}

		response = append(response, MenuResponse{
			ID:          menu.ID.String(),
			Title:       menu.Title,
			Description: menu.Description,
			Courses:     courses,
		})
	}

	c.JSON(200, response)
}

// POST /api/owner/restaurants/:id/menus - Create menu (OWNER only)
func (h *RestaurantHandler) CreateMenu(c *gin.Context) {
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

	var req CreateMenuRequest
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

	// Create menu
	menu := db.Menu{
		ID:           uuid.New(),
		RestaurantID: restaurantUUID,
		Title:        req.Title,
		Description:  req.Description,
	}

	if err := h.DB.Create(&menu).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create menu"})
		return
	}

	c.JSON(201, gin.H{
		"id":          menu.ID.String(),
		"title":       menu.Title,
		"description": menu.Description,
		"createdAt":   menu.ID, // Using ID as placeholder for now
	})
}

// POST /api/owner/restaurants/:id/menus/:menuId/courses - Create course (OWNER only)
func (h *RestaurantHandler) CreateCourse(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	// Get menu ID from URL
	menuID := c.Param("menuId")
	menuUUID, err := uuid.Parse(menuID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid menu ID"})
		return
	}

	var req CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Verify menu ownership through restaurant
	var orgMember db.OrgMember
	if err := h.DB.Where("user_id = ?", userID).First(&orgMember).Error; err != nil {
		c.JSON(404, gin.H{"error": "organization not found"})
		return
	}

	var menu db.Menu
	if err := h.DB.Joins("JOIN restaurants ON menus.restaurant_id = restaurants.id").
		Where("menus.id = ? AND restaurants.org_id = ?", menuUUID, orgMember.OrgID).
		First(&menu).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "menu not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch menu"})
		return
	}

	// Create course
	course := db.Course{
		ID:       uuid.New(),
		MenuID:   menuUUID,
		Name:     req.Name,
		Price:    req.Price,
		ImageURL: req.ImageURL,
	}

	if err := h.DB.Create(&course).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create course"})
		return
	}

	c.JSON(201, gin.H{
		"id":       course.ID.String(),
		"name":     course.Name,
		"price":    course.Price,
		"imageUrl": course.ImageURL,
	})
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
