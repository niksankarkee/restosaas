package server

import (
	"github.com/example/restosaas/apps/api/internal/auth"
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/example/restosaas/apps/api/internal/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Mount(r *gin.Engine, gdb *gorm.DB) {
	pub := handlers.PublicHandler{DB: gdb}
	own := handlers.OwnerHandler{DB: gdb}
	adm := handlers.AdminHandler{DB: gdb}
	pay := handlers.PaymentHandler{DB: gdb}
	usr := handlers.UserHandler{DB: gdb}
	superAdmin := handlers.SuperAdminHandler{DB: gdb}
	restaurant := handlers.RestaurantHandler{DB: gdb}
	organization := handlers.OrganizationHandler{DB: gdb}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "restosaas-api",
		})
	})

	api := r.Group("/api")
	api.Use(auth.OptionalAuth(), auth.AddTokenToResponse())
	{
		// Public routes (no auth required, but tokens added if user is authenticated)
		api.GET("/restaurants", pub.ListRestaurants)
		api.GET("/restaurants/:slug", pub.GetRestaurant)
		api.GET("/restaurants/:slug/slots", pub.GetSlots)
		api.POST("/reservations", pub.CreateReservation)
		api.POST("/reviews", pub.CreateReview)
		api.GET("/landing/:slug", adm.PublicLanding)

		// User authentication routes (PUBLIC - no auth required)
		api.POST("/auth/register", usr.CreateUser) // Register new user
		api.POST("/auth/login", usr.Login)         // Login user
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
		users.POST("", usr.CreateUser)       // POST /api/users
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
		superAdminGroup.POST("/owners", superAdmin.CreateOwner)     // Create owner
		superAdminGroup.GET("/owners", superAdmin.ListOwners)       // List all owners
		superAdminGroup.GET("/users", superAdmin.ListAllUsers)      // List all users
		superAdminGroup.PUT("/users/:id", superAdmin.UpdateUser)    // Update user
		superAdminGroup.DELETE("/users/:id", superAdmin.DeleteUser) // Delete user
	}

	// Organization management routes (OWNER only)
	organizationGroup := r.Group("/api/organizations")
	organizationGroup.Use(auth.RequireAuth(string(db.RoleOwner), string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		organizationGroup.POST("", organization.CreateOrganization)     // Create organization
		organizationGroup.GET("/me", organization.GetMyOrganization)    // Get my organization
		organizationGroup.PUT("/me", organization.UpdateMyOrganization) // Update my organization
	}

	// Super Admin organization routes (SUPER_ADMIN only)
	superAdminOrgGroup := r.Group("/api/super-admin/organizations")
	superAdminOrgGroup.Use(auth.RequireAuth(string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		superAdminOrgGroup.GET("", organization.ListOrganizations) // List all organizations
	}

	// Restaurant management routes (OWNER only)
	restaurantGroup := r.Group("/api/owner/restaurants")
	restaurantGroup.Use(auth.RequireAuth(string(db.RoleOwner), string(db.RoleSuper)), auth.AddTokenToResponse())
	{
		restaurantGroup.POST("", restaurant.CreateRestaurant)                       // Create restaurant
		restaurantGroup.GET("/me", restaurant.GetMyRestaurant)                      // Get my restaurant
		restaurantGroup.PUT("/:id", restaurant.UpdateRestaurant)                    // Update restaurant
		restaurantGroup.DELETE("/:id", restaurant.DeleteRestaurant)                 // Delete restaurant
		restaurantGroup.GET("/:id/menus", restaurant.GetMenus)                      // Get menus
		restaurantGroup.POST("/:id/menus", restaurant.CreateMenu)                   // Create menu
		restaurantGroup.POST("/:id/menus/:menuId/courses", restaurant.CreateCourse) // Create course
	}
}
