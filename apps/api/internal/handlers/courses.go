package handlers

import (
	"net/http"
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseHandler struct{ DB *gorm.DB }

// Request/Response DTOs
type CreateCourseRequest struct {
	Title         string `json:"title" binding:"required"`
	Description   string `json:"description"`
	ImageURL      string `json:"imageUrl"`
	CoursePrice   int    `json:"coursePrice" binding:"required,min=0"`
	OriginalPrice *int   `json:"originalPrice,omitempty"`
	NumberOfItems int    `json:"numberOfItems" binding:"required,min=1"`
	StayTime      int    `json:"stayTime" binding:"required,min=1"`
	CourseContent string `json:"courseContent"`
	Precautions   string `json:"precautions"`
}

type UpdateCourseRequest struct {
	Title         *string `json:"title,omitempty"`
	Description   *string `json:"description,omitempty"`
	ImageURL      *string `json:"imageUrl,omitempty"`
	CoursePrice   *int    `json:"coursePrice,omitempty"`
	OriginalPrice *int    `json:"originalPrice,omitempty"`
	NumberOfItems *int    `json:"numberOfItems,omitempty"`
	StayTime      *int    `json:"stayTime,omitempty"`
	CourseContent *string `json:"courseContent,omitempty"`
	Precautions   *string `json:"precautions,omitempty"`
}

type CourseResponse struct {
	ID            string    `json:"id"`
	RestaurantID  string    `json:"restaurantId"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	ImageURL      string    `json:"imageUrl"`
	CoursePrice   int       `json:"coursePrice"`
	OriginalPrice *int      `json:"originalPrice"`
	NumberOfItems int       `json:"numberOfItems"`
	StayTime      int       `json:"stayTime"`
	CourseContent string    `json:"courseContent"`
	Precautions   string    `json:"precautions"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// CreateCourse godoc
// @Summary Create a new course
// @Description Create a new course for a restaurant
// @Tags courses
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param course body CreateCourseRequest true "Course information"
// @Success 201 {object} CourseResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/courses [post]
func (h *CourseHandler) CreateCourse(c *gin.Context) {
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

	var req CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	course := db.Course{
		ID:            uuid.New(),
		RestaurantID:  restaurantUUID,
		Title:         req.Title,
		Description:   req.Description,
		ImageURL:      req.ImageURL,
		CoursePrice:   req.CoursePrice,
		OriginalPrice: req.OriginalPrice,
		NumberOfItems: req.NumberOfItems,
		StayTime:      req.StayTime,
		CourseContent: req.CourseContent,
		Precautions:   req.Precautions,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := h.DB.Create(&course).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create course"})
		return
	}

	response := CourseResponse{
		ID:            course.ID.String(),
		RestaurantID:  course.RestaurantID.String(),
		Title:         course.Title,
		Description:   course.Description,
		ImageURL:      course.ImageURL,
		CoursePrice:   course.CoursePrice,
		OriginalPrice: course.OriginalPrice,
		NumberOfItems: course.NumberOfItems,
		StayTime:      course.StayTime,
		CourseContent: course.CourseContent,
		Precautions:   course.Precautions,
		CreatedAt:     course.CreatedAt,
		UpdatedAt:     course.UpdatedAt,
	}

	c.JSON(201, response)
}

// ListCourses godoc
// @Summary List courses for a restaurant
// @Description Get all courses for a specific restaurant
// @Tags courses
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/courses [get]
func (h *CourseHandler) ListCourses(c *gin.Context) {
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

	var courses []db.Course
	if err := h.DB.Where("restaurant_id = ?", restaurantUUID).Order("created_at DESC").Find(&courses).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch courses"})
		return
	}

	var response []CourseResponse
	for _, course := range courses {
		response = append(response, CourseResponse{
			ID:            course.ID.String(),
			RestaurantID:  course.RestaurantID.String(),
			Title:         course.Title,
			Description:   course.Description,
			ImageURL:      course.ImageURL,
			CoursePrice:   course.CoursePrice,
			OriginalPrice: course.OriginalPrice,
			NumberOfItems: course.NumberOfItems,
			StayTime:      course.StayTime,
			CourseContent: course.CourseContent,
			Precautions:   course.Precautions,
			CreatedAt:     course.CreatedAt,
			UpdatedAt:     course.UpdatedAt,
		})
	}

	c.JSON(200, gin.H{"courses": response})
}

// GetCourse godoc
// @Summary Get course by ID
// @Description Get a specific course by its ID
// @Tags courses
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param courseId path string true "Course ID"
// @Success 200 {object} CourseResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/courses/{courseId} [get]
func (h *CourseHandler) GetCourse(c *gin.Context) {
	restaurantID := c.Param("id")
	courseID := c.Param("courseId")

	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	courseUUID, err := uuid.Parse(courseID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course ID"})
		return
	}

	var course db.Course
	if err := h.DB.Where("id = ? AND restaurant_id = ?", courseUUID, restaurantUUID).First(&course).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "course not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch course"})
		return
	}

	response := CourseResponse{
		ID:            course.ID.String(),
		RestaurantID:  course.RestaurantID.String(),
		Title:         course.Title,
		Description:   course.Description,
		ImageURL:      course.ImageURL,
		CoursePrice:   course.CoursePrice,
		OriginalPrice: course.OriginalPrice,
		NumberOfItems: course.NumberOfItems,
		StayTime:      course.StayTime,
		CourseContent: course.CourseContent,
		Precautions:   course.Precautions,
		CreatedAt:     course.CreatedAt,
		UpdatedAt:     course.UpdatedAt,
	}

	c.JSON(200, response)
}

// UpdateCourse godoc
// @Summary Update a course
// @Description Update an existing course
// @Tags courses
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param courseId path string true "Course ID"
// @Param course body UpdateCourseRequest true "Course update information"
// @Success 200 {object} CourseResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/courses/{courseId} [put]
func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	restaurantID := c.Param("id")
	courseID := c.Param("courseId")

	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	courseUUID, err := uuid.Parse(courseID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course ID"})
		return
	}

	var course db.Course
	if err := h.DB.Where("id = ? AND restaurant_id = ?", courseUUID, restaurantUUID).First(&course).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "course not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch course"})
		return
	}

	var req UpdateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	if req.Title != nil {
		course.Title = *req.Title
	}
	if req.Description != nil {
		course.Description = *req.Description
	}
	if req.ImageURL != nil {
		course.ImageURL = *req.ImageURL
	}
	if req.CoursePrice != nil {
		course.CoursePrice = *req.CoursePrice
	}
	if req.OriginalPrice != nil {
		course.OriginalPrice = req.OriginalPrice
	}
	if req.NumberOfItems != nil {
		course.NumberOfItems = *req.NumberOfItems
	}
	if req.StayTime != nil {
		course.StayTime = *req.StayTime
	}
	if req.CourseContent != nil {
		course.CourseContent = *req.CourseContent
	}
	if req.Precautions != nil {
		course.Precautions = *req.Precautions
	}

	course.UpdatedAt = time.Now()

	if err := h.DB.Save(&course).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to update course"})
		return
	}

	response := CourseResponse{
		ID:            course.ID.String(),
		RestaurantID:  course.RestaurantID.String(),
		Title:         course.Title,
		Description:   course.Description,
		ImageURL:      course.ImageURL,
		CoursePrice:   course.CoursePrice,
		OriginalPrice: course.OriginalPrice,
		NumberOfItems: course.NumberOfItems,
		StayTime:      course.StayTime,
		CourseContent: course.CourseContent,
		Precautions:   course.Precautions,
		CreatedAt:     course.CreatedAt,
		UpdatedAt:     course.UpdatedAt,
	}

	c.JSON(200, response)
}

// DeleteCourse godoc
// @Summary Delete a course
// @Description Delete an existing course
// @Tags courses
// @Accept json
// @Produce json
// @Param restaurantId path string true "Restaurant ID"
// @Param courseId path string true "Course ID"
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /owner/restaurants/{restaurantId}/courses/{courseId} [delete]
func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	restaurantID := c.Param("id")
	courseID := c.Param("courseId")

	restaurantUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid restaurant ID"})
		return
	}

	courseUUID, err := uuid.Parse(courseID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course ID"})
		return
	}

	var course db.Course
	if err := h.DB.Where("id = ? AND restaurant_id = ?", courseUUID, restaurantUUID).First(&course).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "course not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch course"})
		return
	}

	if err := h.DB.Delete(&course).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to delete course"})
		return
	}

	c.Status(http.StatusNoContent)
}

// PublicGetCourses godoc
// @Summary Get courses for a restaurant (public)
// @Description Get all courses for a specific restaurant (public endpoint)
// @Tags public
// @Accept json
// @Produce json
// @Param slug path string true "Restaurant slug"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/restaurants/{slug}/courses [get]
func (h *CourseHandler) PublicGetCourses(c *gin.Context) {
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

	var courses []db.Course
	if err := h.DB.Where("restaurant_id = ?", restaurant.ID).Order("created_at DESC").Find(&courses).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch courses"})
		return
	}

	var response []CourseResponse
	for _, course := range courses {
		response = append(response, CourseResponse{
			ID:            course.ID.String(),
			RestaurantID:  course.RestaurantID.String(),
			Title:         course.Title,
			Description:   course.Description,
			ImageURL:      course.ImageURL,
			CoursePrice:   course.CoursePrice,
			OriginalPrice: course.OriginalPrice,
			NumberOfItems: course.NumberOfItems,
			StayTime:      course.StayTime,
			CourseContent: course.CourseContent,
			Precautions:   course.Precautions,
			CreatedAt:     course.CreatedAt,
			UpdatedAt:     course.UpdatedAt,
		})
	}

	c.JSON(200, gin.H{"courses": response})
}

// PublicGetCourse godoc
// @Summary Get course by ID (public)
// @Description Get a specific course by its ID (public endpoint)
// @Tags public
// @Accept json
// @Produce json
// @Param slug path string true "Restaurant slug"
// @Param courseId path string true "Course ID"
// @Success 200 {object} CourseResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/restaurants/{slug}/courses/{courseId} [get]
func (h *CourseHandler) PublicGetCourse(c *gin.Context) {
	slug := c.Param("slug")
	courseID := c.Param("courseId")

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

	courseUUID, err := uuid.Parse(courseID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course ID"})
		return
	}

	var course db.Course
	if err := h.DB.Where("id = ? AND restaurant_id = ?", courseUUID, restaurant.ID).First(&course).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "course not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed to fetch course"})
		return
	}

	response := CourseResponse{
		ID:            course.ID.String(),
		RestaurantID:  course.RestaurantID.String(),
		Title:         course.Title,
		Description:   course.Description,
		ImageURL:      course.ImageURL,
		CoursePrice:   course.CoursePrice,
		OriginalPrice: course.OriginalPrice,
		NumberOfItems: course.NumberOfItems,
		StayTime:      course.StayTime,
		CourseContent: course.CourseContent,
		Precautions:   course.Precautions,
		CreatedAt:     course.CreatedAt,
		UpdatedAt:     course.UpdatedAt,
	}

	c.JSON(200, response)
}
