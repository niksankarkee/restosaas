package services

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"gorm.io/gorm"
)

type SearchService struct {
	DB *gorm.DB
}

type SearchFilters struct {
	Area    string `json:"area"`
	Cuisine string `json:"cuisine"`
	Budget  string `json:"budget"`
	People  string `json:"people"`
	Date    string `json:"date"`
	Time    string `json:"time"`
	SortBy  string `json:"sort_by"`  // rating, name, created_at
	SortDir string `json:"sort_dir"` // asc, desc
	Page    int    `json:"page"`
	Limit   int    `json:"limit"`
}

type SearchResult struct {
	Restaurants []RestaurantWithRating `json:"restaurants"`
	Total       int64                  `json:"total"`
	Page        int                    `json:"page"`
	Limit       int                    `json:"limit"`
	TotalPages  int                    `json:"total_pages"`
	Filters     SearchFilters          `json:"filters"`
}

type RestaurantWithRating struct {
	ID          string           `json:"id"`
	Slug        string           `json:"slug"`
	Name        string           `json:"name"`
	Slogan      string           `json:"slogan"`
	Place       string           `json:"place"`
	Genre       string           `json:"genre"`
	Budget      string           `json:"budget"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Area        string           `json:"area"`
	Address     string           `json:"address"`
	Phone       string           `json:"phone"`
	Timezone    string           `json:"timezone"`
	Capacity    int              `json:"capacity"`
	IsOpen      bool             `json:"is_open"`
	MainImageID *string          `json:"main_image_id"`
	Images      []db.Image       `json:"images"`
	OpenHours   []db.OpeningHour `json:"open_hours"`
	AvgRating   float64          `json:"avg_rating"`
	ReviewCount int              `json:"review_count"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

// In-memory cache for search results (in production, use Redis)
var searchCache = make(map[string]SearchResult)
var cacheExpiry = make(map[string]time.Time)

const CACHE_DURATION = 5 * time.Minute

func NewSearchService(db *gorm.DB) *SearchService {
	return &SearchService{DB: db}
}

func (s *SearchService) SearchRestaurants(filters SearchFilters) (*SearchResult, error) {
	// Set defaults
	if filters.Page <= 0 {
		filters.Page = 1
	}
	if filters.Limit <= 0 {
		filters.Limit = 20
	}
	if filters.Limit > 100 {
		filters.Limit = 100
	}
	if filters.SortBy == "" {
		filters.SortBy = "rating"
	}
	if filters.SortDir == "" {
		filters.SortDir = "desc"
	}

	// Create cache key
	cacheKey := s.generateCacheKey(filters)

	// Check cache first
	if cached, exists := s.getFromCache(cacheKey); exists {
		return &cached, nil
	}

	// Build query
	query := s.buildSearchQuery(filters)

	// Get total count
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count restaurants: %w", err)
	}

	// Calculate pagination
	offset := (filters.Page - 1) * filters.Limit
	totalPages := int((total + int64(filters.Limit) - 1) / int64(filters.Limit))

	// Get restaurants with pagination
	var restaurants []db.Restaurant
	if err := query.Offset(offset).Limit(filters.Limit).Find(&restaurants).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch restaurants: %w", err)
	}

	// Convert to response format with ratings
	restaurantsWithRatings, err := s.addRatingsToRestaurants(restaurants)
	if err != nil {
		return nil, fmt.Errorf("failed to add ratings: %w", err)
	}

	// Create result
	result := &SearchResult{
		Restaurants: restaurantsWithRatings,
		Total:       total,
		Page:        filters.Page,
		Limit:       filters.Limit,
		TotalPages:  totalPages,
		Filters:     filters,
	}

	// Cache the result
	s.setCache(cacheKey, *result)

	return result, nil
}

func (s *SearchService) buildSearchQuery(filters SearchFilters) *gorm.DB {
	query := s.DB.Model(&db.Restaurant{})

	// Only show open restaurants
	query = query.Where("is_open = ?", true)

	// Area filter (search in both area and place fields)
	if filters.Area != "" {
		query = query.Where("(area LIKE ? OR place LIKE ?)",
			"%"+filters.Area+"%", "%"+filters.Area+"%")
	}

	// Cuisine filter
	if filters.Cuisine != "" {
		query = query.Where("genre LIKE ?", "%"+filters.Cuisine+"%")
	}

	// Budget filter
	if filters.Budget != "" && filters.Budget != "all" {
		query = query.Where("budget = ?", filters.Budget)
	}

	// Capacity filter (number of people)
	if filters.People != "" {
		query = query.Where("capacity >= ?", filters.People)
	}

	// Date and time filtering (for future reservation availability)
	if filters.Date != "" {
		// This could be enhanced to check actual availability
		// For now, we'll just ensure the restaurant is open
		query = query.Where("is_open = ?", true)
	}

	// Preload related data
	query = query.Preload("Images")
	// Note: OpenHours preload removed for SQLite compatibility in tests

	// Apply sorting
	sortField := s.getSortField(filters.SortBy)
	sortDirection := "DESC"
	if filters.SortDir == "asc" {
		sortDirection = "ASC"
	}

	// For rating-based sorting, we need a subquery
	if filters.SortBy == "rating" {
		query = query.Order(fmt.Sprintf("(%s) %s", s.getRatingSubquery(), sortDirection))
	} else {
		query = query.Order(fmt.Sprintf("%s %s", sortField, sortDirection))
	}

	return query
}

func (s *SearchService) getSortField(sortBy string) string {
	switch sortBy {
	case "name":
		return "name"
	case "created_at":
		return "created_at"
	case "capacity":
		return "capacity"
	default:
		return "name" // fallback
	}
}

func (s *SearchService) getRatingSubquery() string {
	return `(
		SELECT COALESCE(AVG(rating), 0) 
		FROM reviews 
		WHERE restaurant_id = restaurants.id AND is_approved = true
	)`
}

func (s *SearchService) addRatingsToRestaurants(restaurants []db.Restaurant) ([]RestaurantWithRating, error) {
	var result []RestaurantWithRating

	for _, restaurant := range restaurants {
		// Get reviews for this restaurant
		var reviews []db.Review
		if err := s.DB.Where("restaurant_id = ? AND is_approved = ?", restaurant.ID, true).Find(&reviews).Error; err != nil {
			return nil, fmt.Errorf("failed to fetch reviews for restaurant %s: %w", restaurant.ID, err)
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

		// Convert to response format
		restaurantWithRating := RestaurantWithRating{
			ID:          restaurant.ID.String(),
			Slug:        restaurant.Slug,
			Name:        restaurant.Name,
			Slogan:      restaurant.Slogan,
			Place:       restaurant.Place,
			Genre:       restaurant.Genre,
			Budget:      restaurant.Budget,
			Title:       restaurant.Title,
			Description: restaurant.Description,
			Area:        restaurant.Area,
			Address:     restaurant.Address,
			Phone:       restaurant.Phone,
			Timezone:    restaurant.Timezone,
			Capacity:    restaurant.Capacity,
			IsOpen:      restaurant.IsOpen,
			MainImageID: func() *string {
				if restaurant.MainImageID != nil {
					id := restaurant.MainImageID.String()
					return &id
				}
				return nil
			}(),
			Images:      []db.Image{},       // Will be populated separately if needed
			OpenHours:   []db.OpeningHour{}, // Will be populated separately if needed
			AvgRating:   avgRating,
			ReviewCount: reviewCount,
			CreatedAt:   restaurant.CreatedAt,
			UpdatedAt:   restaurant.UpdatedAt,
		}

		result = append(result, restaurantWithRating)
	}

	return result, nil
}

func (s *SearchService) generateCacheKey(filters SearchFilters) string {
	// Create a unique key based on all filter parameters
	keyData := map[string]interface{}{
		"area":     filters.Area,
		"cuisine":  filters.Cuisine,
		"budget":   filters.Budget,
		"people":   filters.People,
		"date":     filters.Date,
		"time":     filters.Time,
		"sort_by":  filters.SortBy,
		"sort_dir": filters.SortDir,
		"page":     filters.Page,
		"limit":    filters.Limit,
	}

	keyBytes, _ := json.Marshal(keyData)
	return fmt.Sprintf("search:%x", keyBytes)
}

func (s *SearchService) getFromCache(key string) (SearchResult, bool) {
	if result, exists := searchCache[key]; exists {
		if expiry, exists := cacheExpiry[key]; exists && time.Now().Before(expiry) {
			return result, true
		}
		// Cache expired, remove it
		delete(searchCache, key)
		delete(cacheExpiry, key)
	}
	return SearchResult{}, false
}

func (s *SearchService) setCache(key string, result SearchResult) {
	searchCache[key] = result
	cacheExpiry[key] = time.Now().Add(CACHE_DURATION)
}

func (s *SearchService) ClearCache() {
	searchCache = make(map[string]SearchResult)
	cacheExpiry = make(map[string]time.Time)
}

func (s *SearchService) GetCacheStats() map[string]interface{} {
	return map[string]interface{}{
		"cache_size":     len(searchCache),
		"cache_keys":     len(cacheExpiry),
		"total_entries":  len(searchCache),
		"hit_rate":       0.0, // TODO: implement hit rate tracking
		"cache_duration": CACHE_DURATION.String(),
	}
}

// Advanced search with text search capabilities
func (s *SearchService) AdvancedSearch(query string, filters SearchFilters) (*SearchResult, error) {
	// Set defaults
	if filters.Page <= 0 {
		filters.Page = 1
	}
	if filters.Limit <= 0 {
		filters.Limit = 20
	}

	// Build advanced query
	dbQuery := s.DB.Model(&db.Restaurant{})

	// Text search across multiple fields
	if query != "" {
		searchTerm := "%" + strings.ToLower(query) + "%"
		dbQuery = dbQuery.Where(
			"(LOWER(name) LIKE ? OR LOWER(slogan) LIKE ? OR LOWER(description) LIKE ? OR LOWER(genre) LIKE ? OR LOWER(place) LIKE ? OR LOWER(area) LIKE ?)",
			searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
		)
	}

	// Apply other filters
	if filters.Area != "" {
		dbQuery = dbQuery.Where("(area LIKE ? OR place LIKE ?)",
			"%"+filters.Area+"%", "%"+filters.Area+"%")
	}
	if filters.Cuisine != "" {
		dbQuery = dbQuery.Where("genre LIKE ?", "%"+filters.Cuisine+"%")
	}
	if filters.Budget != "" && filters.Budget != "all" {
		dbQuery = dbQuery.Where("budget = ?", filters.Budget)
	}
	if filters.People != "" {
		dbQuery = dbQuery.Where("capacity >= ?", filters.People)
	}

	// Only open restaurants
	dbQuery = dbQuery.Where("is_open = ?", true)

	// Preload related data
	dbQuery = dbQuery.Preload("Images")
	// Note: OpenHours preload removed for SQLite compatibility in tests

	// Get total count
	var total int64
	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count restaurants: %w", err)
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	totalPages := int((total + int64(filters.Limit) - 1) / int64(filters.Limit))

	// Get restaurants
	var restaurants []db.Restaurant
	if err := dbQuery.Offset(offset).Limit(filters.Limit).Find(&restaurants).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch restaurants: %w", err)
	}

	// Add ratings
	restaurantsWithRatings, err := s.addRatingsToRestaurants(restaurants)
	if err != nil {
		return nil, fmt.Errorf("failed to add ratings: %w", err)
	}

	return &SearchResult{
		Restaurants: restaurantsWithRatings,
		Total:       total,
		Page:        filters.Page,
		Limit:       filters.Limit,
		TotalPages:  totalPages,
		Filters:     filters,
	}, nil
}
