# Restaurant SaaS API Documentation

## Overview

The Restaurant SaaS API is a comprehensive backend service for restaurant management and discovery. It provides endpoints for user management, restaurant operations, search functionality, and reservation handling.

## Base URL

```
http://localhost:8080/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'OWNER', 'CUSTOMER')),
    created_at TIMESTAMP NOT NULL
);
```

### Organizations Table

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

### Organization Members Table

```sql
CREATE TABLE org_members (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'OWNER', 'CUSTOMER')),
    UNIQUE(user_id, org_id)
);
```

### Restaurants Table

```sql
CREATE TABLE restaurants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    slogan VARCHAR(255) NOT NULL,
    place VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    budget VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    is_open BOOLEAN DEFAULT true,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    main_image_id UUID,
    created_at TIMESTAMP NOT NULL
);
```

### Restaurant Images Table

```sql
CREATE TABLE restaurant_images (
    id UUID PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL
);
```

### Opening Hours Table

```sql
CREATE TABLE opening_hours (
    id UUID PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL
);
```

### Reviews Table

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL
);
```

## API Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "role": "CUSTOMER"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00Z",
  "token": "jwt-token"
}
```

#### POST /auth/login

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00Z",
  "token": "jwt-token"
}
```

### Public Endpoints

#### GET /restaurants

Get a list of restaurants with pagination and filtering.

**Query Parameters:**

- `page` (int, optional): Page number (default: 1)
- `limit` (int, optional): Items per page (default: 10)
- `sort_by` (string, optional): Sort field (default: rating)
- `sort_dir` (string, optional): Sort direction (default: desc)
- `area` (string, optional): Filter by area
- `cuisine` (string, optional): Filter by cuisine
- `budget` (string, optional): Filter by budget

**Response (200):**

```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "Restaurant Name",
      "slug": "restaurant-slug",
      "slogan": "Great food",
      "place": "New York",
      "genre": "Italian",
      "budget": "$$",
      "title": "Authentic Italian",
      "description": "Description",
      "address": "123 Main St",
      "phone": "+1-555-0123",
      "capacity": 50,
      "is_open": true,
      "avg_rating": 4.5,
      "review_count": 10,
      "main_image_url": "https://example.com/image.jpg",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### GET /restaurants/:slug

Get restaurant details by slug.

**Response (200):**

```json
{
  "id": "uuid",
  "name": "Restaurant Name",
  "slug": "restaurant-slug",
  "slogan": "Great food",
  "place": "New York",
  "genre": "Italian",
  "budget": "$$",
  "title": "Authentic Italian",
  "description": "Description",
  "address": "123 Main St",
  "phone": "+1-555-0123",
  "capacity": 50,
  "is_open": true,
  "avg_rating": 4.5,
  "review_count": 10,
  "images": [
    {
      "id": "uuid",
      "image_url": "https://example.com/image.jpg",
      "is_main": true
    }
  ],
  "opening_hours": [
    {
      "day_of_week": 1,
      "open_time": "09:00:00",
      "close_time": "22:00:00",
      "is_closed": false
    }
  ],
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Great food!",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### GET /search

Advanced search with multiple filters.

**Query Parameters:**

- `area` (string, optional): Search by area
- `cuisine` (string, optional): Search by cuisine
- `budget` (string, optional): Search by budget
- `people` (string, optional): Number of people
- `date` (string, optional): Reservation date
- `time` (string, optional): Reservation time
- `sort_by` (string, optional): Sort field
- `sort_dir` (string, optional): Sort direction
- `page` (int, optional): Page number
- `limit` (int, optional): Items per page

**Response (200):**

```json
{
    "restaurants": [...],
    "total": 1,
    "page": 1,
    "limit": 10,
    "filters": {
        "area": "New York",
        "cuisine": "Italian",
        "budget": "$$"
    }
}
```

### User Management (Requires Authentication)

#### GET /users/me

Get current user information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Restaurant Management (Owner Only)

#### POST /owner/restaurants

Create a new restaurant.

**Headers:**

```
Authorization: Bearer <token>
X-User-ID: <user-id>
X-Org-ID: <org-id>
```

**Request Body:**

```json
{
  "name": "Restaurant Name",
  "slogan": "Great food",
  "place": "New York",
  "genre": "Italian",
  "budget": "$$",
  "title": "Authentic Italian",
  "description": "Description",
  "address": "123 Main St",
  "phone": "+1-555-0123",
  "capacity": 50,
  "isOpen": true
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Restaurant Name",
  "slug": "restaurant-name",
  "slogan": "Great food",
  "place": "New York",
  "genre": "Italian",
  "budget": "$$",
  "title": "Authentic Italian",
  "description": "Description",
  "address": "123 Main St",
  "phone": "+1-555-0123",
  "capacity": 50,
  "is_open": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /owner/restaurants/:id

Update restaurant information.

**Headers:**

```
Authorization: Bearer <token>
X-User-ID: <user-id>
X-Org-ID: <org-id>
```

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "capacity": 75
}
```

**Response (200):**

```json
{
  "id": "uuid",
  "name": "Updated Name",
  "slug": "updated-name",
  "slogan": "Great food",
  "place": "New York",
  "genre": "Italian",
  "budget": "$$",
  "title": "Authentic Italian",
  "description": "Updated description",
  "address": "123 Main St",
  "phone": "+1-555-0123",
  "capacity": 75,
  "is_open": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Super Admin Endpoints

#### GET /super-admin/restaurants

List all restaurants (Super Admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
    "restaurants": [...],
    "total": 1,
    "page": 1,
    "limit": 10
}
```

#### PUT /super-admin/restaurants/:id

Update any restaurant (Super Admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 409 Conflict

```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute per IP for public endpoints
- 1000 requests per minute per authenticated user

## Caching

Search results are cached for 5 minutes to improve performance. Cache can be cleared using:

- `DELETE /search/cache` - Clear all cache
- `GET /search/cache/stats` - Get cache statistics

## Data Flow

### User Registration Flow

1. User submits registration form
2. System validates input data
3. Password is hashed using SHA-256
4. User record is created in database
5. If role is OWNER, organization and org_member records are created
6. JWT token is generated and returned

### Restaurant Search Flow

1. User submits search parameters
2. System checks cache for existing results
3. If not cached, queries database with filters
4. Results are sorted and paginated
5. Average ratings are calculated
6. Results are cached and returned

### Authentication Flow

1. User submits login credentials
2. Password is hashed and compared
3. If valid, JWT token is generated
4. Token is returned to client
5. Client includes token in subsequent requests

## Testing

### Running Tests

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run tests with race detection
make test-race
```

### Test Coverage

The test suite covers:

- All API endpoints
- Database operations
- Authentication flows
- Search functionality
- Error handling
- Edge cases

## Deployment

### Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=restosaas
DB_PASSWORD=password
DB_NAME=restosaas
JWT_SECRET=your-secret-key
PORT=8080
```

### Docker Deployment

```bash
docker build -t restosaas-api .
docker run -p 8080:8080 restosaas-api
```

## Monitoring

### Health Check

```bash
curl http://localhost:8080/health
```

### Metrics

- Request count
- Response time
- Error rate
- Cache hit rate

## Security

- JWT tokens expire after 24 hours
- Passwords are hashed using SHA-256
- Input validation on all endpoints
- SQL injection prevention through GORM
- CORS enabled for frontend integration
