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

  useEffect(() => {
    const loadResults = async () => {
      try {
        const storedResults = sessionStorage.getItem(STORAGE_KEYS.RESULTS);
        
        if (!storedResults) {
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
          console.error('Failed to parse stored results:', parseError);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Connection error. Refresh.',
            canRetry: true,
          }));
          return;
        }

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
        
        const cachedInsights = sessionStorage.getItem(STORAGE_KEYS.GROQ_INSIGHTS);
        
        setState({
          isLoading: false,
          scores: results.scores,
          archetype: results.archetype,
          recommendations: results.recommendations,
          groqInsights: cachedInsights || null,
          isLoadingInsights: !cachedInsights,
          error: null,
          canRetry: false,
        });

        if (!cachedInsights) {
          fetchGroqInsights(results.scores, results.archetype.name);
        }
      } catch (error) {
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

      const data: GroqInsightsResponse = await response.json();
      
      if (data.insights) {
        sessionStorage.setItem(STORAGE_KEYS.GROQ_INSIGHTS, data.insights);
      }

      setState(prev => ({
        ...prev,
        groqInsights: data.insights || null,
        isLoadingInsights: false,
      }));
    } catch (error) {
      console.error('Groq insights error:', error);
      const fallbackText = "We're generating personalized insights for you. Check back in a moment.";
      setState(prev => ({
        ...prev,
        groqInsights: fallbackText,
        isLoadingInsights: false,
      }));
    }
  }, []);

  const handleRetakeAssessment = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.RESULTS);
    sessionStorage.removeItem(STORAGE_KEYS.GROQ_INSIGHTS);
    router.push('/assessment/quiz');
  }, [router]);

  const handleGoToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleRetry = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    window.location.reload();
  }, []);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
        <div className="relative text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-purple-100"></div>
            <div className="absolute inset-2 rounded-full border-4 border-purple-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 text-xl font-medium">Loading your results...</p>
          <p className="text-gray-400 text-sm mt-2">Analyzing your psychological profile</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error || !state.scores || !state.archetype) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
        <div className="relative text-center max-w-lg animate-scale-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 border border-white/50 shadow-2xl shadow-gray-200/50">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <span className="text-5xl">{state.canRetry ? '⚠️' : '📋'}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {state.error || 'No Results Found'}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {state.canRetry 
                ? 'There was a problem loading your results. Please try again.'
                : 'It looks like you haven\'t completed the assessment yet, or your session has expired.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {state.canRetry && (
                <button
                  onClick={handleRetry}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  🔄 Retry
                </button>
              )}
              <button
                onClick={() => router.push('/assessment/quiz')}
                className={`px-8 py-4 font-semibold rounded-2xl transition-all duration-300 ${
                  state.canRetry 
                    ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:shadow-lg'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105'
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
      <div className="fixed top-20 right-[10%] w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-blob" />
      <div className="fixed bottom-20 left-[10%] w-80 h-80 bg-gradient-to-br from-cyan-200/20 to-indigo-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16">
        {/* Header */}
        <header className="px-4 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-sm mb-6 animate-fade-in-down">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-700">Assessment Complete</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 animate-fade-in-up">
              Your <span className="gradient-text">Results</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl animate-fade-in-up animation-delay-200">
              Here&apos;s your personalized founder psychology profile
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="pb-12">
          <ResultsDisplay
            scores={state.scores}
            archetype={state.archetype}
            recommendations={state.recommendations}
            groqInsights={state.groqInsights}
            isLoadingInsights={state.isLoadingInsights}
          />

          {/* Action Buttons */}
          <div className="max-w-4xl mx-auto px-4 mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <button
                onClick={handleRetakeAssessment}
                className="group px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  🔄 Retake Assessment
                </span>
              </button>
              <button
                onClick={handleGoToDashboard}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  📊 Go to Dashboard
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="max-w-4xl mx-auto px-4 mt-12 text-center animate-fade-in-up animation-delay-300">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg shadow-gray-100/50">
              <p className="text-gray-600 leading-relaxed">
                Your results are saved and can be accessed from your dashboard.
                <br />
                <span className="text-indigo-600 font-medium">Consider retaking the assessment periodically to track your growth.</span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
