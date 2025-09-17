import { schemas } from '../validations';

describe('Validations', () => {
  describe('restaurant validation', () => {
    it('should validate correct restaurant data', () => {
      const validRestaurant = {
        name: 'Test Restaurant',
        slogan: 'Great food',
        place: 'New York',
        genre: 'Italian',
        budget: '$$',
        title: 'Authentic Italian',
        description: 'A great restaurant',
        address: '123 Main St',
        phone: '+15550123', // Valid phone number without hyphens
        capacity: 50,
        isOpen: true,
      };

      const result = schemas.restaurant.safeParse(validRestaurant);
      expect(result.success).toBe(true);
    });

    it('should reject restaurant with missing required fields', () => {
      const invalidRestaurant = {
        name: '',
        slogan: 'Great food',
        place: 'New York',
        genre: 'Italian',
        budget: '$$',
        title: 'Authentic Italian',
        capacity: 50,
      };

      const result = schemas.restaurant.safeParse(invalidRestaurant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should reject restaurant with invalid capacity', () => {
      const invalidRestaurant = {
        name: 'Test Restaurant',
        slogan: 'Great food',
        place: 'New York',
        genre: 'Italian',
        budget: '$$',
        title: 'Authentic Italian',
        capacity: 0, // Invalid capacity
      };

      const result = schemas.restaurant.safeParse(invalidRestaurant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('capacity');
      }
    });

    it('should reject restaurant with invalid phone number', () => {
      const invalidRestaurant = {
        name: 'Test Restaurant',
        slogan: 'Great food',
        place: 'New York',
        genre: 'Italian',
        budget: '$$',
        title: 'Authentic Italian',
        capacity: 50,
        phone: 'invalid-phone',
      };

      const result = schemas.restaurant.safeParse(invalidRestaurant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
      }
    });
  });

  describe('search validation', () => {
    it('should validate correct search data', () => {
      const validSearch = {
        area: 'New York',
        cuisine: 'Italian',
        budget: '$$',
        people: '2',
        date: '2024-01-01',
        time: '19:00',
      };

      const result = schemas.search.safeParse(validSearch);
      expect(result.success).toBe(true);
    });

    it('should validate search with minimal data', () => {
      const minimalSearch = {
        area: 'New York',
      };

      const result = schemas.search.safeParse(minimalSearch);
      expect(result.success).toBe(true);
    });

    it('should validate empty search', () => {
      const emptySearch = {};

      const result = schemas.search.safeParse(emptySearch);
      expect(result.success).toBe(true);
    });
  });

  describe('user validation', () => {
    it('should validate correct user data', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'John Doe',
        role: 'CUSTOMER',
      };

      const result = schemas.user.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject user with invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        displayName: 'John Doe',
        role: 'CUSTOMER',
      };

      const result = schemas.user.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject user with invalid role', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'John Doe',
        role: 'INVALID_ROLE',
      };

      const result = schemas.user.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('role');
      }
    });
  });

  describe('login validation', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = schemas.login.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject login with missing email', () => {
      const invalidLogin = {
        password: 'password123',
      };

      const result = schemas.login.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject login with missing password', () => {
      const invalidLogin = {
        email: 'test@example.com',
      };

      const result = schemas.login.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });

  describe('register validation', () => {
    it('should validate correct register data', () => {
      const validRegister = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'John Doe',
        role: 'CUSTOMER',
      };

      const result = schemas.register.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    it('should reject register with short password', () => {
      const invalidRegister = {
        email: 'test@example.com',
        password: '123',
        displayName: 'John Doe',
        role: 'CUSTOMER',
      };

      const result = schemas.register.safeParse(invalidRegister);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });
});
