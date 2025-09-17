// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 4,
  MAX_PASSWORD_LENGTH: 100,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 255,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 20,
  MIN_ADDRESS_LENGTH: 5,
  MAX_ADDRESS_LENGTH: 500,
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 1000,
} as const;

// Form Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  URL: /^https?:\/\/.+/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // General
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',

  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_ALREADY_EXISTS: 'User with this email already exists.',
  LOGIN_REQUIRED: 'Please log in to continue.',

  // Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long.`,
  PASSWORD_TOO_LONG: `Password must be no more than ${VALIDATION.MAX_PASSWORD_LENGTH} characters long.`,
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION.MIN_NAME_LENGTH} character long.`,
  NAME_TOO_LONG: `Name must be no more than ${VALIDATION.MAX_NAME_LENGTH} characters long.`,
  TITLE_TOO_SHORT: `Title must be at least ${VALIDATION.MIN_TITLE_LENGTH} character long.`,
  TITLE_TOO_LONG: `Title must be no more than ${VALIDATION.MAX_TITLE_LENGTH} characters long.`,
  DESCRIPTION_TOO_LONG: `Description must be no more than ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters long.`,
  PHONE_TOO_SHORT: `Phone number must be at least ${VALIDATION.MIN_PHONE_LENGTH} digits long.`,
  PHONE_TOO_LONG: `Phone number must be no more than ${VALIDATION.MAX_PHONE_LENGTH} digits long.`,
  ADDRESS_TOO_SHORT: `Address must be at least ${VALIDATION.MIN_ADDRESS_LENGTH} characters long.`,
  ADDRESS_TOO_LONG: `Address must be no more than ${VALIDATION.MAX_ADDRESS_LENGTH} characters long.`,
  REVIEW_TOO_SHORT: `Review must be at least ${VALIDATION.MIN_REVIEW_LENGTH} characters long.`,
  REVIEW_TOO_LONG: `Review must be no more than ${VALIDATION.MAX_REVIEW_LENGTH} characters long.`,
} as const;
