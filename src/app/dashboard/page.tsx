'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Types for journal data
interface JournalEntry {
  id: string;
  mood: number;
  energy: number;
  stress: number;
  entryDate: string;
}

interface BurnoutScore {
  score: number;
  riskLevel: 'low' | 'caution' | 'high' | 'critical';
  contributingFactors: string[];
}

interface ActionItem {
  id: string;
  actionText: string;
  category: string;
  isCompleted: boolean;
}

// Risk level colors and labels
const riskLevelConfig = {
  low: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low Risk', icon: '✅' },
  caution: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Caution', icon: '⚠️' },
  high: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'High Risk', icon: '🔶' },
  critical: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Critical', icon: '🚨' },
};

export default function Dashboard() {
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [burnoutScore, setBurnoutScore] = useState<BurnoutScore | null>(null);
  const [todayActions, setTodayActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // For demo purposes, using a static odId - in production this would come from auth
  const odId = 'demo-user-123';

  useEffect(() => {
    async function fetchJournalData() {
      try {
        // Fetch today's journal entry
        const historyRes = await fetch(`/api/journal/history?odId=${odId}&days=1`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          const today = new Date().toISOString().split('T')[0];
          const todayEntryData = historyData.entries?.find(
            (e: JournalEntry) => e.entryDate === today
          );
          setTodayEntry(todayEntryData || null);
        }

        // Fetch burnout score
        const burnoutRes = await fetch(`/api/burnout/score?odId=${odId}`);
        if (burnoutRes.ok) {
          const burnoutData = await burnoutRes.json();
          if (burnoutData.score !== undefined) {
            setBurnoutScore(burnoutData);
          }
        }

        // Fetch today's actions
        const actionsRes = await fetch(`/api/actions/daily?odId=${odId}`);
        if (actionsRes.ok) {
          const actionsData = await actionsRes.json();
          setTodayActions(actionsData.actions || []);
        }
      } catch (error) {
        console.error('Error fetching journal data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJournalData();
  }, []);

  const completedActions = todayActions.filter(a => a.isCompleted).length;
  const totalActions = todayActions.length;
  const completionPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in-left">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">Dashboard</h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your assessments and view your progress</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-white/50 focus-ring animate-slide-in-right"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Journal Summary Section */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Daily Wellness</h2>
            <Link
              href="/dashboard/journal"
              className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Open Journal
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Check-in Status */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Today's Check-in</h3>
              </div>
              
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : todayEntry ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mood</span>
                    <span className="font-medium">{todayEntry.mood}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Energy</span>
                    <span className="font-medium">{todayEntry.energy}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stress</span>
                    <span className="font-medium">{todayEntry.stress}/100</span>
                  </div>
                  <p className="text-xs text-green-600 mt-2">✓ Completed today</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">You haven't checked in today</p>
                  <Link
                    href="/dashboard/journal"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Log your check-in
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Burnout Risk Level */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Burnout Risk</h3>
              </div>
              
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : burnoutScore ? (
                <div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${riskLevelConfig[burnoutScore.riskLevel].color}`}>
                    <span className="mr-1">{riskLevelConfig[burnoutScore.riskLevel].icon}</span>
                    {riskLevelConfig[burnoutScore.riskLevel].label}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{burnoutScore.score}/100</p>
                  {burnoutScore.contributingFactors.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {burnoutScore.contributingFactors.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">No burnout data yet</p>
                  <Link
                    href="/dashboard/journal"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Start tracking
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Action Completion Progress */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Daily Actions</h3>
              </div>
              
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : totalActions > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{completedActions} of {totalActions} completed</span>
                    <span className="text-sm font-medium text-emerald-600">{completionPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>
                  {completionPercent === 100 && (
                    <p className="text-xs text-emerald-600 mt-2">🎉 All done for today!</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">No actions for today</p>
                  <Link
                    href="/dashboard/journal"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Generate actions
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 animate-scale-in">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-600 mb-1">Assessments Completed</p>
                <p className="text-3xl font-bold gradient-text">0</p>
              </div>
            </div>
          </div>

          <div className="card p-8 animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-600 mb-1">Growth Score</p>
                <p className="text-3xl font-bold gradient-text">--</p>
              </div>
            </div>
          </div>

          <div className="card p-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-600 mb-1">Last Assessment</p>
                <p className="text-3xl font-bold gradient-text">--</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Take Assessment Card */}
          <div className="group card-interactive p-10 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Take Assessment</h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Complete your psychological assessment to discover your founder profile and get personalized insights.
            </p>
            <Link
              href="/assessment/quiz"
              className="btn-primary w-full text-lg py-4"
            >
              Start Assessment
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* View Results Card */}
          <div className="group card-interactive p-10 text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">View Results</h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Review your latest assessment results, archetype classification, and AI-powered insights.
            </p>
            <Link
              href="/assessment/results"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-lg focus-ring"
            >
              View Results
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* Journal Card - NEW */}
          <div className="group card-interactive p-10 text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Daily Journal</h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Track your mood, energy, and stress levels. Get personalized actions to prevent burnout.
            </p>
            <Link
              href="/dashboard/journal"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-lg focus-ring"
            >
              Open Journal
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-4xl p-12 text-white relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
          <div className="text-center max-w-4xl mx-auto relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Your Assessment</h2>
            <p className="text-blue-100 mb-10 leading-relaxed text-lg">
              Our comprehensive psychological assessment measures 7 key dimensions of founder psychology 
              and classifies you into one of 8 distinct founder archetypes. Get personalized insights 
              powered by AI to help you understand your strengths and growth opportunities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="animate-scale-in">
                <div className="text-4xl md:text-5xl font-bold mb-2">25</div>
                <div className="text-blue-200 text-lg">Questions</div>
              </div>
              <div className="animate-scale-in" style={{animationDelay: '0.1s'}}>
                <div className="text-4xl md:text-5xl font-bold mb-2">7</div>
                <div className="text-blue-200 text-lg">Dimensions</div>
              </div>
              <div className="animate-scale-in" style={{animationDelay: '0.2s'}}>
                <div className="text-4xl md:text-5xl font-bold mb-2">8</div>
                <div className="text-blue-200 text-lg">Archetypes</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
