import { cn } from '../utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('class1', true && 'class2', false && 'class3')).toBe(
        'class1 class2'
      );
    });

    it('should handle undefined and null values', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
    });

    it('should handle empty strings', () => {
      expect(cn('class1', '', 'class2')).toBe('class1 class2');
    });

    it('should handle complex conditional logic', () => {
      const isActive = true;
      const isDisabled = false;
      expect(
        cn(
          'base-class',
          isActive && 'active-class',
          isDisabled && 'disabled-class',
          'always-class'
        )
      ).toBe('base-class active-class always-class');
    });
  });
});
