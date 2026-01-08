import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  containsSensitiveInfo,
  sanitizeErrorForUser,
  handleError,
  createErrorResponse,
  USER_ERROR_MESSAGES,
} from './errorHandler';

/**
 * Property 11: Error Logging Without Exposure
 * 
 * *For any* error that occurs in the system, the full error details SHALL be logged 
 * to console, and the user-facing message SHALL be a generic, non-technical message 
 * that does not expose system internals.
 * 
 * **Validates: Requirements 7.10**
 * **Feature: assessment-module, Property 11: Error Logging Without Exposure**
 */
describe('Error Handler - Property-Based Tests', () => {
  describe('Property 11: Error Logging Without Exposure', () => {
    // Generator for sensitive error messages that should never be exposed
    const sensitiveErrorArb = fc.oneof(
      // MongoDB/Database errors
      fc.constant('MongoServerError: connection refused'),
      fc.constant('mongoose connection error: ECONNREFUSED'),
      fc.constant('Database query failed: SELECT * FROM users'),
      fc.constant('SQL syntax error near "DROP TABLE"'),
      
      // Authentication/Secret errors
      fc.constant('Invalid API_KEY: sk-1234567890'),
      fc.constant('Authentication token expired: eyJhbGciOiJIUzI1NiIs...'),
      fc.constant('Secret key mismatch: expected abc123'),
      fc.constant('Password hash verification failed'),
      
      // Stack traces
      fc.constant('Error: Something failed\n    at Function.Module._load (node:internal/modules/cjs/loader:925:12)'),
      fc.constant('TypeError: Cannot read property\n    at Object.<anonymous> (/app/src/services/assessmentService.ts:45:12)'),
      fc.constant('at processTicksAndRejections (node:internal/process/task_queues:95:5)'),
      
      // Internal paths
      fc.constant('Error in node_modules/mongoose/lib/connection.js'),
      fc.constant('Internal server error at /api/assessment/submit.ts:78'),
      fc.constant('Failed at assessmentService.js:123'),
      
      // Network errors with technical details
      fc.constant('ECONNREFUSED 127.0.0.1:27017'),
      fc.constant('ETIMEDOUT connecting to mongodb://localhost:27017'),
      fc.constant('ENOTFOUND api.groq.com'),
      
      // JSON error objects
      fc.constant('error: { code: "INTERNAL_ERROR", stack: "..." }'),
    );

    // Generator for safe user-facing messages
    const safeMessageArb = fc.constantFrom(
      USER_ERROR_MESSAGES.CONNECTION_ERROR,
      USER_ERROR_MESSAGES.INVALID_RESPONSE,
      USER_ERROR_MESSAGES.SERVER_ERROR,
      USER_ERROR_MESSAGES.NETWORK_TIMEOUT,
      USER_ERROR_MESSAGES.SUBMISSION_FAILED,
      USER_ERROR_MESSAGES.SESSION_EXPIRED,
      USER_ERROR_MESSAGES.OFFLINE,
    );

    // Generator for arbitrary error messages (mix of safe and unsafe)
    const arbitraryErrorMessageArb = fc.oneof(
      sensitiveErrorArb,
      safeMessageArb,
      fc.string({ minLength: 1, maxLength: 200 }),
    );

    it('containsSensitiveInfo detects all sensitive patterns', () => {
      fc.assert(
        fc.property(sensitiveErrorArb, (sensitiveMessage) => {
          const result = containsSensitiveInfo(sensitiveMessage);
          expect(result).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('safe user messages do not contain sensitive info', () => {
      fc.assert(
        fc.property(safeMessageArb, (safeMessage) => {
          const result = containsSensitiveInfo(safeMessage);
          expect(result).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('sanitizeErrorForUser never returns sensitive information', () => {
      fc.assert(
        fc.property(arbitraryErrorMessageArb, safeMessageArb, (errorMessage, fallback) => {
          const error = new Error(errorMessage);
          const result = sanitizeErrorForUser(error, fallback);
          
          // Result should never contain sensitive patterns
          expect(containsSensitiveInfo(result)).toBe(false);
          
          // Result should be a non-empty string
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('sanitizeErrorForUser returns fallback for non-Error inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.constant(null),
            fc.constant(undefined),
            fc.object(),
          ),
          safeMessageArb,
          (nonError, fallback) => {
            const result = sanitizeErrorForUser(nonError, fallback);
            expect(result).toBe(fallback);
          }
        ),
        { numRuns: 100 }
      );
    });

    describe('handleError logs full details and returns safe message', () => {
      let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterEach(() => {
        consoleErrorSpy.mockRestore();
      });

      it('logs full error details to console', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            sensitiveErrorArb,
            safeMessageArb,
            (context, errorMessage, userMessage) => {
              consoleErrorSpy.mockClear();
              
              const error = new Error(errorMessage);
              handleError(context, error, userMessage);
              
              // Console.error should have been called
              expect(consoleErrorSpy).toHaveBeenCalled();
              
              // The logged message should include the context
              const loggedArgs = consoleErrorSpy.mock.calls[0];
              expect(loggedArgs[0]).toContain(context);
              
              // The logged error should be the original error (with full details)
              expect(loggedArgs[1]).toBe(error);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('returns safe user message without sensitive info', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            sensitiveErrorArb,
            safeMessageArb,
            (context, errorMessage, userMessage) => {
              const error = new Error(errorMessage);
              const result = handleError(context, error, userMessage);
              
              // Result should not contain sensitive information
              expect(containsSensitiveInfo(result)).toBe(false);
              
              // Result should be the safe user message
              expect(result).toBe(userMessage);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('user message is always one of the predefined safe messages or fallback', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            arbitraryErrorMessageArb,
            (context, errorMessage) => {
              const error = new Error(errorMessage);
              const result = handleError(context, error);
              
              // Result should be a predefined safe message
              const safeMessages = Object.values(USER_ERROR_MESSAGES);
              expect(safeMessages).toContain(result);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    it('createErrorResponse returns object with safe error message', () => {
      fc.assert(
        fc.property(sensitiveErrorArb, safeMessageArb, (errorMessage, fallback) => {
          const error = new Error(errorMessage);
          const result = createErrorResponse(error, fallback);
          
          // Result should be an object with error property
          expect(typeof result).toBe('object');
          expect(result).toHaveProperty('error');
          
          // Error message should not contain sensitive info
          expect(containsSensitiveInfo(result.error)).toBe(false);
          
          // Error message should be the fallback
          expect(result.error).toBe(fallback);
        }),
        { numRuns: 100 }
      );
    });

    it('error response structure is consistent for any error type', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string().map(s => new Error(s)),
            fc.string(),
            fc.integer(),
            fc.constant(null),
            fc.constant(undefined),
          ),
          (error) => {
            const result = createErrorResponse(error);
            
            // Result should always have the same structure
            expect(typeof result).toBe('object');
            expect(Object.keys(result)).toEqual(['error']);
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
