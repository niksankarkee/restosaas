package main

import (
	"fmt"
	"os"

	"github.com/example/restosaas/apps/api/internal/logger"
	"github.com/example/restosaas/apps/api/internal/server"
)

// @title Restaurant SaaS API
// @version 1.0
// @description A comprehensive restaurant management and discovery API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	logger.Info("Starting Restaurant SaaS API server")

	app := server.New()
	server.Mount(app.R, app.DB)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Infof("API server listening on :%s", port)
	if err := app.R.Run(fmt.Sprintf(":%s", port)); err != nil {
		logger.Fatalf("Failed to start API server: %v", err)
	}
}
