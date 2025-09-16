import { z } from 'zod';
import { APP_TEXT } from './constants';

// Common validation schemas
export const commonValidations = {
  required: (field: string) => z.string().min(1, `${field} is required`),
  email: z.string().email(APP_TEXT.VALIDATION.EMAIL_INVALID),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, APP_TEXT.VALIDATION.PHONE_INVALID),
  url: z.string().url(APP_TEXT.VALIDATION.URL_INVALID),
  minLength: (min: number) =>
    z
      .string()
      .min(
        min,
        APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', min.toString())
      ),
  maxLength: (max: number) =>
    z
      .string()
      .max(
        max,
        APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', max.toString())
      ),
  minValue: (min: number) =>
    z
      .number()
      .min(min, APP_TEXT.VALIDATION.MIN_VALUE.replace('{min}', min.toString())),
  maxValue: (max: number) =>
    z
      .number()
      .max(max, APP_TEXT.VALIDATION.MAX_VALUE.replace('{max}', max.toString())),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().min(0, 'Must be a non-negative number'),
};

// Restaurant validation schemas
export const restaurantValidation = {
  name: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),

  slogan: z
    .string()
    .min(5, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '5'))
    .max(200, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '200')),

  place: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),

  genre: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(50, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '50')),

  budget: z.enum(['$', '$$', '$$$', '$$$$'], {
    errorMap: () => ({ message: 'Please select a valid budget range' }),
  }),

  title: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),

  description: z
    .string()
    .max(2000, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '2000'))
    .optional(),

  address: z
    .string()
    .max(200, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '200'))
    .optional(),

  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, APP_TEXT.VALIDATION.PHONE_INVALID)
    .optional()
    .or(z.literal('')),

  capacity: z
    .number()
    .int('Must be a whole number')
    .min(1, APP_TEXT.VALIDATION.MIN_VALUE.replace('{min}', '1'))
    .max(1000, APP_TEXT.VALIDATION.MAX_VALUE.replace('{max}', '1000')),

  isOpen: z.boolean(),
};

// Search validation schemas
export const searchValidation = {
  area: z.string().optional(),
  cuisine: z.string().optional(),
  budget: z.enum(['all', '$', '$$', '$$$', '$$$$']).optional(),
  people: z.string().regex(/^\d+$/, 'Must be a valid number').optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)')
    .optional(),
  time: z.string().optional(),
  sortBy: z.enum(['rating', 'name', 'created_at', 'capacity']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  page: z.string().regex(/^\d+$/, 'Must be a valid page number').optional(),
  limit: z.string().regex(/^\d+$/, 'Must be a valid limit number').optional(),
};

// User validation schemas
export const userValidation = {
  email: commonValidations.email,
  password: z
    .string()
    .min(4, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '4'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),
  displayName: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),
  role: z.enum(['SUPER_ADMIN', 'OWNER', 'CUSTOMER'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
};

// Review validation schemas
export const reviewValidation = {
  rating: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),
  comment: z
    .string()
    .min(10, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '10'))
    .max(1000, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '1000')),
  customerName: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),
};

// Reservation validation schemas
export const reservationValidation = {
  restaurantSlug: z.string().min(1, 'Restaurant is required'),
  customerName: z
    .string()
    .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2'))
    .max(100, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '100')),
  customerEmail: commonValidations.email,
  customerPhone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, APP_TEXT.VALIDATION.PHONE_INVALID)
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)'),
  time: z.string().min(1, 'Time is required'),
  guests: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Must have at least 1 guest')
    .max(20, 'Maximum 20 guests allowed'),
  specialRequests: z
    .string()
    .max(500, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '500'))
    .optional(),
};

// Image validation schemas
export const imageValidation = {
  url: z.string().url(APP_TEXT.VALIDATION.URL_INVALID),
  alt: z
    .string()
    .max(200, APP_TEXT.VALIDATION.MAX_LENGTH.replace('{max}', '200'))
    .optional(),
  isMain: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
};

// Complete form schemas
export const schemas = {
  restaurant: z.object(restaurantValidation),
  search: z.object(searchValidation),
  user: z.object(userValidation),
  review: z.object(reviewValidation),
  reservation: z.object(reservationValidation),
  image: z.object(imageValidation),
  login: z.object({
    email: commonValidations.email,
    password: z.string().min(1, 'Password is required'),
  }),
  register: z.object({
    email: commonValidations.email,
    password: z
      .string()
      .min(4, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '4')),
    displayName: z
      .string()
      .min(2, APP_TEXT.VALIDATION.MIN_LENGTH.replace('{min}', '2')),
    role: userValidation.role,
  }),
} as const;

// Helper function to get validation error message
export const getValidationError = (error: z.ZodError): string => {
  return error.errors[0]?.message || APP_TEXT.VALIDATION.CUSTOM_ERROR;
};

// Helper function to validate form data
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: getValidationError(error) };
    }
    return { success: false, error: APP_TEXT.VALIDATION.CUSTOM_ERROR };
  }
};
