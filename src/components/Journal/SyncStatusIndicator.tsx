/**
 * SyncStatusIndicator Component
 * Displays the current sync status including online/offline state and pending entries
 * 
 * Requirements: 6.4
 */

'use client';

import React from 'react';
import type { SyncStatus } from '../../hooks/useOfflineSync';

export interface SyncStatusIndicatorProps {
  status: SyncStatus;
  onForceSync?: () => void;
  className?: string;
}

/**
 * Format relative time for last sync
 */
function formatLastSync(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
}

export function SyncStatusIndicator({
  status,
  onForceSync,
  className = '',
}: SyncStatusIndicatorProps) {
  const { isOnline, pendingCount, isSyncing, lastSyncAt, syncError } = status;

  // Don't show anything if online with no pending entries and no errors
  if (isOnline && pendingCount === 0 && !syncError && !isSyncing) {
    return null;
  }

  return (
    <div className={`rounded-xl border p-3 ${className} ${
      !isOnline 
        ? 'bg-yellow-50 border-yellow-200' 
        : syncError 
          ? 'bg-orange-50 border-orange-200'
          : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between gap-3">
        {/* Status Icon and Text */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Indicator */}
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          
          {/* Status Text */}
          <div className="text-sm">
            {!isOnline ? (
              <span className="text-yellow-700 font-medium">
                You&apos;re offline
              </span>
            ) : isSyncing ? (
              <span className="text-blue-700 font-medium flex items-center gap-2">
                <svg 
                  className="animate-spin h-4 w-4" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Syncing...
              </span>
            ) : syncError ? (
              <span className="text-orange-700 font-medium">
                Sync issue
              </span>
            ) : (
              <span className="text-blue-700 font-medium">
                Pending sync
              </span>
            )}
          </div>
        </div>

        {/* Pending Count Badge */}
        {pendingCount > 0 && (
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            !isOnline 
              ? 'bg-yellow-200 text-yellow-800' 
              : 'bg-blue-200 text-blue-800'
          }`}>
            {pendingCount} {pendingCount === 1 ? 'entry' : 'entries'} pending
          </div>
        )}

        {/* Sync Button */}
        {isOnline && pendingCount > 0 && !isSyncing && onForceSync && (
          <button
            onClick={onForceSync}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
            aria-label="Sync now"
          >
            <svg 
              className="w-4 h-4" 
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
            Sync
          </button>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
        {!isOnline && (
          <span>Your entries are saved locally and will sync when you&apos;re back online.</span>
        )}
        {isOnline && syncError && (
          <span className="text-orange-600">{syncError}</span>
        )}
        {isOnline && !syncError && pendingCount > 0 && !isSyncing && (
          <span>Last sync: {formatLastSync(lastSyncAt)}</span>
        )}
      </div>
    </div>
  );
}

export default SyncStatusIndicator;
