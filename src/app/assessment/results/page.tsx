'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsDisplay } from '@/components/Assessment/ResultsDisplay';
import { 
  PsychologicalScores, 
  ArchetypeResult, 
  AssessmentSubmitResponse,
  GroqInsightsResponse 
} from '@/types/assessment';

// Session storage keys (matching quiz page)
const STORAGE_KEYS = {
  RESULTS: 'fmindset_assessment_results',
  USER_ID: 'fmindset_anonymous_user_id',
  GROQ_INSIGHTS: 'fmindset_groq_insights',
};

interface ResultsPageState {
  isLoading: boolean;
  scores: PsychologicalScores | null;
  archetype: ArchetypeResult | null;
  recommendations: string[];
  groqInsights: string | null;
  isLoadingInsights: boolean;
  error: string | null;
  canRetry: boolean;
}

/**
 * Results Page Component
 * 
 * Displays assessment results after quiz completion:
 * - Loads results from session storage/API
 * - Displays ResultsDisplay immediately (don't wait for Groq)
 * - Calls /api/groq/insights async
 * - Fades in insights when ready
 * - Shows fallback if Groq fails
 * - Provides Retake Assessment and Go to Dashboard buttons
 * 
 * Requirements: 5.1, 5.10, 5.11, 5.12, 5.13, 6.10, 6.11, 6.12
 */
export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<ResultsPageState>({
    isLoading: true,
    scores: null,
    archetype: null,
    recommendations: [],
    groqInsights: null,
    isLoadingInsights: false,
    error: null,
    canRetry: false,
  });


  /**
   * Load assessment results on mount
   * Requirements: 5.1, 5.10, 7.1
   */
  useEffect(() => {
    const loadResults = async () => {
      try {
        // Try to load results from session storage first
        const storedResults = sessionStorage.getItem(STORAGE_KEYS.RESULTS);
        
        if (!storedResults) {
          // No results found - redirect to quiz
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'No assessment results found. Please take the assessment first.',
            canRetry: false,
          }));
          return;
        }

        let results: AssessmentSubmitResponse;
        try {
          results = JSON.parse(storedResults);
        } catch (parseError) {
          // Corrupted data - Requirements: 7.1
          console.error('Failed to parse stored results:', parseError);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Connection error. Refresh.',
            canRetry: true,
          }));
          return;
        }

        // Validate results structure
        if (!results.scores || !results.archetype) {
          console.error('Invalid results structure');
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Connection error. Refresh.',
            canRetry: true,
          }));
          return;
        }
        
        // Check for cached Groq insights (Requirement 6.11)
        const cachedInsights = sessionStorage.getItem(STORAGE_KEYS.GROQ_INSIGHTS);
        
        setState({
          isLoading: false,
          scores: results.scores,
          archetype: results.archetype,
          recommendations: results.recommendations,
          groqInsights: cachedInsights || null,
          isLoadingInsights: !cachedInsights, // Only load if not cached
          error: null,
          canRetry: false,
        });

        // Fetch Groq insights async if not cached (Requirement 5.11, 6.10)
        if (!cachedInsights) {
          fetchGroqInsights(results.scores, results.archetype.name);
        }
      } catch (error) {
        // MongoDB/storage failure - Requirements: 7.1
        console.error('Failed to load results:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Connection error. Refresh.',
          canRetry: true,
        }));
      }
    };

    loadResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch Groq AI insights asynchronously
   * Requirements: 5.11, 5.12, 5.13, 6.10, 7.3
   * Groq failure: show fallback, don't block results
   */
  const fetchGroqInsights = useCallback(async (
    scores: PsychologicalScores, 
    archetypeName: string
  ) => {
    try {
      const response = await fetch('/api/groq/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scores, 
          archetype: archetypeName 
        }),
      });

      // Even if response is not ok, try to get fallback from body
      // Requirements: 7.3 - Groq failure should not block results
      const data: GroqInsightsResponse = await response.json();
      
      // Cache insights to prevent re-fetching on refresh (Requirement 6.11)
      if (data.insights) {
        sessionStorage.setItem(STORAGE_KEYS.GROQ_INSIGHTS, data.insights);
      }

      // Update state with insights (fade-in handled by ResultsDisplay)
      setState(prev => ({
        ...prev,
        groqInsights: data.insights || null,
        isLoadingInsights: false,
      }));
    } catch (error) {
      // Groq failure - show fallback, don't block results (Requirement 5.13, 7.3)
      console.error('Groq insights error:', error);
      
      // Set fallback text instead of null to show something to user
      const fallbackText = "We're generating personalized insights for you. Check back in a moment.";
      
      setState(prev => ({
        ...prev,
        groqInsights: fallbackText,
        isLoadingInsights: false,
      }));
    }
  }, []);

  /**
   * Handle retake assessment
   * Clears results and redirects to quiz
   */
  const handleRetakeAssessment = useCallback(() => {
    // Clear stored results and insights
    sessionStorage.removeItem(STORAGE_KEYS.RESULTS);
    sessionStorage.removeItem(STORAGE_KEYS.GROQ_INSIGHTS);
    
    // Navigate to quiz page
    router.push('/assessment/quiz');
  }, [router]);

  /**
   * Handle go to dashboard
   */
  const handleGoToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  /**
   * Handle retry loading results
   * Requirements: 7.1
   */
  const handleRetry = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    // Reload the page to retry loading results
    window.location.reload();
  }, []);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin-slow rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-xl">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Error state - with retry option for connection errors
  // Requirements: 7.1
  if (state.error || !state.scores || !state.archetype) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="text-center max-w-lg animate-scale-in">
          <div className="card p-10">
            <div className="text-6xl mb-6">{state.canRetry ? '⚠️' : '📋'}</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {state.error || 'No Results Found'}
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {state.canRetry 
                ? 'There was a problem loading your results. Please try again.'
                : 'It looks like you haven\'t completed the assessment yet, or your session has expired.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {state.canRetry && (
                <button
                  onClick={handleRetry}
                  className="btn-primary text-lg px-8 py-4"
                >
                  🔄 Retry
                </button>
              )}
              <button
                onClick={() => router.push('/assessment/quiz')}
                className={`text-lg px-8 py-4 ${
                  state.canRetry 
                    ? 'btn-secondary'
                    : 'btn-primary'
                }`}
              >
                {state.canRetry ? 'Start New Assessment' : 'Take the Assessment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Results display
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text text-center animate-fade-in">
            Your Assessment Results
          </h1>
          <p className="text-gray-600 text-center mt-2 text-lg animate-slide-in-left">
            Here's your personalized founder psychology profile
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-12">
        {/* Results Display Component */}
        <ResultsDisplay
          scores={state.scores}
          archetype={state.archetype}
          recommendations={state.recommendations}
          groqInsights={state.groqInsights}
          isLoadingInsights={state.isLoadingInsights}
        />

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto px-4 mt-12">
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
            <button
              onClick={handleRetakeAssessment}
              className="btn-secondary text-lg px-8 py-4"
            >
              🔄 Retake Assessment
            </button>
            <button
              onClick={handleGoToDashboard}
              className="btn-primary text-lg px-8 py-4"
            >
              📊 Go to Dashboard
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="max-w-4xl mx-auto px-4 mt-12 text-center animate-slide-in-left">
          <div className="card p-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              Your results are saved and can be accessed from your dashboard.
              <br />
              Consider retaking the assessment periodically to track your growth.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
