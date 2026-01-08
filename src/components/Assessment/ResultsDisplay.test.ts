import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getScoreColor } from '../../utils/scoreColorUtils';

/**
 * Property 8: Score Color Coding
 * 
 * *For any* numeric score in the results display:
 * - Scores 0-60 SHALL be displayed with default (green) styling
 * - Scores 61-75 SHALL be displayed with yellow highlighting and "Caution zone" tooltip
 * - Scores 76-100 SHALL be displayed with red highlighting and "High risk" tooltip
 * 
 * **Validates: Requirements 5.4, 5.6, 5.7**
 * **Feature: assessment-module, Property 8: Score Color Coding**
 */
describe('ResultsDisplay - Property-Based Tests', () => {
  describe('Property 8: Score Color Coding', () => {
    it('scores 0-60 return green styling with no tooltip', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 60 }),
          (score) => {
            const result = getScoreColor(score);
            
            expect(result.bg).toBe('bg-green-500');
            expect(result.text).toBe('text-green-700');
            expect(result.tooltip).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('scores 61-75 return yellow styling with "Caution zone" tooltip', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 61, max: 75 }),
          (score) => {
            const result = getScoreColor(score);
            
            expect(result.bg).toBe('bg-yellow-500');
            expect(result.text).toBe('text-yellow-700');
            expect(result.tooltip).toBe('Caution zone');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('scores 76-100 return red styling with "High risk" tooltip', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 76, max: 100 }),
          (score) => {
            const result = getScoreColor(score);
            
            expect(result.bg).toBe('bg-red-500');
            expect(result.text).toBe('text-red-700');
            expect(result.tooltip).toBe('High risk');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('boundary values are correctly classified', () => {
      // Test exact boundary values
      const score60 = getScoreColor(60);
      expect(score60.bg).toBe('bg-green-500');
      expect(score60.tooltip).toBeNull();

      const score61 = getScoreColor(61);
      expect(score61.bg).toBe('bg-yellow-500');
      expect(score61.tooltip).toBe('Caution zone');

      const score75 = getScoreColor(75);
      expect(score75.bg).toBe('bg-yellow-500');
      expect(score75.tooltip).toBe('Caution zone');

      const score76 = getScoreColor(76);
      expect(score76.bg).toBe('bg-red-500');
      expect(score76.tooltip).toBe('High risk');
    });

    it('all valid scores (0-100) return consistent color structure', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (score) => {
            const result = getScoreColor(score);
            
            // Result should always have bg, text, and tooltip properties
            expect(result).toHaveProperty('bg');
            expect(result).toHaveProperty('text');
            expect(result).toHaveProperty('tooltip');
            
            // bg and text should be non-empty strings
            expect(typeof result.bg).toBe('string');
            expect(result.bg.length).toBeGreaterThan(0);
            expect(typeof result.text).toBe('string');
            expect(result.text.length).toBeGreaterThan(0);
            
            // tooltip should be string or null
            expect(result.tooltip === null || typeof result.tooltip === 'string').toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('color coding is deterministic for same input', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (score) => {
            const result1 = getScoreColor(score);
            const result2 = getScoreColor(score);
            const result3 = getScoreColor(score);
            
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
