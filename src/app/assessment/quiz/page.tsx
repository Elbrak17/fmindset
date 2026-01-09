'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuizContainer } from '@/components/Assessment/QuizContainer';
import { AnswerValue, AssessmentSubmitResponse } from '@/types/assessment';

// Session storage keys for preserving progress
const STORAGE_KEYS = {
  ANSWERS: 'fmindset_quiz_answers',
  QUESTION_INDEX: 'fmindset_quiz_index',
  USER_ID: 'fmindset_anonymous_user_id',
  RESULTS: 'fmindset_assessment_results',
};

// Local storage keys for offline/session expiry backup (Requirements: 1.11, 7.8)
const LOCAL_STORAGE_KEYS = {
  BACKUP_ANSWERS: 'fmindset_backup_answers',
  BACKUP_INDEX: 'fmindset_backup_index',
  BACKUP_USER_ID: 'fmindset_backup_user_id',
};

interface QuizPageState {
  isLoading: boolean;
  hasSession: boolean;
  userId: string | null;
  initialAnswers: (AnswerValue | null)[];
  initialQuestionIndex: number;
  error: string | null;
  isOffline: boolean;
  hasRestoredFromBackup: boolean;
}

/**
 * Quiz Page Component
 * 
 * Handles the assessment quiz flow:
 * - Checks for existing session on load
 * - Shows landing page with "Start Anonymous Assessment" button if no session
 * - Creates anonymous user on button click
 * - Displays QuizContainer for the 25-question assessment
 * - Handles submission and navigates to results page
 * - Preserves progress in session storage
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.10, 5.1
 */
export default function QuizPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizPageState>({
    isLoading: true,
    hasSession: false,
    userId: null,
    initialAnswers: Array(25).fill(null),
    initialQuestionIndex: 0,
    error: null,
    isOffline: false,
    hasRestoredFromBackup: false,
  });

  /**
   * Save progress to localStorage as backup for session expiry/offline scenarios
   * Requirements: 1.11, 7.8
   */
  const saveToLocalStorage = useCallback((
    answers: (AnswerValue | null)[],
    questionIndex: number,
    userId: string | null
  ) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_ANSWERS, JSON.stringify(answers));
      localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_INDEX, questionIndex.toString());
      if (userId) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_USER_ID, userId);
      }
    } catch (error) {
      console.error('Failed to save backup to localStorage:', error);
    }
  }, []);

  /**
   * Restore progress from localStorage backup
   * Requirements: 1.11, 7.8
   */
  const restoreFromLocalStorage = useCallback((): {
    answers: (AnswerValue | null)[];
    questionIndex: number;
    userId: string | null;
  } | null => {
    try {
      const backupAnswers = localStorage.getItem(LOCAL_STORAGE_KEYS.BACKUP_ANSWERS);
      const backupIndex = localStorage.getItem(LOCAL_STORAGE_KEYS.BACKUP_INDEX);
      const backupUserId = localStorage.getItem(LOCAL_STORAGE_KEYS.BACKUP_USER_ID);

      if (backupAnswers) {
        const answers = JSON.parse(backupAnswers);
        const questionIndex = backupIndex ? parseInt(backupIndex, 10) : 0;
        return { answers, questionIndex, userId: backupUserId };
      }
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
    }
    return null;
  }, []);

  /**
   * Clear localStorage backup after successful submission
   */
  const clearLocalStorageBackup = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BACKUP_ANSWERS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BACKUP_INDEX);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BACKUP_USER_ID);
    } catch (error) {
      console.error('Failed to clear localStorage backup:', error);
    }
  }, []);

  /**
   * Handle online/offline status changes
   * Requirements: 7.8
   */
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
      // Save current progress to localStorage when going offline
      if (state.userId) {
        saveToLocalStorage(state.initialAnswers, state.initialQuestionIndex, state.userId);
      }
    };

    // Check initial online status
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setState(prev => ({ ...prev, isOffline: true }));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.userId, state.initialAnswers, state.initialQuestionIndex, saveToLocalStorage]);

  /**
   * Check for existing session and restore progress on mount
   * Requirements: 1.1, 1.5, 1.6, 1.10, 1.11
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for existing anonymous user ID in session storage
        const storedUserId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
        
        if (storedUserId) {
          // Restore previous progress from session storage
          const storedAnswers = sessionStorage.getItem(STORAGE_KEYS.ANSWERS);
          const storedIndex = sessionStorage.getItem(STORAGE_KEYS.QUESTION_INDEX);
          
          const answers = storedAnswers 
            ? JSON.parse(storedAnswers) 
            : Array(25).fill(null);
          const questionIndex = storedIndex 
            ? parseInt(storedIndex, 10) 
            : 0;

          setState({
            isLoading: false,
            hasSession: true,
            userId: storedUserId,
            initialAnswers: answers,
            initialQuestionIndex: questionIndex,
            error: null,
            isOffline: typeof window !== 'undefined' && !navigator.onLine,
            hasRestoredFromBackup: false,
          });
        } else {
          // No session - check localStorage for backup (session expiry scenario)
          // Requirements: 1.11
          const backup = restoreFromLocalStorage();
          
          if (backup && backup.answers.some(a => a !== null)) {
            // Found backup with progress - restore it
            const newUserId = backup.userId || 'anonymous-' + crypto.randomUUID();
            
            // Save to session storage
            sessionStorage.setItem(STORAGE_KEYS.USER_ID, newUserId);
            sessionStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(backup.answers));
            sessionStorage.setItem(STORAGE_KEYS.QUESTION_INDEX, backup.questionIndex.toString());

            setState({
              isLoading: false,
              hasSession: true,
              userId: newUserId,
              initialAnswers: backup.answers,
              initialQuestionIndex: backup.questionIndex,
              error: null,
              isOffline: typeof window !== 'undefined' && !navigator.onLine,
              hasRestoredFromBackup: true,
            });
          } else {
            // No session and no backup - show landing page
            setState(prev => ({
              ...prev,
              isLoading: false,
              hasSession: false,
              isOffline: typeof window !== 'undefined' && !navigator.onLine,
            }));
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load session. Please refresh.',
          isOffline: typeof window !== 'undefined' && !navigator.onLine,
        }));
      }
    };

    checkSession();
  }, [restoreFromLocalStorage]);


  /**
   * Create anonymous user and start assessment
   * Requirements: 1.2, 1.3, 1.4
   */
  const handleStartAssessment = useCallback(() => {
    try {
      // Generate anonymous user ID
      const anonymousUserId = 'anonymous-' + crypto.randomUUID();
      
      // Store in session storage
      sessionStorage.setItem(STORAGE_KEYS.USER_ID, anonymousUserId);
      sessionStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(Array(25).fill(null)));
      sessionStorage.setItem(STORAGE_KEYS.QUESTION_INDEX, '0');

      // Also save to localStorage as backup
      saveToLocalStorage(Array(25).fill(null), 0, anonymousUserId);

      setState({
        isLoading: false,
        hasSession: true,
        userId: anonymousUserId,
        initialAnswers: Array(25).fill(null),
        initialQuestionIndex: 0,
        error: null,
        isOffline: typeof window !== 'undefined' && !navigator.onLine,
        hasRestoredFromBackup: false,
      });
    } catch (error) {
      console.error('Failed to create anonymous user:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start assessment. Please try again.',
      }));
    }
  }, [saveToLocalStorage]);

  /**
   * Save progress to session storage and localStorage backup
   * Note: This is called when QuizContainer updates state
   * The QuizContainer handles its own state, but we sync to storage
   * for persistence across page refreshes and session expiry
   * Requirements: 1.10, 1.11, 7.8
   */
  useEffect(() => {
    // Set up a beforeunload handler to save progress
    const handleBeforeUnload = () => {
      // Save to localStorage as final backup before page unload
      try {
        const currentAnswers = sessionStorage.getItem(STORAGE_KEYS.ANSWERS);
        const currentIndex = sessionStorage.getItem(STORAGE_KEYS.QUESTION_INDEX);
        const currentUserId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
        
        if (currentAnswers && currentUserId) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_ANSWERS, currentAnswers);
          localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_INDEX, currentIndex || '0');
          localStorage.setItem(LOCAL_STORAGE_KEYS.BACKUP_USER_ID, currentUserId);
        }
      } catch (error) {
        console.error('Failed to save backup on unload:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /**
   * Handle quiz submission
   * Requirements: 5.1, 7.1, 7.2, 7.5, 7.6, 7.7, 7.8
   */
  const handleSubmit = useCallback(async (answers: AnswerValue[]) => {
    // Check if offline before attempting submission
    // Requirements: 7.8
    if (!navigator.onLine) {
      // Save to localStorage for later sync
      saveToLocalStorage(answers, 24, state.userId);
      throw new Error('You\'re offline. Progress saved locally. Please try again when online.');
    }

    // Create AbortController for timeout handling
    // Requirements: 7.7
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        // Requirements: 7.2, 7.5, 7.6
        if (response.status === 400) {
          // Validation error - preserve answers
          saveToLocalStorage(answers, 24, state.userId);
          throw new Error(errorData.error || 'Invalid response. Try again.');
        }
        if (response.status === 500) {
          // Server error - preserve answers for retry
          saveToLocalStorage(answers, 24, state.userId);
          throw new Error('Server error. Try again later.');
        }
        throw new Error(errorData.error || 'Submission failed');
      }

      const results: AssessmentSubmitResponse = await response.json();

      // Store results in session storage for results page
      sessionStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));

      // Clear quiz progress (keep user ID for potential retake)
      sessionStorage.removeItem(STORAGE_KEYS.ANSWERS);
      sessionStorage.removeItem(STORAGE_KEYS.QUESTION_INDEX);

      // Clear localStorage backup after successful submission
      clearLocalStorageBackup();

      // Navigate to results page
      router.push('/assessment/results');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Submission error:', error);
      
      // Handle timeout/abort error
      // Requirements: 7.7
      if (error instanceof Error && error.name === 'AbortError') {
        saveToLocalStorage(answers, 24, state.userId);
        throw new Error('Network timeout. Check connection.');
      }
      
      const message = error instanceof Error ? error.message : 'Submission failed. Try again.';
      throw new Error(message);
    }
  }, [router, state.userId, saveToLocalStorage, clearLocalStorageBackup]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin-slow rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="text-center max-w-lg animate-scale-in">
          <div className="card p-10">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-lg px-8 py-4"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Landing page - no session
  if (!state.hasSession) {
    return (
      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="pt-12 pb-8 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-4 animate-fade-in">
              FMindset Assessment
            </h1>
            <p className="text-gray-600 text-xl md:text-2xl animate-slide-in-left">
              Discover your founder psychology profile
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Hero card */}
            <div className="card p-10 md:p-12 mb-12 animate-scale-in">
              <div className="text-center mb-12">
                <div className="text-8xl mb-8 animate-bounce-gentle">🧠</div>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
                  Understand Your Founder Mind
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Take our 25-question assessment to discover your psychological profile 
                  as a founder. Learn about your strengths, challenges, and get 
                  personalized recommendations.
                </p>
              </div>

              {/* Features list */}
              <div className="grid gap-6 mb-12">
                <div className="flex items-start gap-4 animate-slide-in-left">
                  <span className="text-green-500 text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">7 Psychological Dimensions</p>
                    <p className="text-gray-600">
                      Measure imposter syndrome, founder doubt, identity fusion, and more
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
                  <span className="text-green-500 text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">8 Founder Archetypes</p>
                    <p className="text-gray-600">
                      Discover which founder personality type matches your profile
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                  <span className="text-green-500 text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">AI-Powered Insights</p>
                    <p className="text-gray-600">
                      Get personalized recommendations from our AI psychologist
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 animate-slide-in-left" style={{animationDelay: '0.3s'}}>
                  <span className="text-green-500 text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">100% Anonymous</p>
                    <p className="text-gray-600">
                      No email required - your privacy is protected
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleStartAssessment}
                className="btn-primary w-full text-xl py-5 animate-pulse-glow"
              >
                Start Anonymous Assessment
              </button>

              <p className="text-center text-gray-500 mt-6 text-lg">
                Takes about 5-7 minutes to complete
              </p>
            </div>

            {/* Trust indicators */}
            <div className="text-center text-gray-500 animate-fade-in">
              <p className="flex items-center justify-center text-lg">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Your responses are confidential and secure
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="relative">
      {/* Offline banner - Requirements: 7.8 */}
      {state.isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 text-center py-2 px-4 z-50">
          <span className="font-medium">📡 You&apos;re offline.</span> Progress saved locally. Sync when online.
        </div>
      )}
      
      {/* Restored from backup notification - Requirements: 1.11 */}
      {state.hasRestoredFromBackup && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 px-4 z-50">
          <span className="font-medium">✓ Session expired.</span> Your progress is saved. Continue where you left off.
        </div>
      )}
      
      <div className={state.isOffline || state.hasRestoredFromBackup ? 'pt-10' : ''}>
        <QuizContainer
          onSubmit={handleSubmit}
          initialAnswers={state.initialAnswers}
          initialQuestionIndex={state.initialQuestionIndex}
        />
      </div>
    </div>
  );
}
