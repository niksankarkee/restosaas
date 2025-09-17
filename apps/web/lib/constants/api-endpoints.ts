// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  OAUTH_GOOGLE: '/auth/oauth/google',
  OAUTH_FACEBOOK: '/auth/oauth/facebook',
  OAUTH_TWITTER: '/auth/oauth/twitter',
  ME: '/users/me',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Restaurants
  RESTAURANTS: '/restaurants',
  RESTAURANT_BY_SLUG: (slug: string) => `/restaurants/${slug}`,
  RESTAURANT_MENUS: (slug: string) => `/restaurants/${slug}/menus`,
  RESTAURANT_COURSES: (slug: string) => `/restaurants/${slug}/courses`,
  RESTAURANT_REVIEWS: (slug: string) => `/restaurants/${slug}/reviews`,

  // Owner
  OWNER_RESTAURANTS: '/owner/restaurants/me',
  OWNER_RESTAURANT_BY_ID: (id: string) => `/owner/restaurants/${id}`,
  OWNER_RESTAURANT_HOURS: (id: string) => `/owner/restaurants/${id}/hours`,
  OWNER_RESTAURANT_IMAGES: (id: string) => `/owner/restaurants/${id}/images`,
  OWNER_RESTAURANT_SET_MAIN_IMAGE: (id: string, imageId: string) =>
    `/owner/restaurants/${id}/images/${imageId}/set-main`,
  OWNER_RESTAURANT_MENUS: (id: string) => `/owner/restaurants/${id}/menus`,
  OWNER_RESTAURANT_MENU_BY_ID: (id: string, menuId: string) =>
    `/owner/restaurants/${id}/menus/${menuId}`,
  OWNER_RESTAURANT_COURSES: (id: string) => `/owner/restaurants/${id}/courses`,
  OWNER_RESTAURANT_COURSE_BY_ID: (id: string, courseId: string) =>
    `/owner/restaurants/${id}/courses/${courseId}`,
  OWNER_RESERVATIONS: '/owner/reservations',
  OWNER_APPROVE_REVIEW: (id: string) => `/owner/reviews/${id}/approve`,

  // Super Admin
  SUPER_ADMIN_USERS: '/super-admin/users',
  SUPER_ADMIN_USER_BY_ID: (id: string) => `/super-admin/users/${id}`,
  SUPER_ADMIN_RESTAURANTS: '/super-admin/restaurants',
  SUPER_ADMIN_RESTAURANT_BY_ID: (id: string) =>
    `/super-admin/restaurants/${id}`,
  SUPER_ADMIN_ORGANIZATIONS: '/super-admin/organizations',
  SUPER_ADMIN_ORGANIZATION_BY_ID: (id: string) =>
    `/super-admin/organizations/${id}`,
  SUPER_ADMIN_ORGANIZATION_MEMBERS: (id: string) =>
    `/super-admin/organizations/${id}/members`,
  SUPER_ADMIN_ORGANIZATION_ASSIGN_OWNER: (id: string) =>
    `/super-admin/organizations/${id}/assign-owner`,
  SUPER_ADMIN_ORGANIZATION_ASSIGN_USERS: (id: string) =>
    `/super-admin/organizations/${id}/assign-users`,
  SUPER_ADMIN_ORGANIZATION_RESTAURANTS: (id: string) =>
    `/super-admin/organizations/${id}/restaurants`,

  // Reviews
  REVIEWS: '/reviews',

  // Search
  SEARCH: '/search',
  SEARCH_SUGGESTIONS: '/search/suggestions',
  SEARCH_CACHE_CLEAR: '/search/cache',
  SEARCH_CACHE_STATS: '/search/cache/stats',
} as const;
