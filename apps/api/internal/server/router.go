package server

import (
	"github.com/example/restosaas/apps/api/internal/auth"
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/example/restosaas/apps/api/internal/handlers"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

func Mount(r *gin.Engine, gdb *gorm.DB) {
	pub := handlers.NewPublicHandler(gdb)
	own := handlers.OwnerHandler{DB: gdb}
	adm := handlers.AdminHandler{DB: gdb}
	pay := handlers.PaymentHandler{DB: gdb}
	usr := handlers.UserHandler{DB: gdb}
	superAdmin := handlers.SuperAdminHandler{DB: gdb}
	restaurant := handlers.RestaurantHandler{DB: gdb}
	organization := handlers.OrganizationHandler{DB: gdb}
	menu := handlers.MenuHandler{DB: gdb}
	course := handlers.CourseHandler{DB: gdb}
	oauth := handlers.OAuthHandler{DB: gdb}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "restosaas-api",
		})
	})

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	api.Use(auth.OptionalAuth(), auth.AddTokenToResponse())
	{
		// Public routes (no auth required, but tokens added if user is authenticated)
		api.GET("/restaurants", pub.ListRestaurants)
		api.GET("/restaurants/:slug", pub.GetRestaurant)
		api.GET("/restaurants/:slug/menus", menu.PublicGetMenus)
		api.GET("/restaurants/:slug/menus/:menuId", menu.PublicGetMenu)
		api.GET("/restaurants/:slug/courses", course.PublicGetCourses)
		api.GET("/restaurants/:slug/courses/:courseId", course.PublicGetCourse)
		api.GET("/restaurants/:slug/reviews", restaurant.GetRestaurantReviews)
		api.POST("/restaurants/:slug/reviews", pub.CreateRestaurantReview)
		api.GET("/restaurants/:slug/slots", pub.GetSlots)
		api.POST("/restaurants/:slug/reservations", pub.CreateRestaurantReservation)
		api.POST("/reservations", pub.CreateReservation)
		api.POST("/reviews", pub.CreateReview)
		api.GET("/landing/:slug", adm.PublicLanding)

		// Search routes
		api.GET("/search", pub.AdvancedSearch)
		api.GET("/search/suggestions", pub.SearchSuggestions)
		api.DELETE("/search/cache", pub.ClearSearchCache)
		api.GET("/search/cache/stats", pub.GetCacheStats)

		// User authentication routes (PUBLIC - no auth required)
		api.POST("/auth/register", usr.CreateUser) // Register new user
		api.POST("/users", usr.CreateUser)         // Register new user (alternative endpoint)
		api.POST("/auth/login", usr.Login)         // Login user

		// OAuth routes (PUBLIC - no auth required)
		api.POST("/auth/oauth/google", oauth.GoogleCallback)
		api.POST("/auth/oauth/facebook", oauth.FacebookCallback)
		api.POST("/auth/oauth/twitter", oauth.TwitterCallback)
	}

	// General user routes (require authentication for any role)
	userRoutes := r.Group("/api/users")
	userRoutes.Use(auth.RequireAuth(), auth.AddTokenToResponse())
	{
		userRoutes.GET("/me", usr.GetMe) // GET /api/users/me - Get current user
	}

	// User management routes (require SUPER_ADMIN or OWNER role)
	users := r.Group("/api/users")
	users.Use(auth.RequireAuth(string(db.RoleSuper), string(db.RoleOwner)), auth.AddTokenToResponse())
	{
		users.GET("", usr.ListUsers)         // GET /api/users
		users.GET("/:id", usr.GetUser)       // GET /api/users/:id
		users.PUT("/:id", usr.UpdateUser)    // PUT /api/users/:id
		users.DELETE("/:id", usr.DeleteUser) // DELETE /api/users/:id
	}

	owner := r.Group("/api/owner")
	owner.Use(auth.RequireAuth(string(db.RoleOwner), string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		owner.GET("/reservations", own.ListReservations)
		owner.POST("/reviews/:id/approve", own.ApproveReview)
	}

	admin := r.Group("/api/admin")
	admin.Use(auth.RequireAuth(string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		admin.POST("/landing", adm.UpsertLanding)
		admin.POST("/orgs/:id/activate", pay.ActivateSubscription)
	}

	// Super Admin routes (SUPER_ADMIN only)
	superAdminGroup := r.Group("/api/super-admin")
	superAdminGroup.Use(auth.RequireAuth(string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		superAdminGroup.POST("/owners", superAdmin.CreateOwner)                     // Create owner
		superAdminGroup.GET("/owners", superAdmin.ListOwners)                       // List all owners
		superAdminGroup.POST("/users", usr.CreateUser)                              // Create user
		superAdminGroup.GET("/users", superAdmin.ListAllUsers)                      // List all users
		superAdminGroup.PUT("/users/:id", superAdmin.UpdateUser)                    // Update user
		superAdminGroup.DELETE("/users/:id", superAdmin.DeleteUser)                 // Delete user
		superAdminGroup.GET("/restaurants", restaurant.ListAllRestaurants)          // List all restaurants
		superAdminGroup.GET("/restaurants/:id", restaurant.GetRestaurantByID)       // Get restaurant by ID
		superAdminGroup.PUT("/restaurants/:id", restaurant.UpdateRestaurant)        // Update restaurant
		superAdminGroup.DELETE("/restaurants/:id", restaurant.DeleteRestaurantByID) // Delete restaurant
	}

	// Super Admin organization routes (SUPER_ADMIN only)
	superAdminOrgGroup := r.Group("/api/super-admin/organizations")
	superAdminOrgGroup.Use(auth.RequireAuth(string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		superAdminOrgGroup.POST("", organization.CreateOrganization)                            // Create organization
		superAdminOrgGroup.GET("", organization.ListOrganizations)                              // List all organizations
		superAdminOrgGroup.GET("/:id", organization.GetOrganization)                            // Get organization by ID
		superAdminOrgGroup.PUT("/:id", organization.UpdateOrganization)                         // Update organization
		superAdminOrgGroup.DELETE("/:id", organization.DeleteOrganization)                      // Delete organization
		superAdminOrgGroup.POST("/:id/assign-owner", organization.AssignOwner)                  // Assign owner to organization
		superAdminOrgGroup.POST("/:id/assign-users", organization.AssignMultipleUsers)          // Assign multiple users to organization
		superAdminOrgGroup.GET("/:id/members", organization.GetOrganizationMembers)             // Get organization members
		superAdminOrgGroup.POST("/:id/restaurants", restaurant.CreateRestaurantForOrganization) // Create restaurant for organization
	}

	// Restaurant management routes (OWNER only)
	restaurantGroup := r.Group("/api/owner/restaurants")
	restaurantGroup.Use(auth.RequireAuth(string(db.RoleOwner), string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		restaurantGroup.POST("", restaurant.CreateRestaurant)                          // Create restaurant
		restaurantGroup.GET("/me", restaurant.GetMyRestaurant)                         // Get my restaurant
		restaurantGroup.PUT("/:id", restaurant.UpdateRestaurant)                       // Update restaurant
		restaurantGroup.DELETE("/:id", restaurant.DeleteRestaurant)                    // Delete restaurant
		restaurantGroup.POST("/:id/hours", restaurant.SetOpeningHours)                 // Set opening hours
		restaurantGroup.POST("/:id/images", restaurant.UploadImages)                   // Upload images
		restaurantGroup.POST("/:id/images/single", restaurant.UploadSingleImage)       // Upload single image
		restaurantGroup.POST("/:id/images/:imageId/set-main", restaurant.SetMainImage) // Set main image
	}

	// Menu management routes (OWNER only)
	menuGroup := r.Group("/api/owner/restaurants/:id/menus")
	menuGroup.Use(auth.RequireAuth(string(db.RoleOwner), string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		menuGroup.GET("", menu.ListMenus)             // Get menus
		menuGroup.POST("", menu.CreateMenu)           // Create menu
		menuGroup.GET("/:menuId", menu.GetMenu)       // Get menu
		menuGroup.PUT("/:menuId", menu.UpdateMenu)    // Update menu
		menuGroup.DELETE("/:menuId", menu.DeleteMenu) // Delete menu
	}

	// Course management routes (OWNER only)
	courseGroup := r.Group("/api/owner/restaurants/:id/courses")
	courseGroup.Use(auth.RequireAuth(string(db.RoleOwner), string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		courseGroup.GET("", course.ListCourses)               // Get courses
		courseGroup.POST("", course.CreateCourse)             // Create course
		courseGroup.GET("/:courseId", course.GetCourse)       // Get course
		courseGroup.PUT("/:courseId", course.UpdateCourse)    // Update course
		courseGroup.DELETE("/:courseId", course.DeleteCourse) // Delete course
	}
}
