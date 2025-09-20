// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'CUSTOMER';
  createdAt: string;
}

// Restaurant types
export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  slogan?: string;
  place: string;
  genre?: string;
  budget?: string;
  title?: string;
  description?: string;
  address?: string;
  phone?: string;
  timezone: string;
  capacity: number;
  isOpen: boolean;
  mainImageId?: string;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  openHours?: OpeningHour[];
  images?: Image[];
  menus?: Menu[];
  courses?: Course[];
}

export interface OpeningHour {
  id: string;
  weekday: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Image {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  displayOrder: number;
}

// Menu types
export interface Menu {
  id: string;
  name: string;
  shortDesc: string;
  imageUrl?: string;
  price: number;
  type: 'FOOD' | 'DRINK';
  mealType: 'LUNCH' | 'DINNER' | 'BOTH';
  createdAt: string;
  updatedAt: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  coursePrice: number;
  originalPrice?: number;
  numberOfItems: number;
  stayTime: number;
  courseContent: string;
  precautions: string;
  createdAt: string;
  updatedAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  subscriptionStatus: 'INACTIVE' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  restaurantCount: number;
}

// Reservation types
export interface Reservation {
  id: string;
  restaurantId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number | string; // Backend accepts both
  specialRequests?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  courseId?: string;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  restaurantId: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiError {
  error: string;
  details?: string;
}

// Specific API response types matching backend responses
export interface RestaurantsResponse {
  restaurants: RestaurantResponse[];
}

export interface MenusResponse {
  menus: MenuResponse[];
}

export interface CoursesResponse {
  courses: CourseResponse[];
}

export interface UsersResponse {
  users: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface OrganizationsResponse {
  organizations: Organization[];
}

export interface ReviewsResponse {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}

// Form types (moved to API Request Types section below)

// Update request interfaces (moved to API Request Types section below)

// Response interfaces matching backend DTOs
export interface RestaurantResponse {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  place: string;
  genre: string;
  budget: string;
  title: string;
  description: string;
  address: string;
  phone: string;
  timezone: string;
  capacity: number;
  isOpen: boolean;
  mainImageId?: string;
  avgRating: number;
  reviewCount: number;
  openHours?: OpeningHourResponse[];
  images?: ImageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHourResponse {
  id: string;
  weekday: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ImageResponse {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  displayOrder: number;
}

export interface MenuResponse {
  id: string;
  restaurantId: string;
  name: string;
  shortDesc: string;
  imageUrl: string;
  price: number;
  type: string;
  mealType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  imageUrl: string;
  coursePrice: number;
  originalPrice?: number;
  numberOfItems: number;
  stayTime: number;
  courseContent: string;
  precautions: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

export interface UserWithTokenResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  token: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'CUSTOMER';
}

export interface CreateReservationRequest {
  restaurantId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number | string; // Backend accepts both
  specialRequests?: string;
  courseId?: string;
}

export interface CreateReviewRequest {
  restaurantId: string;
  customerName: string;
  rating: number;
  comment: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Constants
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  CUSTOMER: 'CUSTOMER',
} as const;

export const MENU_TYPES = {
  FOOD: 'FOOD',
  DRINK: 'DRINK',
} as const;

export const MEAL_TYPES = {
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  BOTH: 'BOTH',
} as const;

export const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export const SUBSCRIPTION_STATUS = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

// ============================================================================
// API REQUEST TYPES (matching backend DTOs)
// ============================================================================

// User API Requests
export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'CUSTOMER';
}

export interface UpdateUserRequest {
  email?: string;
  displayName?: string;
  role?: 'SUPER_ADMIN' | 'OWNER' | 'CUSTOMER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Auth API Requests
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'CUSTOMER';
}

// Organization API Requests
export interface CreateOrganizationRequest {
  name: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
}

export interface AssignOwnerRequest {
  ownerId: string;
}

export interface AssignMultipleUsersRequest {
  userIds: string[];
}

// Restaurant API Requests
export interface CreateRestaurantRequest {
  name: string;
  slogan: string;
  place: string;
  genre: string;
  budget: string;
  title: string;
  description: string;
  address: string;
  phone: string;
  timezone: string;
  capacity: number;
  isOpen: boolean;
  openHours?: OpeningHourRequest[];
  images?: ImageRequest[];
}

export interface UpdateRestaurantRequest {
  name?: string;
  slogan?: string;
  place?: string;
  genre?: string;
  budget?: string;
  title?: string;
  description?: string;
  address?: string;
  phone?: string;
  timezone?: string;
  capacity?: number;
  isOpen?: boolean;
  openHours?: OpeningHourRequest[];
  images?: ImageRequest[];
}

export interface OpeningHourRequest {
  weekday: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  openTime: string; // Format: "09:00"
  closeTime: string; // Format: "22:00"
  isClosed: boolean;
}

export interface ImageRequest {
  url: string;
  alt: string;
  isMain: boolean;
  displayOrder: number;
}

// Menu API Requests
export interface CreateMenuRequest {
  name: string;
  shortDesc: string;
  imageUrl: string;
  price: number;
  type: 'DRINK' | 'FOOD';
  mealType: 'LUNCH' | 'DINNER' | 'BOTH';
}

export interface UpdateMenuRequest {
  name?: string;
  shortDesc?: string;
  imageUrl?: string;
  price?: number;
  type?: 'DRINK' | 'FOOD';
  mealType?: 'LUNCH' | 'DINNER' | 'BOTH';
}

// Course API Requests
export interface CreateCourseRequest {
  title: string;
  description: string;
  imageUrl: string;
  coursePrice: number;
  originalPrice?: number;
  numberOfItems: number;
  stayTime: number;
  courseContent: string;
  precautions: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  coursePrice?: number;
  originalPrice?: number;
  numberOfItems?: number;
  stayTime?: number;
  courseContent?: string;
  precautions?: string;
}

// Reservation API Requests
export interface CreateReservationRequest {
  restaurantSlug: string;
  startsAt: string;
  duration: number;
  party: number;
  courseId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface CreateRestaurantReservationRequest {
  date: string;
  time: string;
  partySize: number | string; // Backend accepts both
  specialRequests?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

// Review API Requests
export interface CreateReviewRequest {
  restaurantSlug: string;
  customerId?: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
}

export interface CreateRestaurantReviewRequest {
  rating: number;
  title: string;
  comment: string;
  customerName: string;
  customerEmail: string;
}

// ============================================================================
// API RESPONSE TYPES (matching backend DTOs)
// ============================================================================

// User API Responses
export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

export interface UserWithTokenResponse extends UserResponse {
  token: string;
}

// Organization API Responses
export interface OrganizationResponse {
  id: string;
  name: string;
  subscriptionStatus: string;
  createdAt: string;
  restaurantCount: number;
}

// Restaurant API Responses (already defined above as RestaurantResponse)
// OpeningHourResponse and ImageResponse are already defined above

// Menu API Responses
export interface MenuResponse {
  id: string;
  restaurantId: string;
  name: string;
  shortDesc: string;
  imageUrl: string;
  price: number;
  type: string;
  mealType: string;
  createdAt: string;
  updatedAt: string;
}

// Course API Responses
export interface CourseResponse {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  imageUrl: string;
  coursePrice: number;
  originalPrice?: number;
  numberOfItems: number;
  stayTime: number;
  courseContent: string;
  precautions: string;
  createdAt: string;
  updatedAt: string;
}

// Reservation API Responses
export interface ReservationResponse {
  id: string;
  status: string;
  startsAt: string;
  partySize: number | string; // Backend accepts both
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
}

// Review API Responses
export interface ReviewResponse {
  id: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
}

// Image API Requests
export interface ImageRequest {
  url: string;
  alt: string;
  isMain: boolean;
}

// Image API Responses
export interface ImageResponse {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  displayOrder: number;
}

// ============================================================================
// PAGINATION AND LIST RESPONSES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrganizationsResponse {
  organizations: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RestaurantsResponse {
  restaurants: RestaurantResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MenusResponse {
  menus: MenuResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CoursesResponse {
  courses: CourseResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReservationsResponse {
  reservations: ReservationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, any>;
}
