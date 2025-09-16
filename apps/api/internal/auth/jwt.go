package auth

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"uid"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func IssueToken(userID, role string) (string, error) {
	secret := []byte(os.Getenv("JWT_SECRET"))
	claims := Claims{UserID: userID, Role: role, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour))}}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(secret)
}

// In production, verify Clerk JWT via JWKS. For local dev, we fallback to a demo header.
func RequireAuth(roles ...string) gin.HandlerFunc {
	allowed := map[string]bool{}
	for _, r := range roles {
		allowed[r] = true
	}
	return func(c *gin.Context) {
		// Demo bypass: X-Demo-Role and X-Demo-User (for local quickstart)
		if os.Getenv("APP_ENV") == "dev" && c.GetHeader("X-Demo-Role") != "" {
			role := c.GetHeader("X-Demo-Role")
			uid := c.GetHeader("X-Demo-User")
			if len(roles) > 0 && !allowed[role] {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
			c.Set("uid", uid)
			c.Set("role", role)
			c.Next()
			return
		}
		authz := c.GetHeader("Authorization")
		if !strings.HasPrefix(authz, "Bearer ") {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		tok := strings.TrimPrefix(authz, "Bearer ")
		claims := &Claims{}
		_, err := jwt.ParseWithClaims(tok, claims, func(t *jwt.Token) (interface{}, error) { return []byte(os.Getenv("JWT_SECRET")), nil })
		if err != nil {
			c.AbortWithError(http.StatusUnauthorized, errors.New("invalid token"))
			return
		}
		// If no roles specified, allow any authenticated user
		if len(roles) > 0 && !allowed[claims.Role] {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Set("uid", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// OptionalAuth extracts user info from JWT if present, but doesn't require it
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authz := c.GetHeader("Authorization")
		if strings.HasPrefix(authz, "Bearer ") {
			tok := strings.TrimPrefix(authz, "Bearer ")
			claims := &Claims{}
			_, err := jwt.ParseWithClaims(tok, claims, func(t *jwt.Token) (interface{}, error) {
				return []byte(os.Getenv("JWT_SECRET")), nil
			})
			if err == nil {
				c.Set("uid", claims.UserID)
				c.Set("role", claims.Role)
			}
		}
		c.Next()
	}
}

// AddTokenToResponse adds a new JWT token to the response if user is authenticated
func AddTokenToResponse() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Only add token to successful responses
		if c.Writer.Status() >= 200 && c.Writer.Status() < 300 {
			if uid, exists := c.Get("uid"); exists {
				if role, exists := c.Get("role"); exists {
					if token, err := IssueToken(uid.(string), role.(string)); err == nil {
						c.Header("X-Auth-Token", token)
					}
				}
			}
		}
	}
}
