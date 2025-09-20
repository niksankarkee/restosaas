import axios from 'axios';
import type {
  CreateMenuRequest,
  CreateCourseRequest,
  UpdateMenuRequest,
  UpdateCourseRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
} from '@restosaas/types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080/api',
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  register: (userData: CreateUserRequest) => apiClient.post('/users', userData),

  getMe: () => apiClient.get('/users/me'),

  // Users
  getUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    apiClient.get('/users', { params }),
  getUser: (id: string) => apiClient.get(`/users/${id}`),
  createUser: (userData: CreateUserRequest) =>
    apiClient.post('/users', userData),
  updateUser: (id: string, userData: UpdateUserRequest) =>
    apiClient.put(`/users/${id}`, userData),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),

  // Organizations
  getOrganizations: () => apiClient.get('/super-admin/organizations'),
  getOrganization: (id: string) =>
    apiClient.get(`/super-admin/organizations/${id}`),
  createOrganization: (orgData: CreateOrganizationRequest) =>
    apiClient.post('/super-admin/organizations', orgData),
  updateOrganization: (id: string, orgData: UpdateOrganizationRequest) =>
    apiClient.put(`/super-admin/organizations/${id}`, orgData),
  deleteOrganization: (id: string) =>
    apiClient.delete(`/super-admin/organizations/${id}`),

  // Restaurants
  getAllRestaurants: () => apiClient.get('/super-admin/restaurants'),
  getRestaurant: (id: string) =>
    apiClient.get(`/super-admin/restaurants/${id}`),
  createRestaurant: (restaurantData: CreateRestaurantRequest) =>
    apiClient.post('/super-admin/restaurants', restaurantData),
  updateRestaurant: (id: string, restaurantData: UpdateRestaurantRequest) =>
    apiClient.put(`/super-admin/restaurants/${id}`, restaurantData),
  deleteRestaurant: (id: string) =>
    apiClient.delete(`/super-admin/restaurants/${id}`),

  // Owner restaurants
  getMyRestaurants: () => apiClient.get('/owner/restaurants/me'),
  createMyRestaurant: (restaurantData: CreateRestaurantRequest) =>
    apiClient.post('/owner/restaurants', restaurantData),
  updateMyRestaurant: (id: string, restaurantData: UpdateRestaurantRequest) =>
    apiClient.put(`/owner/restaurants/${id}`, restaurantData),
  deleteMyRestaurant: (id: string) =>
    apiClient.delete(`/owner/restaurants/${id}`),

  // Menus
  getMenus: (restaurantId: string) =>
    apiClient.get(`/owner/restaurants/${restaurantId}/menus`),
  getOwnerRestaurantMenus: (restaurantId: string) =>
    apiClient.get(`/owner/restaurants/${restaurantId}/menus`),
  createMenu: (restaurantId: string, menuData: CreateMenuRequest) =>
    apiClient.post(`/owner/restaurants/${restaurantId}/menus`, menuData),
  updateMenu: (
    restaurantId: string,
    menuId: string,
    menuData: UpdateMenuRequest
  ) =>
    apiClient.put(
      `/owner/restaurants/${restaurantId}/menus/${menuId}`,
      menuData
    ),
  deleteMenu: (restaurantId: string, menuId: string) =>
    apiClient.delete(`/owner/restaurants/${restaurantId}/menus/${menuId}`),

  // Courses
  getCourses: (restaurantId: string) =>
    apiClient.get(`/owner/restaurants/${restaurantId}/courses`),
  getOwnerRestaurantCourses: (restaurantId: string) =>
    apiClient.get(`/owner/restaurants/${restaurantId}/courses`),
  createCourse: (restaurantId: string, courseData: CreateCourseRequest) =>
    apiClient.post(`/owner/restaurants/${restaurantId}/courses`, courseData),
  updateCourse: (
    restaurantId: string,
    courseId: string,
    courseData: UpdateCourseRequest
  ) =>
    apiClient.put(
      `/owner/restaurants/${restaurantId}/courses/${courseId}`,
      courseData
    ),
  deleteCourse: (restaurantId: string, courseId: string) =>
    apiClient.delete(`/owner/restaurants/${restaurantId}/courses/${courseId}`),

  // Image Management
  addImageToRestaurant: (
    restaurantId: string,
    imageData: { url: string; alt: string; isMain?: boolean }
  ) =>
    apiClient.post(
      `/owner/restaurants/${restaurantId}/images/single`,
      imageData
    ),
  setMainImage: (restaurantId: string, imageId: string) =>
    apiClient.post(
      `/owner/restaurants/${restaurantId}/images/${imageId}/set-main`
    ),
  deleteImageFromRestaurant: (restaurantId: string, imageId: string) =>
    apiClient.delete(`/owner/restaurants/${restaurantId}/images/${imageId}`),
};

export { apiClient };
