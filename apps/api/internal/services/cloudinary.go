package services

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"os"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/joho/godotenv"
)

type CloudinaryService struct {
	cld *cloudinary.Cloudinary
}

func NewCloudinaryService() (*CloudinaryService, error) {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf("error loading .env file: %w", err)
	}

	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	fmt.Printf("Cloudinary credentials: cloudName=%s, apiKey=%s, apiSecret=%s\n", cloudName, apiKey, apiSecret)

	// Check if Cloudinary credentials are properly configured
	if cloudName == "" || cloudName == "your_cloud_name" ||
		apiKey == "" || apiKey == "your_api_key" ||
		apiSecret == "" || apiSecret == "your_api_secret" {
		return nil, fmt.Errorf("Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file")
	}

	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		fmt.Printf("Cloudinary initialization error: %v\n", err)
		return nil, fmt.Errorf("failed to initialize Cloudinary: %w", err)
	}
	fmt.Printf("Cloudinary initialized successfully\n")
	return &CloudinaryService{cld: cld}, nil
}

// UploadImage uploads an image file to Cloudinary
func (s *CloudinaryService) UploadImage(ctx context.Context, file multipart.File, folder string) (*uploader.UploadResult, error) {
	// Upload the image
	result, err := s.cld.Upload.Upload(
		ctx,
		file,
		uploader.UploadParams{
			Folder:         folder,
			Transformation: "f_auto,q_auto",
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to upload image: %w", err)
	}

	return result, nil
}

// UploadImageFromURL uploads an image from a URL to Cloudinary
func (s *CloudinaryService) UploadImageFromURL(ctx context.Context, imageURL, folder string) (*uploader.UploadResult, error) {
	// Upload the image from URL
	result, err := s.cld.Upload.Upload(
		ctx,
		imageURL,
		uploader.UploadParams{
			Folder:         folder,
			Transformation: "f_auto,q_auto",
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to upload image from URL: %w", err)
	}

	return result, nil
}

// UploadBase64Image uploads a base64 encoded image to Cloudinary
func (s *CloudinaryService) UploadBase64Image(ctx context.Context, base64Image, folder string) (*uploader.UploadResult, error) {
	// Extract base64 data part (e.g., "data:image/jpeg;base64,..." -> "...")
	parts := strings.SplitN(base64Image, ",", 2)
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid base64 image format")
	}
	base64Data := parts[1]

	// Decode base64 string
	decoded, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64 image: %w", err)
	}

	// Upload decoded image data with signed upload
	result, err := s.cld.Upload.Upload(
		ctx,
		bytes.NewReader(decoded),
		uploader.UploadParams{
			Folder:         folder,
			Transformation: "f_auto,q_auto",
			PublicID:       "", // Let Cloudinary generate a unique ID
		},
	)
	if err != nil {
		fmt.Printf("Cloudinary upload error: %v\n", err)
		return nil, fmt.Errorf("failed to upload base64 image: %w", err)
	}

	return result, nil
}

// DeleteImage deletes an image from Cloudinary
func (s *CloudinaryService) DeleteImage(ctx context.Context, publicID string) (*uploader.DestroyResult, error) {
	result, err := s.cld.Upload.Destroy(
		ctx,
		uploader.DestroyParams{
			PublicID: publicID,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to delete image: %w", err)
	}

	return result, nil
}

// GetImageURL returns the URL for an image with optional transformations
func (s *CloudinaryService) GetImageURL(publicID string, transformations ...string) string {
	// For now, return a simple URL construction
	// This can be enhanced later with proper Cloudinary URL generation
	baseURL := "https://res.cloudinary.com/" + os.Getenv("CLOUDINARY_CLOUD_NAME") + "/image/upload"

	if len(transformations) > 0 {
		baseURL += "/" + strings.Join(transformations, ",")
	}

	return baseURL + "/" + publicID
}
