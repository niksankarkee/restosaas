package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/example/restosaas/apps/api/internal/auth"
	"github.com/example/restosaas/apps/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OAuthHandler struct{ DB *gorm.DB }

// OAuth request/response types
type OAuthCallbackRequest struct {
	Code  string `json:"code" binding:"required"`
	State string `json:"state,omitempty"`
}

type OAuthTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

type FacebookUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture struct {
		Data struct {
			URL string `json:"url"`
		} `json:"data"`
	} `json:"picture"`
}

type TwitterUserInfo struct {
	ID              string `json:"id"`
	Email           string `json:"email"`
	Name            string `json:"name"`
	Username        string `json:"username"`
	ProfileImageURL string `json:"profile_image_url"`
}

// Google OAuth
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	var req OAuthCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	// Exchange code for access token
	token, err := h.exchangeGoogleCode(req.Code)
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to exchange code for token"})
		return
	}

	// Get user info from Google
	userInfo, err := h.getGoogleUserInfo(token.AccessToken)
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to get user info"})
		return
	}

	// Create or update user
	user, err := h.createOrUpdateOAuthUser(userInfo.Email, userInfo.Name, userInfo.Picture, string(db.OAuthGoogle), userInfo.ID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create/update user"})
		return
	}

	// Generate JWT token
	jwtToken, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(200, gin.H{
		"user": gin.H{
			"id":          user.ID.String(),
			"email":       user.Email,
			"displayName": user.DisplayName,
			"role":        string(user.Role),
			"avatarUrl":   user.AvatarURL,
		},
		"token": jwtToken,
	})
}

// Facebook OAuth
func (h *OAuthHandler) FacebookCallback(c *gin.Context) {
	var req OAuthCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	// Exchange code for access token
	token, err := h.exchangeFacebookCode(req.Code)
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to exchange code for token"})
		return
	}

	// Get user info from Facebook
	userInfo, err := h.getFacebookUserInfo(token.AccessToken)
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to get user info"})
		return
	}

	// Create or update user
	user, err := h.createOrUpdateOAuthUser(userInfo.Email, userInfo.Name, userInfo.Picture.Data.URL, string(db.OAuthFacebook), userInfo.ID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create/update user"})
		return
	}

	// Generate JWT token
	jwtToken, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(200, gin.H{
		"user": gin.H{
			"id":          user.ID.String(),
			"email":       user.Email,
			"displayName": user.DisplayName,
			"role":        string(user.Role),
			"avatarUrl":   user.AvatarURL,
		},
		"token": jwtToken,
	})
}

// Twitter OAuth
func (h *OAuthHandler) TwitterCallback(c *gin.Context) {
	var req OAuthCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	// Exchange code for access token
	token, err := h.exchangeTwitterCode(req.Code)
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to exchange code for token"})
		return
	}

	// Get user info from Twitter
	userInfo, err := h.getTwitterUserInfo(token.AccessToken)
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to get user info"})
		return
	}

	// Create or update user
	user, err := h.createOrUpdateOAuthUser(userInfo.Email, userInfo.Name, userInfo.ProfileImageURL, string(db.OAuthTwitter), userInfo.ID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create/update user"})
		return
	}

	// Generate JWT token
	jwtToken, err := auth.IssueToken(user.ID.String(), string(user.Role))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(200, gin.H{
		"user": gin.H{
			"id":          user.ID.String(),
			"email":       user.Email,
			"displayName": user.DisplayName,
			"role":        string(user.Role),
			"avatarUrl":   user.AvatarURL,
		},
		"token": jwtToken,
	})
}

// Helper functions
func (h *OAuthHandler) exchangeGoogleCode(code string) (*OAuthTokenResponse, error) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURI := os.Getenv("GOOGLE_REDIRECT_URI")

	url := fmt.Sprintf("https://oauth2.googleapis.com/token?client_id=%s&client_secret=%s&code=%s&grant_type=authorization_code&redirect_uri=%s",
		clientID, clientSecret, code, redirectURI)

	resp, err := http.Post(url, "application/x-www-form-urlencoded", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp OAuthTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

func (h *OAuthHandler) getGoogleUserInfo(accessToken string) (*GoogleUserInfo, error) {
	url := fmt.Sprintf("https://www.googleapis.com/oauth2/v2/userinfo?access_token=%s", accessToken)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

func (h *OAuthHandler) exchangeFacebookCode(code string) (*OAuthTokenResponse, error) {
	clientID := os.Getenv("FACEBOOK_CLIENT_ID")
	clientSecret := os.Getenv("FACEBOOK_CLIENT_SECRET")
	redirectURI := os.Getenv("FACEBOOK_REDIRECT_URI")

	url := fmt.Sprintf("https://graph.facebook.com/v18.0/oauth/access_token?client_id=%s&client_secret=%s&code=%s&redirect_uri=%s",
		clientID, clientSecret, code, redirectURI)

	resp, err := http.Post(url, "application/x-www-form-urlencoded", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp OAuthTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

func (h *OAuthHandler) getFacebookUserInfo(accessToken string) (*FacebookUserInfo, error) {
	url := fmt.Sprintf("https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=%s", accessToken)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userInfo FacebookUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

func (h *OAuthHandler) exchangeTwitterCode(code string) (*OAuthTokenResponse, error) {
	clientID := os.Getenv("TWITTER_CLIENT_ID")
	clientSecret := os.Getenv("TWITTER_CLIENT_SECRET")
	redirectURI := os.Getenv("TWITTER_REDIRECT_URI")

	// Twitter uses OAuth 2.0 PKCE flow
	// This is a simplified implementation - in production, you'd need to implement PKCE
	url := fmt.Sprintf("https://api.twitter.com/2/oauth2/token?client_id=%s&client_secret=%s&code=%s&grant_type=authorization_code&redirect_uri=%s",
		clientID, clientSecret, code, redirectURI)

	resp, err := http.Post(url, "application/x-www-form-urlencoded", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp OAuthTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

func (h *OAuthHandler) getTwitterUserInfo(accessToken string) (*TwitterUserInfo, error) {
	url := "https://api.twitter.com/2/users/me?user.fields=profile_image_url"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var response struct {
		Data TwitterUserInfo `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	return &response.Data, nil
}

func (h *OAuthHandler) createOrUpdateOAuthUser(email, displayName, avatarURL, provider, oauthID string) (*db.User, error) {
	var user db.User

	// Check if user exists by email
	err := h.DB.Where("email = ?", email).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		// Create new user
		user = db.User{
			ID:            uuid.New(),
			Email:         email,
			DisplayName:   displayName,
			Role:          db.RoleCustomer, // Default role for OAuth users
			OAuthProvider: provider,
			OAuthID:       oauthID,
			AvatarURL:     avatarURL,
			CreatedAt:     time.Now(),
		}

		if err := h.DB.Create(&user).Error; err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	} else {
		// Update existing user with OAuth info
		user.OAuthProvider = provider
		user.OAuthID = oauthID
		user.AvatarURL = avatarURL
		user.DisplayName = displayName

		if err := h.DB.Save(&user).Error; err != nil {
			return nil, err
		}
	}

	return &user, nil
}
