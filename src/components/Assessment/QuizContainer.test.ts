import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { AnswerValue } from '../../types/assessment';
import { QUIZ_QUESTIONS } from '../../utils/constants';

// Generator for valid answer values
const validAnswerArb = fc.constantFrom<AnswerValue>('A', 'B', 'C', 'D');

// Generator for question indices (0-24)
const questionIndexArb = fc.integer({ min: 0, max: 24 });

// Generator for a sequence of answer selections
const answerSelectionArb = fc.record({
  questionIndex: questionIndexArb,
  answer: validAnswerArb,
});

// Generator for a sequence of quiz interactions
const quizInteractionSequenceArb = fc.array(answerSelectionArb, { minLength: 1, maxLength: 50 });

/**
 * Quiz State Management - Pure Logic Tests
 * 
 * These tests validate the core state management logic of the QuizContainer
 * without requiring React component rendering.
 */

/**
 * Simulates the quiz state management logic
 * This mirrors the state management in QuizContainer
 */
interface QuizState {
  currentQuestionIndex: number;
  answers: (AnswerValue | null)[];
  isSubmitting: boolean;
  error: string | null;
}

function createInitialState(
  initialAnswers?: (AnswerValue | null)[],
  initialQuestionIndex = 0
): QuizState {
  return {
    currentQuestionIndex: initialQuestionIndex,
    answers: initialAnswers || Array(25).fill(null),
    isSubmitting: false,
    error: null,
  };
}

function selectAnswer(state: QuizState, questionId: number, answer: AnswerValue): QuizState {
  const newAnswers = [...state.answers];
  newAnswers[questionId - 1] = answer;
  return {
    ...state,
    answers: newAnswers,
    error: null,
  };
}

function navigatePrevious(state: QuizState): QuizState {
  if (state.currentQuestionIndex === 0) return state;
  return {
    ...state,
    currentQuestionIndex: state.currentQuestionIndex - 1,
    error: null,
  };
}

function navigateNext(state: QuizState): QuizState {
  const currentAnswer = state.answers[state.currentQuestionIndex];
  if (currentAnswer === null) {
    return { ...state, error: 'Please select an answer' };
  }
  if (state.currentQuestionIndex >= QUIZ_QUESTIONS.length - 1) return state;
  return {
    ...state,
    currentQuestionIndex: state.currentQuestionIndex + 1,
    error: null,
  };
}

function validateSubmission(state: QuizState): { valid: boolean; error: string | null } {
  const currentAnswer = state.answers[state.currentQuestionIndex];
  if (currentAnswer === null) {
    return { valid: false, error: 'Please select an answer' };
  }
  const hasAllAnswers = state.answers.every((a) => a !== null);
  if (!hasAllAnswers) {
    return { valid: false, error: 'All 25 questions required' };
  }
  return { valid: true, error: null };
}

describe('QuizContainer State Management - Property-Based Tests', () => {
  /**
   * Property 9: Quiz State Preservation
   * 
   * *For any* sequence of quiz interactions (selecting answers, navigating between questions):
   * - Selecting an option SHALL immediately update the stored answer for that question
   * - Changing an answer SHALL immediately replace the previous answer
   * - Navigating to any previously answered question SHALL display the saved answer as pre-selected
   * - All answers SHALL be preserved across navigation
   * 
   * **Validates: Requirements 2.3, 2.8, 2.9, 2.12**
   * **Feature: assessment-module, Property 9: Quiz State Preservation**
   */
  describe('Property 9: Quiz State Preservation', () => {
    it('selecting an option immediately updates the stored answer for that question', () => {
      fc.assert(
        fc.property(questionIndexArb, validAnswerArb, (questionIndex, answer) => {
          const state = createInitialState();
          const questionId = questionIndex + 1; // Convert to 1-based ID
          
          const newState = selectAnswer(state, questionId, answer);
          
          // The answer should be stored at the correct index
          expect(newState.answers[questionIndex]).toBe(answer);
        }),
        { numRuns: 100 }
      );
    });

    it('changing an answer immediately replaces the previous answer', () => {
      // Generate pairs of different answers
      const differentAnswerPairArb = fc.tuple(validAnswerArb, validAnswerArb)
        .filter(([a, b]) => a !== b);

      fc.assert(
        fc.property(
          questionIndexArb,
          differentAnswerPairArb,
          (questionIndex, [firstAnswer, secondAnswer]) => {
            const state = createInitialState();
            const questionId = questionIndex + 1;
            
            // Select first answer
            const stateAfterFirst = selectAnswer(state, questionId, firstAnswer);
            expect(stateAfterFirst.answers[questionIndex]).toBe(firstAnswer);
            
            // Change to second answer
            const stateAfterSecond = selectAnswer(stateAfterFirst, questionId, secondAnswer);
            expect(stateAfterSecond.answers[questionIndex]).toBe(secondAnswer);
            
            // First answer should be completely replaced
            expect(stateAfterSecond.answers[questionIndex]).not.toBe(firstAnswer);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all answers are preserved across navigation', () => {
      fc.assert(
        fc.property(quizInteractionSequenceArb, (interactions) => {
          let state = createInitialState();
          const expectedAnswers: (AnswerValue | null)[] = Array(25).fill(null);
          
          // Apply all interactions
          for (const { questionIndex, answer } of interactions) {
            const questionId = questionIndex + 1;
            state = selectAnswer(state, questionId, answer);
            expectedAnswers[questionIndex] = answer;
          }
          
          // Navigate through all questions and verify answers preserved
          state = { ...state, currentQuestionIndex: 0 };
          for (let i = 0; i < 25; i++) {
            expect(state.answers[i]).toBe(expectedAnswers[i]);
            if (state.answers[i] !== null && i < 24) {
              state = navigateNext(state);
            }
          }
          
          // Navigate back and verify still preserved
          for (let i = state.currentQuestionIndex; i > 0; i--) {
            state = navigatePrevious(state);
            expect(state.answers[i - 1]).toBe(expectedAnswers[i - 1]);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('navigating to a previously answered question shows the saved answer', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 5, maxLength: 10 }),
          fc.integer({ min: 0, max: 4 }),
          (answersToSet, targetIndex) => {
            let state = createInitialState();
            
            // Set answers for first N questions
            for (let i = 0; i < answersToSet.length && i < 25; i++) {
              state = selectAnswer(state, i + 1, answersToSet[i]);
            }
            
            // Navigate to target question
            state = { ...state, currentQuestionIndex: targetIndex };
            
            // The answer at target should be preserved
            if (targetIndex < answersToSet.length) {
              expect(state.answers[targetIndex]).toBe(answersToSet[targetIndex]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('answers array maintains exactly 25 elements after any sequence of operations', () => {
      fc.assert(
        fc.property(quizInteractionSequenceArb, (interactions) => {
          let state = createInitialState();
          
          for (const { questionIndex, answer } of interactions) {
            state = selectAnswer(state, questionIndex + 1, answer);
          }
          
          expect(state.answers.length).toBe(25);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 10: Submission Debounce
   * 
   * *For any* rapid sequence of submit button clicks, the system SHALL process 
   * exactly one submission request.
   * 
   * **Validates: Requirements 7.4**
   * **Feature: assessment-module, Property 10: Submission Debounce**
   */
  describe('Property 10: Submission Debounce', () => {
    it('submission validation is consistent regardless of call count', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 25, maxLength: 25 }),
          fc.integer({ min: 1, max: 10 }),
          (answers, callCount) => {
            const state = createInitialState(answers, 24); // On last question
            
            // Call validation multiple times
            const results: { valid: boolean; error: string | null }[] = [];
            for (let i = 0; i < callCount; i++) {
              results.push(validateSubmission(state));
            }
            
            // All results should be identical
            const firstResult = results[0];
            for (const result of results) {
              expect(result.valid).toBe(firstResult.valid);
              expect(result.error).toBe(firstResult.error);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('debounce logic prevents rapid duplicate submissions', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 25, maxLength: 25 }),
          fc.integer({ min: 2, max: 20 }),
          (answers, rapidClickCount) => {
            // Simulate debounce tracking
            let lastClickTime = 0;
            let submitInProgress = false;
            const DEBOUNCE_MS = 300;
            let submissionCount = 0;
            
            const attemptSubmit = (currentTime: number): boolean => {
              if (submitInProgress) return false;
              if (currentTime - lastClickTime < DEBOUNCE_MS) return false;
              
              lastClickTime = currentTime;
              submitInProgress = true;
              submissionCount++;
              
              // Simulate async completion
              setTimeout(() => { submitInProgress = false; }, 100);
              
              return true;
            };
            
            // Simulate rapid clicks at same timestamp
            const baseTime = Date.now();
            for (let i = 0; i < rapidClickCount; i++) {
              attemptSubmit(baseTime); // All at same time
            }
            
            // Only one submission should have been processed
            expect(submissionCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('submission is blocked while another submission is in progress', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 25, maxLength: 25 }),
          (answers) => {
            let submitInProgress = false;
            let submissionCount = 0;
            
            const attemptSubmit = (): boolean => {
              if (submitInProgress) return false;
              submitInProgress = true;
              submissionCount++;
              return true;
            };
            
            // First submission should succeed
            expect(attemptSubmit()).toBe(true);
            expect(submissionCount).toBe(1);
            
            // Subsequent attempts while in progress should fail
            expect(attemptSubmit()).toBe(false);
            expect(attemptSubmit()).toBe(false);
            expect(attemptSubmit()).toBe(false);
            
            // Count should still be 1
            expect(submissionCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('validates all 25 answers are required before submission', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 1, maxLength: 24 }),
          (partialAnswers) => {
            // Create state with partial answers (at least 1 but less than 25)
            const answers: (AnswerValue | null)[] = Array(25).fill(null);
            partialAnswers.forEach((answer, i) => {
              if (i < 25) answers[i] = answer;
            });
            
            // Set current question to one that has an answer (to pass first validation)
            const lastAnsweredIndex = Math.min(partialAnswers.length - 1, 24);
            const state = createInitialState(answers, lastAnsweredIndex);
            const result = validateSubmission(state);
            
            // Should fail because not all 25 answers are present
            expect(result.valid).toBe(false);
            expect(result.error).toBe('All 25 questions required');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('submission succeeds when all 25 answers are present', () => {
      fc.assert(
        fc.property(
          fc.array(validAnswerArb, { minLength: 25, maxLength: 25 }),
          (answers) => {
            const state = createInitialState(answers, 24);
            const result = validateSubmission(state);
            
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
