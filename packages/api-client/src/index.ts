import axios, { AxiosInstance } from 'axios';
import type {
  User,
  Restaurant,
  Menu,
  Course,
  Organization,
  Reservation,
  Review,
  PaginatedResponse,
  CreateRestaurantRequest,
  CreateMenuRequest,
  CreateCourseRequest,
  CreateReservationRequest,
  CreateReviewRequest,
  LoginRequest,
  LoginResponse,
} from '@restosaas/types';

export interface ApiClientConfig {
  baseURL: string;
  getAuthToken?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private client: AxiosInstance;
  private getAuthToken?: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.getAuthToken = config.getAuthToken;
    this.onUnauthorized = config.onUnauthorized;

    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.onUnauthorized?.();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  // Restaurant endpoints
  async getRestaurants(params?: {
    page?: number;
    limit?: number;
    place?: string;
    genre?: string;
  }): Promise<PaginatedResponse<Restaurant>> {
    const response = await this.client.get('/restaurants', { params });
    return response.data;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant> {
    const response = await this.client.get(`/restaurants/${slug}`);
    return response.data;
  }

  async getRestaurantMenus(slug: string): Promise<Menu[]> {
    const response = await this.client.get(`/restaurants/${slug}/menus`);
    return response.data;
  }

  async getRestaurantCourses(slug: string): Promise<Course[]> {
    const response = await this.client.get(`/restaurants/${slug}/courses`);
    return response.data;
  }

  async getRestaurantReviews(slug: string): Promise<Review[]> {
    const response = await this.client.get(`/restaurants/${slug}/reviews`);
    return response.data;
  }

  // Owner endpoints
  async getMyRestaurants(): Promise<Restaurant[]> {
    const response = await this.client.get('/owner/restaurants/me');
    return response.data.restaurants || [];
  }

  async createRestaurant(data: CreateRestaurantRequest): Promise<Restaurant> {
    const response = await this.client.post('/owner/restaurants', data);
    return response.data;
  }

  async updateRestaurant(
    id: string,
    data: Partial<CreateRestaurantRequest>
  ): Promise<Restaurant> {
    const response = await this.client.put(`/owner/restaurants/${id}`, data);
    return response.data;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await this.client.delete(`/owner/restaurants/${id}`);
  }

  async getOwnerRestaurantMenus(restaurantId: string): Promise<Menu[]> {
    const response = await this.client.get(
      `/owner/restaurants/${restaurantId}/menus`
    );
    return response.data.menus || [];
  }

  async createMenu(
    restaurantId: string,
    data: CreateMenuRequest
  ): Promise<Menu> {
    const response = await this.client.post(
      `/owner/restaurants/${restaurantId}/menus`,
      data
    );
    return response.data;
  }

  async updateMenu(
    restaurantId: string,
    menuId: string,
    data: Partial<CreateMenuRequest>
  ): Promise<Menu> {
    const response = await this.client.put(
      `/owner/restaurants/${restaurantId}/menus/${menuId}`,
      data
    );
    return response.data;
  }

  async deleteMenu(restaurantId: string, menuId: string): Promise<void> {
    await this.client.delete(
      `/owner/restaurants/${restaurantId}/menus/${menuId}`
    );
  }

  async getOwnerRestaurantCourses(restaurantId: string): Promise<Course[]> {
    const response = await this.client.get(
      `/owner/restaurants/${restaurantId}/courses`
    );
    return response.data.courses || [];
  }

  async createCourse(
    restaurantId: string,
    data: CreateCourseRequest
  ): Promise<Course> {
    const response = await this.client.post(
      `/owner/restaurants/${restaurantId}/courses`,
      data
    );
    return response.data;
  }

  async updateCourse(
    restaurantId: string,
    courseId: string,
    data: Partial<CreateCourseRequest>
  ): Promise<Course> {
    const response = await this.client.put(
      `/owner/restaurants/${restaurantId}/courses/${courseId}`,
      data
    );
    return response.data;
  }

  async deleteCourse(restaurantId: string, courseId: string): Promise<void> {
    await this.client.delete(
      `/owner/restaurants/${restaurantId}/courses/${courseId}`
    );
  }

  async getReservations(): Promise<Reservation[]> {
    const response = await this.client.get('/owner/reservations');
    return response.data.reservations || [];
  }

  async approveReview(reviewId: string): Promise<void> {
    await this.client.post(`/owner/reviews/${reviewId}/approve`);
  }

  // Super Admin endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await this.client.get('/super-admin/users', { params });
    return response.data;
  }

  async createUser(data: {
    email: string;
    password: string;
    displayName: string;
    role: string;
  }): Promise<User> {
    const response = await this.client.post('/super-admin/users', data);
    return response.data;
  }

  async updateUser(
    id: string,
    data: Partial<{
      email: string;
      displayName: string;
      role: string;
    }>
  ): Promise<User> {
    const response = await this.client.put(`/super-admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/super-admin/users/${id}`);
  }

  async getOrganizations(): Promise<Organization[]> {
    const response = await this.client.get('/super-admin/organizations');
    return response.data.organizations || [];
  }

  async createOrganization(data: { name: string }): Promise<Organization> {
    const response = await this.client.post('/super-admin/organizations', data);
    return response.data;
  }

  async updateOrganization(
    id: string,
    data: { name: string }
  ): Promise<Organization> {
    const response = await this.client.put(
      `/super-admin/organizations/${id}`,
      data
    );
    return response.data;
  }

  async deleteOrganization(id: string): Promise<void> {
    await this.client.delete(`/super-admin/organizations/${id}`);
  }

  async assignOwnerToOrganization(
    orgId: string,
    ownerId: string
  ): Promise<void> {
    await this.client.post(`/super-admin/organizations/${orgId}/assign-owner`, {
      ownerId,
    });
  }

  async assignUsersToOrganization(
    orgId: string,
    userIds: string[]
  ): Promise<void> {
    await this.client.post(`/super-admin/organizations/${orgId}/assign-users`, {
      userIds,
    });
  }

  async getOrganizationMembers(orgId: string): Promise<User[]> {
    const response = await this.client.get(
      `/super-admin/organizations/${orgId}/members`
    );
    return response.data.members || [];
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    const response = await this.client.get('/super-admin/restaurants');
    return response.data.restaurants || [];
  }

  async createRestaurantForOrganization(
    orgId: string,
    data: CreateRestaurantRequest
  ): Promise<Restaurant> {
    const response = await this.client.post(
      `/super-admin/organizations/${orgId}/restaurants`,
      data
    );
    return response.data;
  }

  // Public endpoints
  async createReservation(
    data: CreateReservationRequest
  ): Promise<Reservation> {
    const response = await this.client.post('/reservations', data);
    return response.data;
  }

  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await this.client.post('/reviews', data);
    return response.data;
  }
}

// Factory function to create API client
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
