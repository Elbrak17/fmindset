/**
 * Offline Storage Utilities
 * Handles localStorage operations for offline journal entries
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

// Types
export interface PendingEntry {
  id: string;
  data: {
    mood: number;
    energy: number;
    stress: number;
    notes?: string;
  };
  userId: string;
  entryDate: string;
  createdAt: string;
  syncAttempts: number;
  lastSyncAttempt?: string;
}

export interface CachedEntry {
  id: string;
  mood: number;
  energy: number;
  stress: number;
  notes?: string | null;
  entryDate: string;
  userId: string;
}

export interface OfflineStore {
  pendingEntries: PendingEntry[];
  cachedEntries: CachedEntry[];
  lastSyncAt: string | null;
}

// Storage keys
const STORAGE_KEY = 'fmindset_offline_store';
const MAX_SYNC_ATTEMPTS = 5;
const MAX_PENDING_ENTRIES = 30; // Limit to prevent storage overflow

/**
 * Generate a unique ID for pending entries
 */
export function generatePendingId(): string {
  return `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the offline store from localStorage
 */
export function getOfflineStore(): OfflineStore {
  if (!isLocalStorageAvailable()) {
    return { pendingEntries: [], cachedEntries: [], lastSyncAt: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { pendingEntries: [], cachedEntries: [], lastSyncAt: null };
    }
    
    const parsed = JSON.parse(stored) as OfflineStore;
    return {
      pendingEntries: parsed.pendingEntries || [],
      cachedEntries: parsed.cachedEntries || [],
      lastSyncAt: parsed.lastSyncAt || null,
    };
  } catch (error) {
    console.error('Error reading offline store:', error);
    return { pendingEntries: [], cachedEntries: [], lastSyncAt: null };
  }
}

/**
 * Save the offline store to localStorage
 */
export function saveOfflineStore(store: OfflineStore): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch (error) {
    console.error('Error saving offline store:', error);
    return false;
  }
}

/**
 * Add a pending entry to localStorage
 * Returns the pending entry ID
 */
export function addPendingEntry(
  userId: string,
  data: { mood: number; energy: number; stress: number; notes?: string }
): string | null {
  const store = getOfflineStore();
  const entryDate = getTodayDateString();
  
  // Check if we already have a pending entry for today
  const existingIndex = store.pendingEntries.findIndex(
    e => e.userId === userId && e.entryDate === entryDate
  );

  const pendingId = existingIndex >= 0 
    ? store.pendingEntries[existingIndex].id 
    : generatePendingId();

  const pendingEntry: PendingEntry = {
    id: pendingId,
    data,
    userId,
    entryDate,
    createdAt: existingIndex >= 0 
      ? store.pendingEntries[existingIndex].createdAt 
      : new Date().toISOString(),
    syncAttempts: existingIndex >= 0 
      ? store.pendingEntries[existingIndex].syncAttempts 
      : 0,
  };

  if (existingIndex >= 0) {
    // Update existing pending entry
    store.pendingEntries[existingIndex] = pendingEntry;
  } else {
    // Add new pending entry (limit total entries)
    if (store.pendingEntries.length >= MAX_PENDING_ENTRIES) {
      // Remove oldest entries that have exceeded max sync attempts
      store.pendingEntries = store.pendingEntries
        .filter(e => e.syncAttempts < MAX_SYNC_ATTEMPTS)
        .slice(-MAX_PENDING_ENTRIES + 1);
    }
    store.pendingEntries.push(pendingEntry);
  }

  const saved = saveOfflineStore(store);
  return saved ? pendingId : null;
}

/**
 * Get all pending entries for a user
 */
export function getPendingEntries(userId: string): PendingEntry[] {
  const store = getOfflineStore();
  return store.pendingEntries.filter(e => e.userId === userId);
}

/**
 * Get all pending entries (for sync)
 */
export function getAllPendingEntries(): PendingEntry[] {
  const store = getOfflineStore();
  return store.pendingEntries;
}

/**
 * Check if there's a pending entry for today
 */
export function hasPendingEntryForToday(userId: string): boolean {
  const store = getOfflineStore();
  const today = getTodayDateString();
  return store.pendingEntries.some(
    e => e.userId === userId && e.entryDate === today
  );
}

/**
 * Remove a pending entry after successful sync
 */
export function removePendingEntry(pendingId: string): boolean {
  const store = getOfflineStore();
  const initialLength = store.pendingEntries.length;
  
  store.pendingEntries = store.pendingEntries.filter(e => e.id !== pendingId);
  
  if (store.pendingEntries.length < initialLength) {
    store.lastSyncAt = new Date().toISOString();
    return saveOfflineStore(store);
  }
  
  return false;
}

/**
 * Increment sync attempts for a pending entry
 */
export function incrementSyncAttempts(pendingId: string): number {
  const store = getOfflineStore();
  const entry = store.pendingEntries.find(e => e.id === pendingId);
  
  if (entry) {
    entry.syncAttempts += 1;
    entry.lastSyncAttempt = new Date().toISOString();
    saveOfflineStore(store);
    return entry.syncAttempts;
  }
  
  return 0;
}

/**
 * Check if a pending entry should be retried
 */
export function shouldRetrySync(pendingEntry: PendingEntry): boolean {
  return pendingEntry.syncAttempts < MAX_SYNC_ATTEMPTS;
}

/**
 * Cache a synced entry for offline viewing
 */
export function cacheEntry(entry: CachedEntry): boolean {
  const store = getOfflineStore();
  
  // Check if entry already exists
  const existingIndex = store.cachedEntries.findIndex(
    e => e.id === entry.id || (e.userId === entry.userId && e.entryDate === entry.entryDate)
  );

  if (existingIndex >= 0) {
    store.cachedEntries[existingIndex] = entry;
  } else {
    // Keep only last 30 entries per user
    const userEntries = store.cachedEntries.filter(e => e.userId === entry.userId);
    if (userEntries.length >= 30) {
      // Remove oldest entry for this user
      const oldestEntry = userEntries.sort((a, b) => 
        a.entryDate.localeCompare(b.entryDate)
      )[0];
      store.cachedEntries = store.cachedEntries.filter(e => e.id !== oldestEntry.id);
    }
    store.cachedEntries.push(entry);
  }

  return saveOfflineStore(store);
}

/**
 * Get cached entries for a user
 */
export function getCachedEntries(userId: string): CachedEntry[] {
  const store = getOfflineStore();
  return store.cachedEntries
    .filter(e => e.userId === userId)
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
}

/**
 * Clear all offline data (for logout or data reset)
 */
export function clearOfflineStore(): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing offline store:', error);
    return false;
  }
}

/**
 * Get the count of pending entries
 */
export function getPendingCount(): number {
  const store = getOfflineStore();
  return store.pendingEntries.length;
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(): string | null {
  const store = getOfflineStore();
  return store.lastSyncAt;
}
