/**
 * useOfflineSync Hook
 * Manages offline detection, entry syncing, and sync status
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  addPendingEntry,
  removePendingEntry,
  getAllPendingEntries,
  incrementSyncAttempts,
  shouldRetrySync,
  cacheEntry,
  getPendingCount,
  getLastSyncTime,
  type PendingEntry,
} from '../utils/offlineStorage';

// Types
export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: string | null;
  syncError: string | null;
}

export interface JournalEntryData {
  mood: number;
  energy: number;
  stress: number;
  notes?: string;
}

export interface SyncResult {
  success: boolean;
  entry?: {
    id: string;
    mood: number;
    energy: number;
    stress: number;
    notes?: string | null;
    entryDate: string;
  };
  burnoutScore?: {
    score: number;
    riskLevel: string;
    contributingFactors: string[];
  };
  error?: string;
}

// Constants for exponential backoff
const BASE_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 60000; // 1 minute
const SYNC_INTERVAL = 30000; // 30 seconds

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempts: number): number {
  const delay = BASE_RETRY_DELAY * Math.pow(2, attempts);
  return Math.min(delay, MAX_RETRY_DELAY);
}

/**
 * Hook for managing offline sync functionality
 */
export function useOfflineSync(userId: string) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Update pending count
  const updatePendingCount = useCallback(() => {
    setPendingCount(getPendingCount());
    setLastSyncAt(getLastSyncTime());
  }, []);

  // Sync a single entry to the server
  const syncEntry = useCallback(async (entry: PendingEntry): Promise<SyncResult> => {
    try {
      const response = await fetch('/api/journal/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odId: entry.userId,
          ...entry.data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Server error: ${response.status}`,
        };
      }

      const result = await response.json();
      return {
        success: true,
        entry: result.entry,
        burnoutScore: result.burnoutScore,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }, []);

  // Sync all pending entries
  const syncPendingEntries = useCallback(async (): Promise<void> => {
    if (!isOnline || isSyncing) return;

    const pendingEntries = getAllPendingEntries();
    if (pendingEntries.length === 0) return;

    setIsSyncing(true);
    setSyncError(null);

    let hasErrors = false;

    for (const entry of pendingEntries) {
      if (!isMountedRef.current) break;
      if (!shouldRetrySync(entry)) {
        // Entry has exceeded max retries, remove it
        removePendingEntry(entry.id);
        continue;
      }

      const result = await syncEntry(entry);

      if (result.success && result.entry) {
        // Successfully synced - remove from pending and cache
        removePendingEntry(entry.id);
        cacheEntry({
          id: result.entry.id,
          mood: result.entry.mood,
          energy: result.entry.energy,
          stress: result.entry.stress,
          notes: result.entry.notes,
          entryDate: result.entry.entryDate,
          userId: entry.userId,
        });
      } else {
        // Failed - increment attempts and schedule retry with backoff
        const attempts = incrementSyncAttempts(entry.id);
        hasErrors = true;

        if (shouldRetrySync({ ...entry, syncAttempts: attempts })) {
          const delay = calculateBackoffDelay(attempts);
          
          // Schedule retry
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
          }
          syncTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && isOnline) {
              syncPendingEntries();
            }
          }, delay);
        }
      }
    }

    if (isMountedRef.current) {
      setIsSyncing(false);
      updatePendingCount();
      
      if (hasErrors) {
        setSyncError('Some entries failed to sync. Will retry automatically.');
      }
    }
  }, [isOnline, isSyncing, syncEntry, updatePendingCount]);

  // Save entry (offline-first approach)
  const saveEntry = useCallback(async (
    data: JournalEntryData
  ): Promise<SyncResult> => {
    // Always save to localStorage first
    const pendingId = addPendingEntry(userId, data);
    updatePendingCount();

    if (!pendingId) {
      return {
        success: false,
        error: 'Failed to save entry locally',
      };
    }

    // If online, try to sync immediately
    if (isOnline) {
      const pendingEntries = getAllPendingEntries();
      const entry = pendingEntries.find(e => e.id === pendingId);
      
      if (entry) {
        const result = await syncEntry(entry);
        
        if (result.success && result.entry) {
          removePendingEntry(pendingId);
          cacheEntry({
            id: result.entry.id,
            mood: result.entry.mood,
            energy: result.entry.energy,
            stress: result.entry.stress,
            notes: result.entry.notes,
            entryDate: result.entry.entryDate,
            userId,
          });
          updatePendingCount();
          return result;
        } else {
          // Sync failed but entry is saved locally
          incrementSyncAttempts(pendingId);
          updatePendingCount();
          return {
            success: true, // Entry saved locally
            error: result.error,
          };
        }
      }
    }

    // Offline - entry saved locally
    return {
      success: true,
      error: 'Entry saved offline. Will sync when online.',
    };
  }, [userId, isOnline, syncEntry, updatePendingCount]);

  // Handle online status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(null);
      // Trigger sync when coming back online
      syncPendingEntries();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncError(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingEntries]);

  // Initial sync and periodic sync
  useEffect(() => {
    isMountedRef.current = true;
    updatePendingCount();

    // Initial sync if online
    if (isOnline) {
      syncPendingEntries();
    }

    // Set up periodic sync
    const intervalId = setInterval(() => {
      if (isMountedRef.current && isOnline) {
        syncPendingEntries();
      }
    }, SYNC_INTERVAL);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isOnline, syncPendingEntries, updatePendingCount]);

  // Force sync (manual trigger)
  const forceSync = useCallback(async (): Promise<void> => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      return;
    }
    await syncPendingEntries();
  }, [isOnline, syncPendingEntries]);

  return {
    // Status
    status: {
      isOnline,
      pendingCount,
      isSyncing,
      lastSyncAt,
      syncError,
    } as SyncStatus,
    
    // Actions
    saveEntry,
    forceSync,
    
    // Helpers
    hasPendingEntries: pendingCount > 0,
  };
}

export default useOfflineSync;
