import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { constructInsightPrompt, getInsights } from './groqService';
import { PsychologicalScores, ArchetypeName, MotivationType } from '../types/assessment';

// Generator for valid score values (0-100)
const validScoreArb = fc.integer({ min: 0, max: 100 });

// Generator for motivation types
const motivationTypeArb = fc.constantFrom<MotivationType>('intrinsic', 'extrinsic', 'mixed');

// Generator for valid PsychologicalScores
const validPsychologicalScoresArb = fc.record({
  imposterSyndrome: validScoreArb,
  founderDoubt: validScoreArb,
  identityFusion: validScoreArb,
  fearOfRejection: validScoreArb,
  riskTolerance: validScoreArb,
  motivationType: motivationTypeArb,
  isolationLevel: validScoreArb,
});

// Generator for valid archetype names
const validArchetypeArb = fc.constantFrom<ArchetypeName>(
  'Perfectionist Builder',
  'Opportunistic Visionary',
  'Isolated Dreamer',
  'Burning Out',
  'Self-Assured Hustler',
  'Community-Driven',
  'Balanced Founder',
  'Growth Seeker'
);

describe('Groq Service - Property-Based Tests', () => {
  /**
   * Property 12: Groq Request Validation
   * 
   * *For any* request to /api/groq/insights, the API SHALL validate that the scores 
   * object contains all 7 required fields (imposterSyndrome, founderDoubt, identityFusion, 
   * fearOfRejection, riskTolerance, motivationType, isolationLevel) and the constructed 
   * prompt SHALL include all dimension values and the archetype name.
   * 
   * **Validates: Requirements 6.2, 6.3**
   * **Feature: assessment-module, Property 12: Groq Request Validation**
   */
  describe('Property 12: Groq Request Validation', () => {
    it('constructInsightPrompt includes all 7 dimension values in the prompt', () => {
      fc.assert(
        fc.property(validPsychologicalScoresArb, validArchetypeArb, (scores, archetype) => {
          const prompt = constructInsightPrompt(scores, archetype);
          
          // Verify all 7 dimensions are included in the prompt
          expect(prompt).toContain(`Imposter Syndrome: ${scores.imposterSyndrome}`);
          expect(prompt).toContain(`Founder Doubt: ${scores.founderDoubt}`);
          expect(prompt).toContain(`Identity Fusion: ${scores.identityFusion}`);
          expect(prompt).toContain(`Fear of Rejection: ${scores.fearOfRejection}`);
          expect(prompt).toContain(`Risk Tolerance: ${scores.riskTolerance}`);
          expect(prompt).toContain(`Motivation Type: ${scores.motivationType}`);
          expect(prompt).toContain(`Isolation Level: ${scores.isolationLevel}`);
        }),
        { numRuns: 100 }
      );
    });

    it('constructInsightPrompt includes the archetype name in the prompt', () => {
      fc.assert(
        fc.property(validPsychologicalScoresArb, validArchetypeArb, (scores, archetype) => {
          const prompt = constructInsightPrompt(scores, archetype);
          
          // Verify archetype is included
          expect(prompt).toContain(`Their archetype is: ${archetype}`);
        }),
        { numRuns: 100 }
      );
    });

    it('constructInsightPrompt returns a non-empty string for any valid input', () => {
      fc.assert(
        fc.property(validPsychologicalScoresArb, validArchetypeArb, (scores, archetype) => {
          const prompt = constructInsightPrompt(scores, archetype);
          
          expect(typeof prompt).toBe('string');
          expect(prompt.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: Groq Error Resilience
   * 
   * *For any* Groq API error (timeout, network failure, invalid response), the system SHALL:
   * - Log the error to console
   * - Return fallback text to the frontend
   * - NOT throw an exception that would break the results display
   * 
   * **Validates: Requirements 6.9**
   * **Feature: assessment-module, Property 13: Groq Error Resilience**
   */
  describe('Property 13: Groq Error Resilience', () => {
    const originalFetch = global.fetch;
    const consoleErrorSpy = vi.spyOn(console, 'error');

    beforeEach(() => {
      consoleErrorSpy.mockClear();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      consoleErrorSpy.mockClear();
    });

    it('returns fallback text on network error (never throws)', async () => {
      await fc.assert(
        fc.asyncProperty(validPsychologicalScoresArb, validArchetypeArb, async (scores, archetype) => {
          // Mock fetch to simulate network error
          global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
          
          // Should not throw, should return fallback
          const result = await getInsights(scores, archetype);
          
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
          // Verify it's the fallback text
          expect(result).toContain('generating');
        }),
        { numRuns: 10 } // Reduced runs for async tests
      );
    });

    it('returns fallback text on API error status (never throws)', async () => {
      await fc.assert(
        fc.asyncProperty(
          validPsychologicalScoresArb, 
          validArchetypeArb,
          fc.integer({ min: 400, max: 599 }), // Error status codes
          async (scores, archetype, statusCode) => {
            // Mock fetch to return error status
            global.fetch = vi.fn().mockResolvedValue({
              ok: false,
              status: statusCode,
            });
            
            // Should not throw, should return fallback
            const result = await getInsights(scores, archetype);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('returns fallback text on timeout (never throws)', async () => {
      await fc.assert(
        fc.asyncProperty(validPsychologicalScoresArb, validArchetypeArb, async (scores, archetype) => {
          // Mock fetch to simulate timeout via AbortError
          global.fetch = vi.fn().mockImplementation(() => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            return Promise.reject(error);
          });
          
          // Should not throw, should return fallback
          const result = await getInsights(scores, archetype);
          
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        }),
        { numRuns: 10 }
      );
    });

    it('returns fallback text when response has insufficient content', async () => {
      await fc.assert(
        fc.asyncProperty(
          validPsychologicalScoresArb, 
          validArchetypeArb,
          fc.string({ maxLength: 49 }), // Content less than 50 chars
          async (scores, archetype, shortContent) => {
            // Mock fetch to return short content
            global.fetch = vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                choices: [{ message: { content: shortContent } }]
              }),
            });
            
            // Should return fallback for insufficient content
            const result = await getInsights(scores, archetype);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('logs errors to console on failure', async () => {
      await fc.assert(
        fc.asyncProperty(validPsychologicalScoresArb, validArchetypeArb, async (scores, archetype) => {
          consoleErrorSpy.mockClear();
          
          // Mock fetch to simulate error
          global.fetch = vi.fn().mockRejectedValue(new Error('Test error'));
          
          await getInsights(scores, archetype);
          
          // Verify error was logged
          expect(consoleErrorSpy).toHaveBeenCalled();
        }),
        { numRuns: 10 }
      );
    });
  });
});
