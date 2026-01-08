import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateScores, determineArchetype } from './assessmentService';
import { ANSWER_POINTS } from '../utils/constants';
import { AnswerValue, PsychologicalScores, ArchetypeName, MotivationType } from '../types/assessment';

// Generator for valid answer values
const validAnswerArb = fc.constantFrom<AnswerValue>('A', 'B', 'C', 'D');

// Generator for exactly 25 valid answers
const valid25AnswersArb = fc.array(validAnswerArb, { minLength: 25, maxLength: 25 });

// Generator for invalid answer values (not A, B, C, or D)
const invalidAnswerArb = fc.string().filter(s => !['A', 'B', 'C', 'D'].includes(s));

describe('calculateScores - Property-Based Tests', () => {
  /**
   * Property 1: Answer Validation Correctness
   * 
   * *For any* input array passed to calculateScores, the function SHALL accept 
   * arrays of exactly 25 elements where each element is 'A', 'B', 'C', or 'D', 
   * and SHALL reject all other inputs with a descriptive error.
   * 
   * **Validates: Requirements 3.2, 3.3**
   * **Feature: assessment-module, Property 1: Answer Validation Correctness**
   */
  describe('Property 1: Answer Validation Correctness', () => {
    it('accepts valid 25-answer arrays with A/B/C/D values', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          // Should not throw for valid input
          const result = calculateScores(answers);
          expect(result).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });

    it('rejects arrays with fewer than 25 answers', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 0, maxLength: 24 }),
          (answers) => {
            expect(() => calculateScores(answers)).toThrow('Exactly 25 answers required');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects arrays with more than 25 answers', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 26, maxLength: 50 }),
          (answers) => {
            expect(() => calculateScores(answers)).toThrow('Exactly 25 answers required');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects arrays containing invalid answer values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 24 }),
          invalidAnswerArb,
          (invalidIndex, invalidValue) => {
            // Create a valid array and inject one invalid value
            const answers = Array(25).fill('A');
            answers[invalidIndex] = invalidValue;
            expect(() => calculateScores(answers)).toThrow(/Invalid answer at position/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Dimension Scoring Correctness
   * 
   * *For any* valid 25-answer array, calculateScores SHALL return scores where:
   * - imposterSyndrome equals the average of Q1-5 point values (A=0, B=33, C=67, D=100)
   * - founderDoubt equals the average of Q6-9 point values
   * - identityFusion equals the average of Q10-13 point values
   * - fearOfRejection equals the average of Q14-18 point values
   * - riskTolerance equals the average of Q19-21 point values
   * - motivationType equals 'intrinsic' if Q22 > avg(Q23,Q24), 'extrinsic' if avg(Q23,Q24) > Q22, else 'mixed'
   * - isolationLevel equals the Q25 point value
   * 
   * **Validates: Requirements 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**
   * **Feature: assessment-module, Property 2: Dimension Scoring Correctness**
   */
  describe('Property 2: Dimension Scoring Correctness', () => {
    // Helper to calculate expected average
    const expectedAverage = (answers: AnswerValue[], start: number, end: number): number => {
      const slice = answers.slice(start, end + 1);
      const sum = slice.reduce((acc, a) => acc + ANSWER_POINTS[a], 0);
      return Math.round(sum / slice.length);
    };

    it('calculates imposterSyndrome as average of Q1-5 (indices 0-4)', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          const expected = expectedAverage(answers, 0, 4);
          expect(result.imposterSyndrome).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });

    it('calculates founderDoubt as average of Q6-9 (indices 5-8)', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          const expected = expectedAverage(answers, 5, 8);
          expect(result.founderDoubt).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });

    it('calculates identityFusion as average of Q10-13 (indices 9-12)', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          const expected = expectedAverage(answers, 9, 12);
          expect(result.identityFusion).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });

    it('calculates fearOfRejection as average of Q14-18 (indices 13-17)', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          const expected = expectedAverage(answers, 13, 17);
          expect(result.fearOfRejection).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });

    it('calculates riskTolerance as average of Q19-21 (indices 18-20)', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          const expected = expectedAverage(answers, 18, 20);
          expect(result.riskTolerance).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });

    it('determines motivationType correctly based on Q22-24 comparison', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          const passion = ANSWER_POINTS[answers[21]];      // Q22
          const financial = ANSWER_POINTS[answers[22]];    // Q23
          const recognition = ANSWER_POINTS[answers[23]];  // Q24
          const extrinsicAvg = (financial + recognition) / 2;

          if (passion > extrinsicAvg) {
            expect(result.motivationType).toBe('intrinsic');
          } else if (extrinsicAvg > passion) {
            expect(result.motivationType).toBe('extrinsic');
          } else {
            expect(result.motivationType).toBe('mixed');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('calculates isolationLevel as Q25 point value (index 24)', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          const expected = ANSWER_POINTS[answers[24]];
          expect(result.isolationLevel).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Scoring Invariants
   * 
   * *For any* valid 25-answer array:
   * - All numeric scores SHALL be in range [0, 100] with no NaN or negative values
   * - Running calculateScores multiple times with identical input SHALL produce identical output (deterministic)
   * - The return value SHALL be a complete PsychologicalScores object with all 7 fields
   * 
   * **Validates: Requirements 3.11, 3.12, 3.14**
   * **Feature: assessment-module, Property 3: Scoring Invariants**
   */
  describe('Property 3: Scoring Invariants', () => {
    it('all numeric scores are in range [0, 100] with no NaN or negative values', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);
          
          const numericScores = [
            result.imposterSyndrome,
            result.founderDoubt,
            result.identityFusion,
            result.fearOfRejection,
            result.riskTolerance,
            result.isolationLevel,
          ];

          for (const score of numericScores) {
            expect(typeof score).toBe('number');
            expect(Number.isNaN(score)).toBe(false);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('produces identical output for identical input (deterministic)', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result1 = calculateScores([...answers]);
          const result2 = calculateScores([...answers]);
          const result3 = calculateScores([...answers]);

          expect(result1).toEqual(result2);
          expect(result2).toEqual(result3);
        }),
        { numRuns: 100 }
      );
    });

    it('returns a complete PsychologicalScores object with all 7 fields', () => {
      fc.assert(
        fc.property(valid25AnswersArb, (answers) => {
          const result = calculateScores(answers);

          // Check all required fields exist
          expect(result).toHaveProperty('imposterSyndrome');
          expect(result).toHaveProperty('founderDoubt');
          expect(result).toHaveProperty('identityFusion');
          expect(result).toHaveProperty('fearOfRejection');
          expect(result).toHaveProperty('riskTolerance');
          expect(result).toHaveProperty('motivationType');
          expect(result).toHaveProperty('isolationLevel');

          // Check motivationType is valid
          expect(['intrinsic', 'extrinsic', 'mixed']).toContain(result.motivationType);
        }),
        { numRuns: 100 }
      );
    });

    it('handles edge case: all A answers (minimum scores)', () => {
      const allAs = Array(25).fill('A');
      const result = calculateScores(allAs);

      expect(result.imposterSyndrome).toBe(0);
      expect(result.founderDoubt).toBe(0);
      expect(result.identityFusion).toBe(0);
      expect(result.fearOfRejection).toBe(0);
      expect(result.riskTolerance).toBe(0);
      expect(result.isolationLevel).toBe(0);
    });

    it('handles edge case: all D answers (maximum scores)', () => {
      const allDs = Array(25).fill('D');
      const result = calculateScores(allDs);

      expect(result.imposterSyndrome).toBe(100);
      expect(result.founderDoubt).toBe(100);
      expect(result.identityFusion).toBe(100);
      expect(result.fearOfRejection).toBe(100);
      expect(result.riskTolerance).toBe(100);
      expect(result.isolationLevel).toBe(100);
    });
  });
});


// Generator for valid PsychologicalScores
const validScoreArb = fc.integer({ min: 0, max: 100 });
const motivationTypeArb = fc.constantFrom<MotivationType>('intrinsic', 'extrinsic', 'mixed');

const validPsychologicalScoresArb = fc.record({
  imposterSyndrome: validScoreArb,
  founderDoubt: validScoreArb,
  identityFusion: validScoreArb,
  fearOfRejection: validScoreArb,
  riskTolerance: validScoreArb,
  motivationType: motivationTypeArb,
  isolationLevel: validScoreArb,
});

// Generator for scores that trigger Burning Out (3+ dimensions > 70)
const burningOutScoresArb = fc.record({
  imposterSyndrome: fc.integer({ min: 71, max: 100 }),
  founderDoubt: fc.integer({ min: 71, max: 100 }),
  identityFusion: fc.integer({ min: 71, max: 100 }),
  fearOfRejection: fc.integer({ min: 0, max: 100 }),
  riskTolerance: fc.integer({ min: 0, max: 100 }),
  motivationType: motivationTypeArb,
  isolationLevel: fc.integer({ min: 0, max: 100 }),
});

// All valid archetype names
const VALID_ARCHETYPES: ArchetypeName[] = [
  'Perfectionist Builder',
  'Opportunistic Visionary',
  'Isolated Dreamer',
  'Burning Out',
  'Self-Assured Hustler',
  'Community-Driven',
  'Balanced Founder',
  'Growth Seeker',
];

describe('determineArchetype - Property-Based Tests', () => {
  /**
   * Property 4: Archetype Classification Uniqueness
   * 
   * *For any* valid PsychologicalScores object, determineArchetype SHALL return 
   * exactly one archetype from the set: {'Perfectionist Builder', 'Opportunistic Visionary', 
   * 'Isolated Dreamer', 'Burning Out', 'Self-Assured Hustler', 'Community-Driven', 
   * 'Balanced Founder', 'Growth Seeker'}.
   * 
   * **Validates: Requirements 4.2, 4.3**
   * **Feature: assessment-module, Property 4: Archetype Classification Uniqueness**
   */
  describe('Property 4: Archetype Classification Uniqueness', () => {
    it('returns exactly one archetype from the valid set for any scores', () => {
      fc.assert(
        fc.property(validPsychologicalScoresArb, (scores) => {
          const result = determineArchetype(scores);
          
          // Should return exactly one archetype
          expect(result).toBeDefined();
          expect(result.name).toBeDefined();
          
          // The archetype name must be one of the 8 valid archetypes
          expect(VALID_ARCHETYPES).toContain(result.name);
        }),
        { numRuns: 100 }
      );
    });

    it('archetype name is an exact string match from the valid set', () => {
      fc.assert(
        fc.property(validPsychologicalScoresArb, (scores) => {
          const result = determineArchetype(scores);
          
          // Verify exact string match (not substring or similar)
          const exactMatch = VALID_ARCHETYPES.find(name => name === result.name);
          expect(exactMatch).toBe(result.name);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Archetype Result Completeness
   * 
   * *For any* archetype returned by determineArchetype, the result SHALL contain:
   * - name: non-empty string matching one of 8 archetypes
   * - description: non-empty string (1-2 sentences)
   * - traits: array of 2-3 non-empty strings
   * - strength: non-empty string
   * - challenge: non-empty string
   * - recommendation: non-empty string (1-2 sentences)
   * 
   * **Validates: Requirements 4.4, 4.5, 4.6, 4.7, 4.8**
   * **Feature: assessment-module, Property 5: Archetype Result Completeness**
   */
  describe('Property 5: Archetype Result Completeness', () => {
    it('result contains all required fields with valid values', () => {
      fc.assert(
        fc.property(validPsychologicalScoresArb, (scores) => {
          const result = determineArchetype(scores);
          
          // name: non-empty string matching one of 8 archetypes
          expect(typeof result.name).toBe('string');
          expect(result.name.length).toBeGreaterThan(0);
          expect(VALID_ARCHETYPES).toContain(result.name);
          
          // description: non-empty string
          expect(typeof result.description).toBe('string');
          expect(result.description.length).toBeGreaterThan(0);
          
          // traits: array of 2-3 non-empty strings
          expect(Array.isArray(result.traits)).toBe(true);
          expect(result.traits.length).toBeGreaterThanOrEqual(2);
          expect(result.traits.length).toBeLessThanOrEqual(3);
          result.traits.forEach(trait => {
            expect(typeof trait).toBe('string');
            expect(trait.length).toBeGreaterThan(0);
          });
          
          // strength: non-empty string
          expect(typeof result.strength).toBe('string');
          expect(result.strength.length).toBeGreaterThan(0);
          
          // challenge: non-empty string
          expect(typeof result.challenge).toBe('string');
          expect(result.challenge.length).toBeGreaterThan(0);
          
          // recommendation: non-empty string
          expect(typeof result.recommendation).toBe('string');
          expect(result.recommendation.length).toBeGreaterThan(0);
          
          // isUrgent: boolean
          expect(typeof result.isUrgent).toBe('boolean');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Burning Out Detection
   * 
   * *For any* PsychologicalScores where 3 or more of {imposterSyndrome, founderDoubt, 
   * identityFusion, fearOfRejection, isolationLevel} exceed 70, determineArchetype 
   * SHALL return 'Burning Out' with isUrgent flag set to true.
   * 
   * **Validates: Requirements 4.9**
   * **Feature: assessment-module, Property 6: Burning Out Detection**
   */
  describe('Property 6: Burning Out Detection', () => {
    it('returns Burning Out with isUrgent=true when 3+ dimensions exceed 70', () => {
      fc.assert(
        fc.property(burningOutScoresArb, (scores) => {
          const result = determineArchetype(scores);
          
          expect(result.name).toBe('Burning Out');
          expect(result.isUrgent).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('detects Burning Out for any combination of 3+ high dimensions', () => {
      // Test with different combinations of high dimensions
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 4 }), { minLength: 3, maxLength: 5 }),
          motivationTypeArb,
          (highIndices, motivationType) => {
            // Create base scores (all low)
            const scores: PsychologicalScores = {
              imposterSyndrome: 30,
              founderDoubt: 30,
              identityFusion: 30,
              fearOfRejection: 30,
              riskTolerance: 50,
              motivationType,
              isolationLevel: 30,
            };
            
            // Set 3+ dimensions to > 70
            const dimensions: (keyof PsychologicalScores)[] = [
              'imposterSyndrome',
              'founderDoubt',
              'identityFusion',
              'fearOfRejection',
              'isolationLevel',
            ];
            
            const uniqueIndices = [...new Set(highIndices)].slice(0, 5);
            if (uniqueIndices.length >= 3) {
              uniqueIndices.forEach(idx => {
                const dim = dimensions[idx % 5];
                (scores as unknown as Record<string, number | string>)[dim] = 75;
              });
              
              const result = determineArchetype(scores);
              expect(result.name).toBe('Burning Out');
              expect(result.isUrgent).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 7: Growth Seeker Encouragement
   * 
   * *For any* PsychologicalScores that results in 'Growth Seeker' archetype, 
   * the result SHALL include a non-empty encouragement message.
   * 
   * **Validates: Requirements 4.10**
   * **Feature: assessment-module, Property 7: Growth Seeker Encouragement**
   */
  describe('Property 7: Growth Seeker Encouragement', () => {
    it('Growth Seeker archetype includes non-empty encouragement message', () => {
      // Generate scores that will result in Growth Seeker
      // Growth Seeker is the default when no other archetype matches
      // We need scores that don't match any specific archetype
      const growthSeekerScoresArb = fc.record({
        imposterSyndrome: fc.integer({ min: 41, max: 59 }), // Not low enough for Self-Assured
        founderDoubt: fc.integer({ min: 41, max: 59 }),     // Not low enough for Self-Assured
        identityFusion: fc.integer({ min: 41, max: 59 }),
        fearOfRejection: fc.integer({ min: 41, max: 59 }),
        riskTolerance: fc.integer({ min: 41, max: 59 }),    // Not high enough for Opportunistic
        motivationType: motivationTypeArb,
        isolationLevel: fc.integer({ min: 61, max: 70 }),   // Not in balanced range, not > 70
      });

      fc.assert(
        fc.property(growthSeekerScoresArb, (scores) => {
          const result = determineArchetype(scores);
          
          // This should result in Growth Seeker
          if (result.name === 'Growth Seeker') {
            expect(result.encouragement).toBeDefined();
            expect(typeof result.encouragement).toBe('string');
            expect(result.encouragement!.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('only Growth Seeker has encouragement field populated', () => {
      fc.assert(
        fc.property(validPsychologicalScoresArb, (scores) => {
          const result = determineArchetype(scores);
          
          if (result.name === 'Growth Seeker') {
            // Growth Seeker must have encouragement
            expect(result.encouragement).toBeDefined();
            expect(result.encouragement!.length).toBeGreaterThan(0);
          } else {
            // Other archetypes should not have encouragement (or it's undefined)
            expect(result.encouragement).toBeUndefined();
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
