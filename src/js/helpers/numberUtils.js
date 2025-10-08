// Utility functions for handling large numbers in JSON responses

/**
 * Checks if an integer is too large to be safely represented in JavaScript
 * JavaScript can safely represent integers up to Number.MAX_SAFE_INTEGER (2^53 - 1)
 * Only checks integers, not floating point numbers
 */
export function isUnsafeNumber(value) {
  return typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value);
}

/**
 * Recursively checks an object or array for unsafe numbers
 * Returns an array of paths where unsafe numbers are found
 */
export function findUnsafeNumbers(obj, path = '') {
  const unsafePaths = [];

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const currentPath = path ? `${path}[${index}]` : `[${index}]`;
      if (isUnsafeNumber(item)) {
        unsafePaths.push(currentPath);
      } else if (typeof item === 'object' && item !== null) {
        unsafePaths.push(...findUnsafeNumbers(item, currentPath));
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      if (isUnsafeNumber(value)) {
        unsafePaths.push(currentPath);
      } else if (typeof value === 'object' && value !== null) {
        unsafePaths.push(...findUnsafeNumbers(value, currentPath));
      }
    });
  }

  return unsafePaths;
}

/**
 * Checks if a JSON response contains numbers that are too large for JavaScript
 * Returns an object with hasUnsafeNumbers boolean and array of paths
 */
export function checkForUnsafeNumbers(jsonResponse) {
  const unsafePaths = findUnsafeNumbers(jsonResponse);
  return {
    hasUnsafeNumbers: unsafePaths.length > 0,
    unsafePaths
  };
}