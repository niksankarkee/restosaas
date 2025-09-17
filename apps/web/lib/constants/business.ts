// Business Logic Constants
export const BUSINESS = {
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 1000,
  MIN_PRICE: 0,
  MAX_PRICE: 1000000, // 1 million
  MIN_RATING: 1,
  MAX_RATING: 5,
  DEFAULT_STAY_TIME: 60, // minutes
  DEFAULT_TIMEOUT: 30, // seconds
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 10,
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300, // ms
  ANIMATION_DURATION: 200, // ms
  TOAST_DURATION: 3000, // ms
  MODAL_ANIMATION_DURATION: 150, // ms
} as const;

// Currency Constants
export const CURRENCY = {
  SYMBOL: 'Rs',
  CODE: 'NPR',
  DECIMAL_PLACES: 0,
} as const;

// Weekdays
export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// Time Formats
export const TIME_FORMATS = {
  TIME_12H: 'h:mm A',
  TIME_24H: 'HH:mm',
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm',
} as const;
