# OAuth Setup Guide

This guide explains how to set up OAuth authentication for Google, Facebook, and Twitter.

## Environment Variables

Add the following environment variables to your `.env` file:

### Backend (.env in apps/api/)

```env
# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google

# OAuth - Facebook
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/callback/facebook

# OAuth - Twitter
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_REDIRECT_URI=http://localhost:3000/auth/callback/twitter
```

### Frontend (.env.local in apps/web/)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=your-facebook-app-id
NEXT_PUBLIC_TWITTER_CLIENT_ID=your-twitter-client-id
```

## OAuth Provider Setup

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback/google` (development)
   - `https://yourdomain.com/auth/callback/google` (production)
7. Copy Client ID and Client Secret

### 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Go to "Facebook Login" → "Settings"
5. Add valid OAuth redirect URIs:
   - `http://localhost:3000/auth/callback/facebook` (development)
   - `https://yourdomain.com/auth/callback/facebook` (production)
6. Copy App ID and App Secret

### 3. Twitter OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Go to "App Settings" → "Authentication settings"
4. Enable OAuth 2.0
5. Add callback URLs:
   - `http://localhost:3000/auth/callback/twitter` (development)
   - `https://yourdomain.com/auth/callback/twitter` (production)
6. Copy Client ID and Client Secret

## Database Migration

The OAuth fields are automatically added to the users table. If you need to manually update the database:

```sql
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
```

## Testing OAuth

1. Start the backend server: `cd apps/api && go run main.go`
2. Start the frontend server: `cd apps/web && npm run dev`
3. Navigate to the login page
4. Click on any OAuth provider button
5. Complete the OAuth flow in the popup
6. You should be logged in automatically

## Features

- **OAuth Providers**: Google, Facebook, Twitter
- **User Creation**: Automatically creates users from OAuth data
- **User Updates**: Updates existing users with OAuth information
- **Error Handling**: Shows errors without closing the login dialog
- **Loading States**: Shows loading indicators during OAuth process
- **Popup Flow**: Uses popup windows for OAuth flow
- **Token Management**: Automatically stores and manages JWT tokens

## Security Notes

- Always use HTTPS in production
- Keep client secrets secure (server-side only)
- Validate OAuth tokens on the server
- Implement proper error handling
- Use secure redirect URIs
