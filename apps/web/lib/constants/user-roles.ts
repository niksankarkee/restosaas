// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  CUSTOMER: 'CUSTOMER',
} as const;

// Menu Types
export const MENU_TYPES = {
  FOOD: 'FOOD',
  DRINK: 'DRINK',
} as const;

// Meal Types
export const MEAL_TYPES = {
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  BOTH: 'BOTH',
} as const;

// OAuth Providers
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
} as const;
