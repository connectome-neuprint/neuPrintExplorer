import { isUnsafeNumber, findUnsafeNumbers, checkForUnsafeNumbers } from './numberUtils';

describe('numberUtils', () => {
  describe('isUnsafeNumber', () => {
    it('should identify safe numbers as safe', () => {
      expect(isUnsafeNumber(42)).toBe(false);
      expect(isUnsafeNumber(0)).toBe(false);
      expect(isUnsafeNumber(-1)).toBe(false);
      expect(isUnsafeNumber(Number.MAX_SAFE_INTEGER)).toBe(false);
      expect(isUnsafeNumber(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    it('should identify unsafe numbers as unsafe', () => {
      expect(isUnsafeNumber(Number.MAX_SAFE_INTEGER + 1)).toBe(true);
      expect(isUnsafeNumber(Number.MIN_SAFE_INTEGER - 1)).toBe(true);
      expect(isUnsafeNumber(9007199254740992)).toBe(true); // 2^53, unsafe integer
    });

    it('should handle non-numbers', () => {
      expect(isUnsafeNumber('123')).toBe(false);
      expect(isUnsafeNumber(null)).toBe(false);
      expect(isUnsafeNumber(undefined)).toBe(false);
      expect(isUnsafeNumber({})).toBe(false);
    });

    it('should NOT flag floating point numbers as unsafe', () => {
      expect(isUnsafeNumber(0.7484406232833862)).toBe(false);
      expect(isUnsafeNumber(3.14159)).toBe(false);
      expect(isUnsafeNumber(0.1 + 0.2)).toBe(false); // 0.30000000000000004
      expect(isUnsafeNumber(123.456)).toBe(false); // Regular float
      expect(isUnsafeNumber(Number.MIN_VALUE)).toBe(false); // Tiny float
      expect(isUnsafeNumber(1.23e-10)).toBe(false); // Scientific notation float
      expect(isUnsafeNumber(999999.999)).toBe(false); // Large but safe float
    });

    it('should only flag unsafe INTEGERS, not floats', () => {
      // Unsafe integers
      expect(isUnsafeNumber(Number.MAX_SAFE_INTEGER + 1)).toBe(true);
      expect(isUnsafeNumber(Number.MIN_SAFE_INTEGER - 1)).toBe(true);

      // Safe integers
      expect(isUnsafeNumber(Number.MAX_SAFE_INTEGER)).toBe(false);
      expect(isUnsafeNumber(Number.MIN_SAFE_INTEGER)).toBe(false);

      // Floats should never be flagged
      expect(isUnsafeNumber(123456.789)).toBe(false); // Regular float
      expect(isUnsafeNumber(-987.654)).toBe(false); // Negative float
    });

    it('should NOT flag large numbers when they are strings', () => {
      const largeNumberAsString = (Number.MAX_SAFE_INTEGER + 1).toString();
      expect(isUnsafeNumber(largeNumberAsString)).toBe(false);
      expect(isUnsafeNumber('9007199254740992')).toBe(false); // 2^53
      expect(isUnsafeNumber('999999999999999999999999')).toBe(false); // Very large number as string
    });
  });

  describe('findUnsafeNumbers', () => {
    it('should find unsafe numbers in simple objects', () => {
      const obj = {
        safe: 42,
        unsafe: Number.MAX_SAFE_INTEGER + 1
      };
      const result = findUnsafeNumbers(obj);
      expect(result).toEqual(['unsafe']);
    });

    it('should find unsafe numbers in nested objects', () => {
      const obj = {
        level1: {
          level2: {
            unsafe: Number.MAX_SAFE_INTEGER + 1,
            safe: 42
          }
        }
      };
      const result = findUnsafeNumbers(obj);
      expect(result).toEqual(['level1.level2.unsafe']);
    });

    it('should find unsafe numbers in arrays', () => {
      const arr = [42, Number.MAX_SAFE_INTEGER + 1, 'safe'];
      const result = findUnsafeNumbers(arr);
      expect(result).toEqual(['[1]']);
    });

    it('should find unsafe numbers in complex nested structures', () => {
      const obj = {
        data: [
          { id: 1, value: 42 },
          { id: Number.MAX_SAFE_INTEGER + 1, value: 'test' }
        ],
        metadata: {
          count: Number.MAX_SAFE_INTEGER + 2
        }
      };
      const result = findUnsafeNumbers(obj);
      expect(result).toContain('data[1].id');
      expect(result).toContain('metadata.count');
    });

    it('should NOT flag large numbers when they are strings in complex structures', () => {
      const obj = {
        data: [
          { id: '9007199254740992', value: 42 }, // Large number as string - should be ignored
          { id: Number.MAX_SAFE_INTEGER + 1, value: 'test' } // Actual unsafe number
        ],
        metadata: {
          count: '999999999999999999999999', // Very large number as string - should be ignored
          unsafeCount: Number.MAX_SAFE_INTEGER + 2 // Actual unsafe number
        }
      };
      const result = findUnsafeNumbers(obj);
      expect(result).not.toContain('data[0].id'); // String should be ignored
      expect(result).not.toContain('metadata.count'); // String should be ignored
      expect(result).toContain('data[1].id'); // Actual number should be flagged
      expect(result).toContain('metadata.unsafeCount'); // Actual number should be flagged
    });
  });

  describe('checkForUnsafeNumbers', () => {
    it('should return false for safe responses', () => {
      const response = {
        data: [[1, 2, 3], ['a', 'b', 'c']],
        columns: ['col1', 'col2', 'col3']
      };
      const result = checkForUnsafeNumbers(response);
      expect(result.hasUnsafeNumbers).toBe(false);
      expect(result.unsafePaths).toEqual([]);
    });

    it('should return true for unsafe responses', () => {
      const response = {
        data: [[Number.MAX_SAFE_INTEGER + 1, 2, 3]],
        columns: ['col1', 'col2', 'col3']
      };
      const result = checkForUnsafeNumbers(response);
      expect(result.hasUnsafeNumbers).toBe(true);
      expect(result.unsafePaths).toContain('data[0][0]');
    });

    it('should return false when large numbers are strings', () => {
      const response = {
        data: [['9007199254740992', 2, 3]], // Large number as string
        columns: ['col1', 'col2', 'col3'],
        metadata: {
          largeId: '999999999999999999999999' // Very large number as string
        }
      };
      const result = checkForUnsafeNumbers(response);
      expect(result.hasUnsafeNumbers).toBe(false);
      expect(result.unsafePaths).toEqual([]);
    });
  });
});