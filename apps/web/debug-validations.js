const { z } = require('zod');

// Simple test to understand the validation issue
const testRestaurant = {
  name: 'Test Restaurant',
  slogan: 'Great food',
  place: 'New York',
  genre: 'Italian',
  budget: '$$',
  title: 'Authentic Italian',
  description: 'A great restaurant',
  address: '123 Main St',
  phone: '+1-555-0123',
  capacity: 50,
  isOpen: true,
};

// Create a simple restaurant schema
const restaurantSchema = z.object({
  name: z.string().min(2),
  slogan: z.string().min(5),
  place: z.string().min(1),
  genre: z.string().min(1),
  budget: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/)
    .optional(),
  capacity: z.number().positive(),
  isOpen: z.boolean().optional(),
});

const result = restaurantSchema.safeParse(testRestaurant);
console.log('Validation result:', result);
if (!result.success) {
  console.log('Errors:', result.error.issues);
}
