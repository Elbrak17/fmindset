/**
 * Error handling utilities for the Assessment Module
 * 
 * These utilities ensure that:
 * - Full error details are logged to console for debugging
 * - User-facing messages are generic and don't expose system internals
 * 
 * Requirements: 7.10
 */

// User-facing error messages (generic, non-technical)
export const USER_ERROR_MESSAGES = {
  CONNECTION_ERROR: 'Connection error. Refresh.',
  INVALID_RESPONSE: 'Invalid response. Try again.',
  SERVER_ERROR: 'Server error. Try again later.',
  NETWORK_TIMEOUT: 'Network timeout. Check connection.',
  SUBMISSION_FAILED: 'Submission failed. Try again.',
  SESSION_EXPIRED: 'Session expired. Your progress is saved.',
  OFFLINE: "You're offline. Progress saved locally.",
} as const;

// Patterns that should never appear in user-facing messages
const SENSITIVE_PATTERNS = [
  /mongo/i,
  /mongoose/i,
  /database/i,
  /sql/i,
  /query/i,
  /connection string/i,
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /auth/i,
  /stack/i,
  /trace/i,
  /at\s+\w+\s+\(/i,  // Stack trace pattern
  /node_modules/i,
  /internal/i,
  /\.ts:\d+/i,       // TypeScript file references
  /\.js:\d+/i,       // JavaScript file references
  /error:\s*\{/i,    // JSON error objects
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /ENOTFOUND/i,
];

/**
 * Checks if a message contains sensitive information that should not be exposed to users
 * @param message - The message to check
 * @returns true if the message contains sensitive patterns
 */
export function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Sanitizes an error message for user display
 * Returns a generic message if the original contains sensitive information
 * 
 * @param error - The error to sanitize
 * @param fallbackMessage - The generic message to use if error contains sensitive info
 * @returns A safe, user-friendly error message
 */
export function sanitizeErrorForUser(
  error: unknown,
  fallbackMessage: string = USER_ERROR_MESSAGES.SERVER_ERROR
): string {
  // If error is not an Error object, return fallback
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const errorMessage = error.message;

  // Check if the error message contains sensitive information
  if (containsSensitiveInfo(errorMessage)) {
    return fallbackMessage;
  }

  // Check if the message is one of our predefined safe messages
  const safeMessages = Object.values(USER_ERROR_MESSAGES);
  if (safeMessages.includes(errorMessage as typeof safeMessages[number])) {
    return errorMessage;
  }

  // For any other message, return the fallback to be safe
  return fallbackMessage;
}

/**
 * Logs an error to console with full details while returning a safe user message
 * This is the main error handling function that ensures:
 * - Full error details are logged for debugging
 * - User receives a generic, non-technical message
 * 
 * @param context - A description of where the error occurred
 * @param error - The error that occurred
 * @param userMessage - The generic message to show to the user
 * @returns The safe user-facing message
 * 
 * Requirements: 7.10
 */
export function handleError(
  context: string,
  error: unknown,
  userMessage: string = USER_ERROR_MESSAGES.SERVER_ERROR
): string {
  // Log full error details to console
  console.error(`[${context}]`, error);

  // Return sanitized message for user
  return sanitizeErrorForUser(error, userMessage);
}

/**
 * Creates a standardized error response object for API routes
 * Ensures the error message is safe for client consumption
 * 
 * @param error - The error that occurred
 * @param fallbackMessage - The generic message to use
 * @returns An object with a safe error message
 */
export function createErrorResponse(
  error: unknown,
  fallbackMessage: string = USER_ERROR_MESSAGES.SERVER_ERROR
): { error: string } {
  return {
    error: sanitizeErrorForUser(error, fallbackMessage),
  };
}
