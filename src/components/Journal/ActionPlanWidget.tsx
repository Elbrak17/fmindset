'use client';

import { useState, useCallback, useId } from 'react';

// Types
export type ActionCategory = 'mindfulness' | 'social' | 'physical' | 'professional' | 'rest';

export interface ActionItem {
  id: string;
  actionText: string;
  category: ActionCategory;
  targetDimension: string | null;
  isCompleted: boolean;
  assignedDate: string;
  completedAt: Date | null;
  createdAt: Date;
}

export interface CompletionStats {
  totalActions: number;
  completedActions: number;
  completionRate: number;
  streakDays: number;
}

export interface ActionPlanWidgetProps {
  actions: ActionItem[];
  completionStats?: CompletionStats;
  onComplete: (actionId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<ActionCategory, {
  icon: string;
  label: string;
  bgColor: string;
  textColor: string;
}> = {
  mindfulness: {
    icon: '🧘',
    label: 'Mindfulness',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  social: {
    icon: '👥',
    label: 'Social',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  physical: {
    icon: '💪',
    label: 'Physical',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  professional: {
    icon: '💼',
    label: 'Professional',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  rest: {
    icon: '😴',
    label: 'Rest',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
  },
};

// Encouraging messages based on completion progress
const ENCOURAGEMENT_MESSAGES = {
  none: "Ready to take care of yourself today? Start with one small action.",
  started: "Great start! Every small step counts.",
  halfway: "You're doing amazing! Keep up the momentum.",
  almostDone: "Almost there! You've got this.",
  complete: "🎉 Fantastic! You've completed all your actions for today!",
};

function getEncouragementMessage(completed: number, total: number): string {
  if (total === 0) return ENCOURAGEMENT_MESSAGES.none;
  if (completed === 0) return ENCOURAGEMENT_MESSAGES.none;
  if (completed === total) return ENCOURAGEMENT_MESSAGES.complete;
  if (completed >= total * 0.75) return ENCOURAGEMENT_MESSAGES.almostDone;
  if (completed >= total * 0.5) return ENCOURAGEMENT_MESSAGES.halfway;
  return ENCOURAGEMENT_MESSAGES.started;
}


/**
 * ActionPlanWidget Component
 * Displays daily micro-actions as a checklist with progress tracking.
 * 
 * Features:
 * - 3-5 daily actions displayed as checklist
 * - Category icons for each action
 * - Checkbox to mark complete
 * - Progress bar showing completion
 * - Encouraging messages based on progress
 * - Refresh button to regenerate actions
 * 
 * Requirements: 4.1, 4.3
 */
export function ActionPlanWidget({
  actions,
  completionStats,
  onComplete,
  onRefresh,
  isLoading = false,
}: ActionPlanWidgetProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const widgetId = useId();

  const completedCount = actions.filter(a => a.isCompleted).length;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleComplete = useCallback(async (actionId: string) => {
    if (completingId) return; // Prevent double-clicks
    
    setCompletingId(actionId);
    try {
      await onComplete(actionId);
    } finally {
      setCompletingId(null);
    }
  }, [completingId, onComplete]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (actions.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-4">
          <span className="text-4xl mb-3 block">📋</span>
          <h3 className="font-semibold text-gray-800 mb-2">No Actions Yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate your personalized daily actions to get started.
          </p>
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="
                px-4 py-2 bg-indigo-600 text-white rounded-lg
                hover:bg-indigo-700 focus:outline-none focus:ring-2 
                focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              {isRefreshing ? 'Generating...' : 'Generate Actions'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      id={widgetId}
      className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden"
      role="region"
      aria-label="Daily Action Plan"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">✨</span>
            <h3 className="font-semibold text-gray-800">Today&apos;s Actions</h3>
          </div>
          
          {/* Refresh button */}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="
                p-2 text-gray-500 hover:text-indigo-600 hover:bg-white/80
                rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Refresh actions"
              title="Generate new actions"
            >
              <svg 
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {completedCount} of {totalCount} completed
            </span>
            <span className="font-medium text-indigo-600">{progressPercent}%</span>
          </div>
          <div 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${completedCount} of ${totalCount} actions completed`}
          >
            <div 
              className={`
                h-full rounded-full transition-all duration-500 ease-out
                ${progressPercent === 100 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                }
              `}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action list */}
      <ul className="divide-y divide-gray-100" role="list">
        {actions.map((action) => {
          const categoryConfig = CATEGORY_CONFIG[action.category];
          const isCompleting = completingId === action.id;
          
          return (
            <li 
              key={action.id}
              className={`
                px-5 py-4 transition-colors duration-200
                ${action.isCompleted ? 'bg-gray-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => !action.isCompleted && handleComplete(action.id)}
                    disabled={action.isCompleted || isCompleting}
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
                      ${action.isCompleted 
                        ? 'bg-green-500 border-green-500 cursor-default' 
                        : 'border-gray-300 hover:border-indigo-500 cursor-pointer'
                      }
                      ${isCompleting ? 'opacity-50' : ''}
                    `}
                    aria-label={action.isCompleted ? 'Completed' : `Mark "${action.actionText}" as complete`}
                    aria-checked={action.isCompleted}
                    role="checkbox"
                  >
                    {action.isCompleted && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                    {isCompleting && (
                      <svg className="w-3 h-3 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Action content */}
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm leading-relaxed
                    ${action.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}
                  `}>
                    {action.actionText}
                  </p>
                </div>

                {/* Category badge */}
                <div 
                  className={`
                    flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium
                    flex items-center gap-1
                    ${categoryConfig.bgColor} ${categoryConfig.textColor}
                  `}
                  title={categoryConfig.label}
                >
                  <span aria-hidden="true">{categoryConfig.icon}</span>
                  <span className="hidden sm:inline">{categoryConfig.label}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Encouragement message */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
        <p className="text-sm text-center text-gray-700">
          {getEncouragementMessage(completedCount, totalCount)}
        </p>
      </div>

      {/* Streak indicator (if stats available) */}
      {completionStats && completionStats.streakDays > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-700">
            <span aria-hidden="true">🔥</span>
            <span className="font-medium">{completionStats.streakDays} day streak!</span>
            <span className="text-amber-600">Keep it going!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionPlanWidget;
