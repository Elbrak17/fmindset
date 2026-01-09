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
  low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Low Risk', icon: '✅', gradient: 'from-emerald-500 to-green-500' },
  caution: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Caution', icon: '⚠️', gradient: 'from-amber-500 to-yellow-500' },
  high: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High Risk', icon: '🔶', gradient: 'from-orange-500 to-red-400' },
  critical: { color: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Critical', icon: '🚨', gradient: 'from-rose-500 to-red-600' },
};

export default function Dashboard() {
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [burnoutScore, setBurnoutScore] = useState<BurnoutScore | null>(null);
  const [todayActions, setTodayActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const odId = 'demo-user-123';

  useEffect(() => {
    async function fetchJournalData() {
      try {
        const historyRes = await fetch(`/api/journal/history?odId=${odId}&days=1`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          const today = new Date().toISOString().split('T')[0];
          const todayEntryData = historyData.entries?.find(
            (e: JournalEntry) => e.entryDate === today
          );
          setTodayEntry(todayEntryData || null);
        }

        const burnoutRes = await fetch(`/api/burnout/score?odId=${odId}`);
        if (burnoutRes.ok) {
          const burnoutData = await burnoutRes.json();
          if (burnoutData.score !== undefined) {
            setBurnoutScore(burnoutData);
          }
        }

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
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-medium text-gray-600">Welcome back</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                  Your <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-gray-600 mt-3 text-lg md:text-xl">Track your progress and manage your wellness journey</p>
              </div>
              <Link
                href="/"
                className="group inline-flex items-center px-5 py-2.5 text-gray-600 hover:text-indigo-600 transition-all rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:border-indigo-200 hover:shadow-lg animate-fade-in-up animation-delay-200"
              >
                <svg className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4">
          {/* Daily Wellness Cards */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">📊</span>
                Daily Wellness
              </h2>
              <Link
                href="/dashboard/journal"
                className="group inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors rounded-lg hover:bg-indigo-50"
              >
                Open Journal
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Today's Check-in */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">Today&apos;s Check-in</h3>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                    </div>
                  ) : todayEntry ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Mood', value: todayEntry.mood, color: 'indigo' },
                        { label: 'Energy', value: todayEntry.energy, color: 'emerald' },
                        { label: 'Stress', value: todayEntry.stress, color: 'rose' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full transition-all duration-500`}
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-900 text-sm w-8">{item.value}</span>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Completed today
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 text-sm mb-4">You haven&apos;t checked in today</p>
                      <Link
                        href="/dashboard/journal"
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium group"
                      >
                        Log your check-in
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Burnout Risk */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-lg shadow-rose-500/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">Burnout Risk</h3>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-8 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                    </div>
                  ) : burnoutScore ? (
                    <div>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${riskLevelConfig[burnoutScore.riskLevel].color}`}>
                        <span className="mr-1.5">{riskLevelConfig[burnoutScore.riskLevel].icon}</span>
                        {riskLevelConfig[burnoutScore.riskLevel].label}
                      </div>
                      <p className={`text-3xl font-bold mt-3 bg-gradient-to-r ${riskLevelConfig[burnoutScore.riskLevel].gradient} bg-clip-text text-transparent`}>
                        {burnoutScore.score}/100
                      </p>
                      {burnoutScore.contributingFactors.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {burnoutScore.contributingFactors.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 text-sm mb-4">No burnout data yet</p>
                      <Link
                        href="/dashboard/journal"
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium group"
                      >
                        Start tracking
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Actions */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">Daily Actions</h3>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                    </div>
                  ) : totalActions > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">{completedActions} of {totalActions} completed</span>
                        <span className="text-sm font-semibold text-emerald-600">{completionPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-green-400 h-3 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                      {completionPercent === 100 && (
                        <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                          🎉 All done for today!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 text-sm mb-4">No actions for today</p>
                      <Link
                        href="/dashboard/journal"
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium group"
                      >
                        Generate actions
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '✅', label: 'Assessments Completed', value: '0', color: 'blue', delay: '0' },
              { icon: '📈', label: 'Growth Score', value: '--', color: 'green', delay: '100' },
              { icon: '🕐', label: 'Last Assessment', value: '--', color: 'purple', delay: '200' },
            ].map((stat, i) => (
              <div 
                key={i}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <div className="flex items-center">
                  <div className={`p-4 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-2xl text-3xl group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: '📝',
                title: 'Take Assessment',
                desc: 'Complete your psychological assessment to discover your founder profile and get personalized insights.',
                href: '/assessment/quiz',
                gradient: 'from-blue-500 to-indigo-600',
                btnText: 'Start Assessment',
              },
              {
                icon: '📊',
                title: 'View Results',
                desc: 'Review your latest assessment results, archetype classification, and AI-powered insights.',
                href: '/assessment/results',
                gradient: 'from-emerald-500 to-green-600',
                btnText: 'View Results',
              },
              {
                icon: '✍️',
                title: 'Daily Journal',
                desc: 'Track your mood, energy, and stress levels. Get personalized actions to prevent burnout.',
                href: '/dashboard/journal',
                gradient: 'from-indigo-500 to-purple-600',
                btnText: 'Open Journal',
              },
            ].map((card, i) => (
              <div 
                key={i}
                className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-3xl mb-6 text-4xl shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500`}>
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">{card.desc}</p>
                  <Link
                    href={card.href}
                    className={`inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r ${card.gradient} text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]`}
                  >
                    {card.btnText}
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Info Banner */}
          <div className="relative overflow-hidden rounded-[2rem] animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full animate-pulse" />
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full animate-pulse animation-delay-1000" />
            
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About Your Assessment</h2>
              <p className="text-indigo-100 mb-10 leading-relaxed text-lg max-w-3xl mx-auto">
                Our comprehensive psychological assessment measures 7 key dimensions of founder psychology 
                and classifies you into one of 8 distinct founder archetypes. Get personalized insights 
                powered by AI to help you understand your strengths and growth opportunities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                {[
                  { value: '25', label: 'Questions' },
                  { value: '7', label: 'Dimensions' },
                  { value: '8', label: 'Archetypes' },
                ].map((stat, i) => (
                  <div key={i} className="animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="text-5xl md:text-6xl font-extrabold mb-2">{stat.value}</div>
                    <div className="text-indigo-200 text-lg">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
