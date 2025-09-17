package main

import (
	"os"
	"testing"
)

// TestMain runs before all tests
func TestMain(m *testing.M) {
	// Set test environment variables
	os.Setenv("GIN_MODE", "test")
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "test")
	os.Setenv("DB_PASSWORD", "test")
	os.Setenv("DB_NAME", "test_restosaas")
	os.Setenv("JWT_SECRET", "test-secret-key")

	// Run tests
	code := m.Run()

	// Cleanup
	os.Exit(code)
}
