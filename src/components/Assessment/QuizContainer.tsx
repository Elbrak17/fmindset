'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnswerValue } from '@/types/assessment';
import { QUIZ_QUESTIONS } from '@/utils/constants';
import { QuizQuestion, QuizOption } from './QuizQuestion';

// Session storage keys for preserving progress
const STORAGE_KEYS = {
  ANSWERS: 'fmindset_quiz_answers',
  QUESTION_INDEX: 'fmindset_quiz_index',
};

// Local storage keys for offline/session expiry backup (Requirements: 1.11, 7.8)
const LOCAL_STORAGE_KEYS = {
  BACKUP_ANSWERS: 'fmindset_backup_answers',
  BACKUP_INDEX: 'fmindset_backup_index',
};

export interface QuizContainerProps {
  onSubmit: (answers: AnswerValue[]) => Promise<void>;
  initialAnswers?: (AnswerValue | null)[];
  initialQuestionIndex?: number;
}

export interface QuizContainerState {
  currentQuestionIndex: number;
  answers: (AnswerValue | null)[];
  isSubmitting: boolean;
  error: string | null;
}

/**
 * QuizContainer Component
 * Manages the 25-question quiz flow with navigation, state preservation,
 * validation, and submission handling.
 * 
 * Requirements: 1.4, 1.7, 1.8, 1.9, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12
 */
export function QuizContainer({
  onSubmit,
  initialAnswers,
  initialQuestionIndex = 0,
}: QuizContainerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
  const [answers, setAnswers] = useState<(AnswerValue | null)[]>(
    initialAnswers || Array(25).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Debounce refs
  const lastClickTime = useRef<number>(0);
  const submitInProgress = useRef<boolean>(false);
  const DEBOUNCE_MS = 300;

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;
  const currentAnswer = answers[currentQuestionIndex];

  // Convert question options to QuizOption array
  const questionOptions: QuizOption[] = [
    { value: 'A', label: currentQuestion.options.A },
    { value: 'B', label: currentQuestion.options.B },
    { value: 'C', label: currentQuestion.options.C },
    { value: 'D', label: currentQuestion.options.D },
  ];

  // Count answered questions for progress
  const answeredCount = answers.filter((a) => a !== null).length;

  /**
   * Save progress to session storage and localStorage backup whenever answers or question index changes
   * Requirements: 1.10, 1.11, 7.8 - Preserve quiz progress in session state and localStorage backup
   */
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const answersJson = JSON.stringify(answers);
        const indexStr = currentQuestionIndex.toString();
        
        // Save to session storage
        sessionStorage.setItem(STORAGE_KEYS.ANSWERS, answersJson);
        sessionStorage.setItem(STORAGE_KEYS.QUESTION_INDEX, indexStr);
        
        // Also save to localStorage as backup for session expiry/offline scenarios
        localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_ANSWERS, answersJson);
        localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_INDEX, indexStr);
      }
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
    }
  }, [answers, currentQuestionIndex]);

  /**
   * Handle answer selection - immediately updates state
   * Requirements: 2.3, 2.8, 2.11
   */
  const handleSelect = useCallback((questionId: number, answer: AnswerValue) => {
    const now = Date.now();
    if (now - lastClickTime.current < DEBOUNCE_MS) {
      return; // Debounce rapid clicks
    }
    lastClickTime.current = now;

    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionId - 1] = answer;
      return newAnswers;
    });
    setError(null);
  }, []);

  /**
   * Navigate to previous question
   * Requirements: 2.5, 2.9, 2.12
   */
  const handlePrevious = useCallback(() => {
    if (isFirstQuestion) return;
    setCurrentQuestionIndex((prev) => prev - 1);
    setError(null);
  }, [isFirstQuestion]);

  /**
   * Navigate to next question with validation
   * Requirements: 2.6, 2.9
   */
  const handleNext = useCallback(() => {
    if (currentAnswer === null) {
      setError('Please select an answer');
      return;
    }
    if (isLastQuestion) return;
    setCurrentQuestionIndex((prev) => prev + 1);
    setError(null);
  }, [currentAnswer, isLastQuestion]);

  /**
   * Handle quiz submission with validation and debounce
   * Requirements: 2.7, 2.10, 7.4
   */
  const handleSubmit = useCallback(async () => {
    // Debounce double-submit
    if (submitInProgress.current || isSubmitting) {
      return;
    }

    // Validate current answer
    if (currentAnswer === null) {
      setError('Please select an answer');
      return;
    }

    // Validate all 25 answers present
    const hasAllAnswers = answers.every((a) => a !== null);
    if (!hasAllAnswers) {
      setError('All 25 questions required');
      return;
    }

    submitInProgress.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(answers as AnswerValue[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed. Try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
      submitInProgress.current = false;
    }
  }, [answers, currentAnswer, isSubmitting, onSubmit]);

  /**
   * Handle exit quiz - show confirmation modal
   */
  const handleExitClick = useCallback(() => {
    setShowExitModal(true);
  }, []);

  /**
   * Confirm exit - clear progress and go home
   */
  const handleConfirmExit = useCallback(() => {
    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEYS.ANSWERS);
    sessionStorage.removeItem(STORAGE_KEYS.QUESTION_INDEX);
    // Clear localStorage backup
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BACKUP_ANSWERS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BACKUP_INDEX);
    // Navigate home
    router.push('/');
  }, [router]);

  /**
   * Cancel exit - close modal
   */
  const handleCancelExit = useCallback(() => {
    setShowExitModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="text-5xl mb-4">🚪</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Leave Assessment?
              </h3>
              <p className="text-gray-600 mb-6">
                Your progress will be saved. You can continue later from where you left off.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelExit}
                  className="flex-1 px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="flex-1 px-4 py-3 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Button - Fixed top right */}
      <button
        onClick={handleExitClick}
        className="fixed top-20 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
        aria-label="Exit quiz"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="text-sm font-medium">Exit</span>
      </button>

      {/* Quiz Question */}
      <QuizQuestion
        questionId={currentQuestion.id}
        questionText={currentQuestion.text}
        dimensionLabel={currentQuestion.dimension}
        options={questionOptions}
        selectedOption={currentAnswer}
        onSelect={handleSelect}
        progress={{ current: currentQuestionIndex + 1, total: QUIZ_QUESTIONS.length }}
      />

      {/* Error message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <p className="text-red-600 text-sm text-center" role="alert">
            {error}
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstQuestion || isSubmitting}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${isFirstQuestion
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
            aria-label="Previous question"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                px-8 py-3 rounded-lg font-medium transition-all duration-200
                ${isSubmitting
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
              aria-label="Submit quiz"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
              aria-label="Next question"
            >
              Next
            </button>
          )}
        </div>

        {/* Progress summary */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {answeredCount} of {QUIZ_QUESTIONS.length} questions answered
        </p>
      </div>
    </div>
  );
}

export default QuizContainer;
