/**
 * Security utilities for KeyQuest application
 * Provides input validation, sanitization, and XSS protection
 */

// Input validation patterns
const VALIDATION_PATTERNS = {
  playerName: /^[a-zA-Z0-9\s\-_]{1,20}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/
};

// Dangerous HTML patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
];

/**
 * Validates player name input
 * @param {string} name - Player name to validate
 * @returns {object} - Validation result with isValid and error message
 */
export const validatePlayerName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return { isValid: false, error: 'Name cannot be empty' };
  }

  if (trimmedName.length > 20) {
    return { isValid: false, error: 'Name must be 20 characters or less' };
  }

  if (!VALIDATION_PATTERNS.playerName.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }

  // Check for potential XSS patterns
  if (containsXSS(trimmedName)) {
    return { isValid: false, error: 'Invalid characters detected' };
  }

  return { isValid: true, sanitized: trimmedName };
};

/**
 * Sanitizes text input by escaping HTML entities
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Checks if text contains potential XSS patterns
 * @param {string} text - Text to check
 * @returns {boolean} - True if XSS patterns detected
 */
export const containsXSS = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  return XSS_PATTERNS.some(pattern => pattern.test(text));
};

/**
 * Validates and sanitizes form input
 * @param {object} input - Input object to validate
 * @param {object} rules - Validation rules
 * @returns {object} - Validation result
 */
export const validateInput = (input, rules) => {
  const errors = {};
  const sanitized = {};

  Object.keys(rules).forEach(field => {
    const value = input[field];
    const rule = rules[field];

    if (rule.required && (!value || value.trim().length === 0)) {
      errors[field] = `${field} is required`;
      return;
    }

    if (value) {
      const trimmedValue = value.trim();

      if (rule.maxLength && trimmedValue.length > rule.maxLength) {
        errors[field] = `${field} must be ${rule.maxLength} characters or less`;
        return;
      }

      if (rule.minLength && trimmedValue.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
        return;
      }

      if (rule.pattern && !rule.pattern.test(trimmedValue)) {
        errors[field] = rule.message || `${field} format is invalid`;
        return;
      }

      if (containsXSS(trimmedValue)) {
        errors[field] = `${field} contains invalid characters`;
        return;
      }

      sanitized[field] = sanitizeText(trimmedValue);
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

/**
 * Rate limiting utility (client-side)
 * @param {string} key - Rate limit key
 * @param {number} limit - Maximum requests
 * @param {number} window - Time window in milliseconds
 * @returns {boolean} - True if within rate limit
 */
export const checkRateLimit = (key, limit = 10, window = 60000) => {
  const now = Date.now();
  const storageKey = `rate_limit_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    const requests = stored ? JSON.parse(stored) : [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < window);
    
    if (validRequests.length >= limit) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    validRequests.push(now);
    localStorage.setItem(storageKey, JSON.stringify(validRequests));
    
    return true;
  } catch (error) {
    console.warn('Rate limiting error:', error);
    return true; // Allow on error
  }
};

/**
 * Generates a random nonce for CSP
 * @returns {string} - Random nonce
 */
export const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Environment validation
 * @returns {object} - Environment validation result
 */
export const validateEnvironment = () => {
  const requiredVars = ['REACT_APP_SUPABASE_URL', 'REACT_APP_SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missing.length === 0,
    missing,
    environment: process.env.REACT_APP_ENVIRONMENT || 'development'
  };
};

// Export validation patterns for use in components
export { VALIDATION_PATTERNS };
