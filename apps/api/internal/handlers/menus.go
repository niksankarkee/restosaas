package handlers

import (
	"net/http"
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MenuHandler struct{ DB *gorm.DB }

// Request/Response DTOs
type CreateMenuRequest struct {
	Name      string `json:"name" binding:"required"`
	ShortDesc string `json:"shortDesc"`
	ImageURL  string `json:"imageUrl"`
	Price     int    `json:"price" binding:"required,min=0"`
	Type      string `json:"type" binding:"required,oneof=DRINK FOOD"`
	MealType  string `json:"mealType" binding:"required,oneof=LUNCH DINNER BOTH"`
}

type UpdateMenuRequest struct {
	Name      *string `json:"name,omitempty"`
	ShortDesc *string `json:"shortDesc,omitempty"`
	ImageURL  *string `json:"imageUrl,omitempty"`
	Price     *int    `json:"price,omitempty"`
	Type      *string `json:"type,omitempty"`
	MealType  *string `json:"mealType,omitempty"`
}

type MenuResponse struct {
	ID           string    `json:"id"`
	RestaurantID string    `json:"restaurantId"`
	Name         string    `json:"name"`
	ShortDesc    string    `json:"shortDesc"`
	ImageURL     string    `json:"imageUrl"`
	Price        int       `json:"price"`
	Type         string    `json:"type"`
	MealType     string    `json:"mealType"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// CreateMenu godoc
// @Summary Create a new menu item
// @Description Create a new menu item for a restaurant
// @Tags menus
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param menu body CreateMenuRequest true "Menu information"
// @Success 201 {object} MenuResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/menus [post]
func (h *MenuHandler) CreateMenu(c *gin.Context) {
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
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

	var req CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	menu := db.Menu{
		ID:           uuid.New(),
		RestaurantID: restaurantUUID,
		Name:         req.Name,
		ShortDesc:    req.ShortDesc,
		ImageURL:     req.ImageURL,
		Price:        req.Price,
		Type:         db.MenuType(req.Type),
		MealType:     db.MealType(req.MealType),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := h.DB.Create(&menu).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create menu"})
		return
	}

	response := MenuResponse{
		ID:           menu.ID.String(),
		RestaurantID: menu.RestaurantID.String(),
		Name:         menu.Name,
		ShortDesc:    menu.ShortDesc,
		ImageURL:     menu.ImageURL,
		Price:        menu.Price,
		Type:         string(menu.Type),
		MealType:     string(menu.MealType),
		CreatedAt:    menu.CreatedAt,
		UpdatedAt:    menu.UpdatedAt,
	}

	c.JSON(201, response)
}

// ListMenus godoc
// @Summary List menu items for a restaurant
// @Description Get all menu items for a specific restaurant with optional filtering
// @Tags menus
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param type query string false "Filter by type (DRINK or FOOD)"
// @Param mealType query string false "Filter by meal type (LUNCH, DINNER, or BOTH)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/menus [get]
func (h *MenuHandler) ListMenus(c *gin.Context) {
	restaurantID := c.Param("id")
	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
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

	// Get filter parameters
	menuType := c.Query("type")
	mealType := c.Query("mealType")

	query := h.DB.Where("restaurant_id = ?", restaurantUUID)

	if menuType != "" {
		query = query.Where("type = ?", menuType)
	}
	if mealType != "" {
		query = query.Where("meal_type = ?", mealType)
	}

	var menus []db.Menu
	if err := query.Order("created_at DESC").Find(&menus).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch menus"})
		return
	}

	var response []MenuResponse
	for _, menu := range menus {
		response = append(response, MenuResponse{
			ID:           menu.ID.String(),
			RestaurantID: menu.RestaurantID.String(),
			Name:         menu.Name,
			ShortDesc:    menu.ShortDesc,
			ImageURL:     menu.ImageURL,
			Price:        menu.Price,
			Type:         string(menu.Type),
			MealType:     string(menu.MealType),
			CreatedAt:    menu.CreatedAt,
			UpdatedAt:    menu.UpdatedAt,
		})
	}

	c.JSON(200, gin.H{"menus": response})
}

// GetMenu godoc
// @Summary Get menu item by ID
// @Description Get a specific menu item by its ID
// @Tags menus
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param menuId path string true "Menu ID"
// @Success 200 {object} MenuResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/menus/{menuId} [get]
func (h *MenuHandler) GetMenu(c *gin.Context) {
	restaurantID := c.Param("id")
	menuID := c.Param("menuId")

	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	menuUUID, err := uuid.Parse(menuID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid menu ID"})
		return
	}

	var menu db.Menu
	if err := h.DB.Where("id = ? AND restaurant_id = ?", menuUUID, restaurantUUID).First(&menu).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "menu not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch menu"})
		return
	}

	response := MenuResponse{
		ID:           menu.ID.String(),
		RestaurantID: menu.RestaurantID.String(),
		Name:         menu.Name,
		ShortDesc:    menu.ShortDesc,
		ImageURL:     menu.ImageURL,
		Price:        menu.Price,
		Type:         string(menu.Type),
		MealType:     string(menu.MealType),
		CreatedAt:    menu.CreatedAt,
		UpdatedAt:    menu.UpdatedAt,
	}

	c.JSON(200, response)
}

// UpdateMenu godoc
// @Summary Update a menu item
// @Description Update an existing menu item
// @Tags menus
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param menuId path string true "Menu ID"
// @Param menu body UpdateMenuRequest true "Menu update information"
// @Success 200 {object} MenuResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/menus/{menuId} [put]
func (h *MenuHandler) UpdateMenu(c *gin.Context) {
	restaurantID := c.Param("id")
	menuID := c.Param("menuId")

	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	menuUUID, err := uuid.Parse(menuID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid menu ID"})
		return
	}

	var menu db.Menu
	if err := h.DB.Where("id = ? AND restaurant_id = ?", menuUUID, restaurantUUID).First(&menu).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "menu not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch menu"})
		return
	}

	var req UpdateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	if req.Name != nil {
		menu.Name = *req.Name
	}
	if req.ShortDesc != nil {
		menu.ShortDesc = *req.ShortDesc
	}
	if req.ImageURL != nil {
		menu.ImageURL = *req.ImageURL
	}
	if req.Price != nil {
		menu.Price = *req.Price
	}
	if req.Type != nil {
		menu.Type = db.MenuType(*req.Type)
	}
	if req.MealType != nil {
		menu.MealType = db.MealType(*req.MealType)
	}

	menu.UpdatedAt = time.Now()

	if err := h.DB.Save(&menu).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to update menu"})
		return
	}

	response := MenuResponse{
		ID:           menu.ID.String(),
		RestaurantID: menu.RestaurantID.String(),
		Name:         menu.Name,
		ShortDesc:    menu.ShortDesc,
		ImageURL:     menu.ImageURL,
		Price:        menu.Price,
		Type:         string(menu.Type),
		MealType:     string(menu.MealType),
		CreatedAt:    menu.CreatedAt,
		UpdatedAt:    menu.UpdatedAt,
	}

	c.JSON(200, response)
}

// DeleteMenu godoc
// @Summary Delete a menu item
// @Description Delete an existing menu item
// @Tags menus
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param menuId path string true "Menu ID"
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/menus/{menuId} [delete]
func (h *MenuHandler) DeleteMenu(c *gin.Context) {
	restaurantID := c.Param("id")
	menuID := c.Param("menuId")

	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	menuUUID, err := uuid.Parse(menuID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid menu ID"})
		return
	}

	var menu db.Menu
	if err := h.DB.Where("id = ? AND restaurant_id = ?", menuUUID, restaurantUUID).First(&menu).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "menu not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch menu"})
		return
	}

	if err := h.DB.Delete(&menu).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to delete menu"})
		return
	}

	c.Status(http.StatusNoContent)
}

// PublicGetMenus godoc
// @Summary Get menu items for a restaurant (public)
// @Description Get all menu items for a specific restaurant (public endpoint)
// @Tags public
// @Accept json
// @Produce json
// @Param slug path string true "Restaurant slug"
// @Param type query string false "Filter by type (DRINK or FOOD)"
// @Param mealType query string false "Filter by meal type (LUNCH, DINNER, or BOTH)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/restaurants/{slug}/menus [get]
func (h *MenuHandler) PublicGetMenus(c *gin.Context) {
	slug := c.Param("slug")

	// Get restaurant by slug
	var restaurant db.Restaurant
	if err := h.DB.Where("slug = ?", slug).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	// Get filter parameters
	menuType := c.Query("type")
	mealType := c.Query("mealType")

	query := h.DB.Where("restaurant_id = ?", restaurant.ID)

	if menuType != "" {
		query = query.Where("type = ?", menuType)
	}
	if mealType != "" {
		query = query.Where("meal_type = ?", mealType)
	}

	var menus []db.Menu
	if err := query.Order("created_at DESC").Find(&menus).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch menus"})
		return
	}

	var response []MenuResponse
	for _, menu := range menus {
		response = append(response, MenuResponse{
			ID:           menu.ID.String(),
			RestaurantID: menu.RestaurantID.String(),
			Name:         menu.Name,
			ShortDesc:    menu.ShortDesc,
			ImageURL:     menu.ImageURL,
			Price:        menu.Price,
			Type:         string(menu.Type),
			MealType:     string(menu.MealType),
			CreatedAt:    menu.CreatedAt,
			UpdatedAt:    menu.UpdatedAt,
		})
	}

	c.JSON(200, gin.H{"menus": response})
}

// PublicGetMenu godoc
// @Summary Get menu item by ID (public)
// @Description Get a specific menu item by its ID (public endpoint)
// @Tags public
// @Accept json
// @Produce json
// @Param slug path string true "Restaurant slug"
// @Param menuId path string true "Menu ID"
// @Success 200 {object} MenuResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/restaurants/{slug}/menus/{menuId} [get]
func (h *MenuHandler) PublicGetMenu(c *gin.Context) {
	slug := c.Param("slug")
	menuID := c.Param("menuId")

	// Get restaurant by slug
	var restaurant db.Restaurant
	if err := h.DB.Where("slug = ?", slug).First(&restaurant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "restaurant not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch restaurant"})
		return
	}

	menuUUID, err := uuid.Parse(menuID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid menu ID"})
		return
	}

	var menu db.Menu
	if err := h.DB.Where("id = ? AND restaurant_id = ?", menuUUID, restaurant.ID).First(&menu).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "menu not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch menu"})
		return
	}

	response := MenuResponse{
		ID:           menu.ID.String(),
		RestaurantID: menu.RestaurantID.String(),
		Name:         menu.Name,
		ShortDesc:    menu.ShortDesc,
		ImageURL:     menu.ImageURL,
		Price:        menu.Price,
		Type:         string(menu.Type),
		MealType:     string(menu.MealType),
		CreatedAt:    menu.CreatedAt,
		UpdatedAt:    menu.UpdatedAt,
	}

	c.JSON(200, response)
}
