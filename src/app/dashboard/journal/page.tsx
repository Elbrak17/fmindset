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

// Types for API responses
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

interface JournalEntryResponse {
  success: boolean;
  entry: ExistingEntry;
  burnoutScore: {
    score: number;
    riskLevel: RiskLevel;
    contributingFactors: string[];
  };
}

// Helper to get or create odId from localStorage
function getOrCreateOdId(): string {
  if (typeof window === 'undefined') return '';
  
  let odId = localStorage.getItem('fmindset_odId');
  if (!odId) {
    odId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('fmindset_odId', odId);
  }
  return odId;
}

/**
 * Journal Page Component
 * Main page for daily journaling with check-in form, trends, burnout alerts, and action plans.
 * 
 * Requirements: 1.1, 1.4, 2.1, 2.2, 3.3, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5
 */
export default function JournalPage() {
  // User ID state
  const [odId, setOdId] = useState<string>('');
  
  // Data states
  const [todayEntry, setTodayEntry] = useState<ExistingEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntryForChart[]>([]);
  const [burnoutScore, setBurnoutScore] = useState<BurnoutScoreResponse | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
  
  // UI states
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize odId on mount
  useEffect(() => {
    setOdId(getOrCreateOdId());
  }, []);

  // Offline sync hook
  const { status: syncStatus, saveEntry, forceSync } = useOfflineSync(odId);

  // Fetch all data when odId is available
  const fetchAllData = useCallback(async () => {
    if (!odId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [historyRes, burnoutRes, actionsRes] = await Promise.allSettled([
        fetch(`/api/journal/history?odId=${encodeURIComponent(odId)}&days=${period}`),
        fetch(`/api/burnout/score?odId=${encodeURIComponent(odId)}`),
        fetch(`/api/actions/daily?odId=${encodeURIComponent(odId)}`),
      ]);

      // Process journal history
      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const historyData: JournalHistoryResponse = await historyRes.value.json();
        setEntries(historyData.entries);
        
        // Find today's entry
        const today = new Date().toISOString().split('T')[0];
        const todayEntryData = historyData.entries.find(e => e.entryDate === today);
        if (todayEntryData) {
          setTodayEntry({
            id: todayEntryData.id,
            mood: todayEntryData.mood,
            energy: todayEntryData.energy,
            stress: todayEntryData.stress,
            notes: null, // Notes not included in history response
            entryDate: todayEntryData.entryDate,
          });
        } else {
          setTodayEntry(null);
        }
      }

      // Process burnout score (404 is expected if no entries)
      if (burnoutRes.status === 'fulfilled') {
        if (burnoutRes.value.ok) {
          const burnoutData: BurnoutScoreResponse = await burnoutRes.value.json();
          setBurnoutScore(burnoutData);
        } else if (burnoutRes.value.status !== 404) {
          console.error('Failed to fetch burnout score');
        }
      }

      // Process actions
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

  // Fetch data when odId or period changes
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle form submission with offline support
  const handleSubmit = async (data: JournalEntryData) => {
    if (!odId) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Use offline-first approach via the sync hook
      const result = await saveEntry(data);
      
      if (result.success) {
        // If we got an entry back (online sync succeeded), update local state
        if (result.entry) {
          setTodayEntry({
            id: result.entry.id,
            mood: result.entry.mood,
            energy: result.entry.energy,
            stress: result.entry.stress,
            notes: result.entry.notes,
            entryDate: result.entry.entryDate,
          });

          // Update burnout score if available
          if (result.burnoutScore) {
            setBurnoutScore({
              score: result.burnoutScore.score,
              riskLevel: result.burnoutScore.riskLevel as RiskLevel,
              contributingFactors: result.burnoutScore.contributingFactors,
              recommendations: [],
              disclaimer: 'This is not a medical diagnosis.',
            });
          }

          // Refresh all data to get updated trends and actions
          await fetchAllData();
        } else {
          // Entry saved offline - update local state optimistically
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
        
        // Show info message if saved offline
        if (result.error && !result.entry) {
          setError(result.error);
        }
      } else {
        throw new Error(result.error || 'Failed to save entry');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save entry';
      setError(message);
      throw err; // Re-throw so CheckInForm can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle action completion
  const handleCompleteAction = async (actionId: string) => {
    if (!odId) return;

    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete action');
      }

      // Update local state
      setActions(prev => 
        prev.map(a => 
          a.id === actionId 
            ? { ...a, isCompleted: true, completedAt: new Date() }
            : a
        )
      );

      // Update completion stats
      if (completionStats) {
        setCompletionStats({
          ...completionStats,
          completedActions: completionStats.completedActions + 1,
          completionRate: Math.round(
            ((completionStats.completedActions + 1) / completionStats.totalActions) * 100
          ),
        });
      }
    } catch (err) {
      console.error('Error completing action:', err);
      throw err;
    }
  };

  // Handle action refresh/regeneration
  const handleRefreshActions = async () => {
    if (!odId) return;

    try {
      const response = await fetch('/api/actions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate actions');
      }

      const result = await response.json();
      setActions(result.actions);
    } catch (err) {
      console.error('Error refreshing actions:', err);
      throw err;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">Daily Journal</h1>
              <p className="text-gray-600 mt-1">Track your wellbeing and build healthy habits</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-white/50 focus-ring"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Sync Status Indicator */}
        <SyncStatusIndicator 
          status={syncStatus} 
          onForceSync={forceSync}
          className="mb-6"
        />

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your journal...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column - Check-in Form and Trends */}
            <div className="lg:col-span-2 space-y-8">
              {/* Check-in Form */}
              <section>
                <CheckInForm
                  existingEntry={todayEntry}
                  onSubmit={handleSubmit}
                  isLoading={isSubmitting}
                />
              </section>

              {/* Burnout Alert */}
              {burnoutScore && (
                <section>
                  <BurnoutAlert
                    score={burnoutScore.score}
                    riskLevel={burnoutScore.riskLevel}
                    contributingFactors={burnoutScore.contributingFactors}
                  />
                </section>
              )}

              {/* Trends Chart */}
              <section>
                <TrendsChart
                  entries={entries}
                  period={period}
                  onPeriodChange={setPeriod}
                />
              </section>

              {/* Recent Entries */}
              <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
                
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-3 block">📝</span>
                    <p className="text-gray-600">No entries yet. Start your first check-in above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.slice(0, 7).map((entry) => (
                      <div 
                        key={entry.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-700 w-24">
                            {formatDate(entry.entryDate)}
                          </span>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <span className="text-blue-500">😊</span>
                              <span className="text-gray-600">{entry.mood}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-green-500">⚡</span>
                              <span className="text-gray-600">{entry.energy}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-red-500">😰</span>
                              <span className="text-gray-600">{entry.stress}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.mood >= 70 && entry.energy >= 70 && entry.stress <= 30 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Great day!
                            </span>
                          )}
                          {entry.stress >= 70 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              High stress
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar - Action Plan */}
            <div className="lg:col-span-1">
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
  );
}
