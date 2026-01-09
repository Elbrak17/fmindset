'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  CheckInForm, 
  TrendsChart, 
  BurnoutAlert, 
  ActionPlanWidget,
  SyncStatusIndicator,
  type JournalEntryData,
  type ExistingEntry,
  type JournalEntryForChart,
  type RiskLevel,
  type ActionItem,
  type CompletionStats,
} from '../../../components/Journal';
import { useOfflineSync } from '../../../hooks/useOfflineSync';

interface JournalHistoryResponse {
  entries: JournalEntryForChart[];
  total: number;
  trends: {
    moodAvg: number;
    energyAvg: number;
    stressAvg: number;
    moodTrend: 'improving' | 'stable' | 'declining';
    energyTrend: 'improving' | 'stable' | 'declining';
    stressTrend: 'improving' | 'stable' | 'declining';
  } | null;
  message?: string;
}

interface BurnoutScoreResponse {
  score: number;
  riskLevel: RiskLevel;
  contributingFactors: string[];
  recommendations: string[];
  disclaimer: string;
}

interface ActionsResponse {
  actions: ActionItem[];
  completedToday: number;
  totalToday: number;
  completionStats: CompletionStats;
}

function getOrCreateOdId(): string {
  if (typeof window === 'undefined') return '';
  let odId = localStorage.getItem('fmindset_odId');
  if (!odId) {
    odId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('fmindset_odId', odId);
  }
  return odId;
}

export default function JournalPage() {
  const [odId, setOdId] = useState<string>('');
  const [todayEntry, setTodayEntry] = useState<ExistingEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntryForChart[]>([]);
  const [burnoutScore, setBurnoutScore] = useState<BurnoutScoreResponse | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOdId(getOrCreateOdId());
  }, []);

  const { status: syncStatus, saveEntry, forceSync } = useOfflineSync(odId);

  const fetchAllData = useCallback(async () => {
    if (!odId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [historyRes, burnoutRes, actionsRes] = await Promise.allSettled([
        fetch(`/api/journal/history?odId=${encodeURIComponent(odId)}&days=${period}`),
        fetch(`/api/burnout/score?odId=${encodeURIComponent(odId)}`),
        fetch(`/api/actions/daily?odId=${encodeURIComponent(odId)}`),
      ]);

      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const historyData: JournalHistoryResponse = await historyRes.value.json();
        setEntries(historyData.entries);
        const today = new Date().toISOString().split('T')[0];
        const todayEntryData = historyData.entries.find(e => e.entryDate === today);
        if (todayEntryData) {
          setTodayEntry({
            id: todayEntryData.id,
            mood: todayEntryData.mood,
            energy: todayEntryData.energy,
            stress: todayEntryData.stress,
            notes: null,
            entryDate: todayEntryData.entryDate,
          });
        } else {
          setTodayEntry(null);
        }
      }

      if (burnoutRes.status === 'fulfilled') {
        if (burnoutRes.value.ok) {
          const burnoutData: BurnoutScoreResponse = await burnoutRes.value.json();
          setBurnoutScore(burnoutData);
        }
      }

      if (actionsRes.status === 'fulfilled' && actionsRes.value.ok) {
        const actionsData: ActionsResponse = await actionsRes.value.json();
        setActions(actionsData.actions);
        setCompletionStats(actionsData.completionStats);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load your journal data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [odId, period]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSubmit = async (data: JournalEntryData) => {
    if (!odId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await saveEntry(data);
      if (result.success) {
        if (result.entry) {
          setTodayEntry({
            id: result.entry.id,
            mood: result.entry.mood,
            energy: result.entry.energy,
            stress: result.entry.stress,
            notes: result.entry.notes,
            entryDate: result.entry.entryDate,
          });
          if (result.burnoutScore) {
            setBurnoutScore({
              score: result.burnoutScore.score,
              riskLevel: result.burnoutScore.riskLevel as RiskLevel,
              contributingFactors: result.burnoutScore.contributingFactors,
              recommendations: [],
              disclaimer: 'This is not a medical diagnosis.',
            });
          }
          await fetchAllData();
        } else {
          const today = new Date().toISOString().split('T')[0];
          setTodayEntry({
            id: `pending_${Date.now()}`,
            mood: data.mood,
            energy: data.energy,
            stress: data.stress,
            notes: data.notes || null,
            entryDate: today,
          });
        }
        if (result.error && !result.entry) {
          setError(result.error);
        }
      } else {
        throw new Error(result.error || 'Failed to save entry');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save entry';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAction = async (actionId: string) => {
    if (!odId) return;
    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });
      if (!response.ok) throw new Error('Failed to complete action');
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, isCompleted: true, completedAt: new Date() } : a));
      if (completionStats) {
        setCompletionStats({
          ...completionStats,
          completedActions: completionStats.completedActions + 1,
          completionRate: Math.round(((completionStats.completedActions + 1) / completionStats.totalActions) * 100),
        });
      }
    } catch (err) {
      console.error('Error completing action:', err);
      throw err;
    }
  };

  const handleRefreshActions = async () => {
    if (!odId) return;
    try {
      const response = await fetch('/api/actions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odId, forceRegenerate: true }),
      });
      if (!response.ok) throw new Error('Failed to generate actions');
      const result = await response.json();
      setActions(result.actions);
      if (result.completionStats) setCompletionStats(result.completionStats);
    } catch (err) {
      console.error('Error refreshing actions:', err);
      throw err;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
      <div className="fixed top-40 right-[5%] w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-blob" />
      <div className="fixed bottom-20 left-[10%] w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-indigo-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16">
        {/* Header */}
        <header className="px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-4">
                  <span className="text-lg">✍️</span>
                  <span className="text-sm font-medium text-gray-600">Daily Wellness Tracking</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                  Daily <span className="gradient-text">Journal</span>
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Track your wellbeing and build healthy habits</p>
              </div>
              <Link
                href="/dashboard"
                className="group inline-flex items-center px-5 py-2.5 text-gray-600 hover:text-indigo-600 transition-all rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:border-indigo-200 hover:shadow-lg animate-fade-in-up animation-delay-200"
              >
                <svg className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4">
          {/* Sync Status */}
          <div className="mb-6 animate-fade-in-up animation-delay-100">
            <SyncStatusIndicator status={syncStatus} onForceSync={forceSync} />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center animate-fade-in">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 text-lg">Loading your journal...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Check-in Form */}
                <section className="animate-fade-in-up animation-delay-200">
                  <CheckInForm
                    existingEntry={todayEntry}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                  />
                </section>

                {/* Burnout Alert */}
                {burnoutScore && (
                  <section className="animate-fade-in-up animation-delay-300">
                    <BurnoutAlert
                      score={burnoutScore.score}
                      riskLevel={burnoutScore.riskLevel}
                      contributingFactors={burnoutScore.contributingFactors}
                    />
                  </section>
                )}

                {/* Trends Chart */}
                <section className="animate-fade-in-up animation-delay-400">
                  <TrendsChart
                    entries={entries}
                    period={period}
                    onPeriodChange={setPeriod}
                  />
                </section>

                {/* Recent Entries */}
                <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-gray-100/50 border border-white/50 p-6 animate-fade-in-up animation-delay-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">📅</span>
                    Recent Entries
                  </h3>
                  
                  {entries.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">📝</span>
                      <p className="text-gray-600 text-lg">No entries yet. Start your first check-in above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entries.slice(0, 7).map((entry, i) => (
                        <div 
                          key={entry.id}
                          className="group flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700 w-28">
                              {formatDate(entry.entryDate)}
                            </span>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full">
                                <span>😊</span>
                                <span className="font-medium text-blue-700">{entry.mood}</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full">
                                <span>⚡</span>
                                <span className="font-medium text-emerald-700">{entry.energy}</span>
                              </span>
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-full">
                                <span>😰</span>
                                <span className="font-medium text-rose-700">{entry.stress}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.mood >= 70 && entry.energy >= 70 && entry.stress <= 30 && (
                              <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-medium rounded-full">
                                ✨ Great day!
                              </span>
                            )}
                            {entry.stress >= 70 && (
                              <span className="px-3 py-1 bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 text-xs font-medium rounded-full">
                                ⚠️ High stress
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 animate-fade-in-up animation-delay-300">
                <div className="sticky top-24">
                  <ActionPlanWidget
                    actions={actions}
                    completionStats={completionStats || undefined}
                    onComplete={handleCompleteAction}
                    onRefresh={handleRefreshActions}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
