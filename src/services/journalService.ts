import { eq, and, desc, gte } from 'drizzle-orm';
import { db } from '../db/connection';
import { journalEntries, type JournalEntry, type NewJournalEntry } from '../db/schema';

/**
 * Journal service for managing daily journal entries
 */

// Types for journal operations
export interface JournalEntryInput {
  userId: string;
  mood: number;
  energy: number;
  stress: number;
  notes?: string;
}

export interface TrendData {
  moodAvg: number;
  energyAvg: number;
  stressAvg: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  energyTrend: 'improving' | 'stable' | 'declining';
  stressTrend: 'improving' | 'stable' | 'declining';
}

// Validation constants
const MIN_SCORE = 0;
const MAX_SCORE = 100;
const MAX_NOTES_LENGTH = 500;

/**
 * Validation error class for journal entries
 */
export class JournalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JournalValidationError';
  }
}

/**
 * Validates journal entry input
 * @throws JournalValidationError if validation fails
 */
export function validateJournalInput(input: JournalEntryInput): void {
  // Validate userId
  if (!input.userId || typeof input.userId !== 'string' || input.userId.trim() === '') {
    throw new JournalValidationError('userId is required and must be a non-empty string');
  }

  // Validate mood
  if (typeof input.mood !== 'number' || isNaN(input.mood)) {
    throw new JournalValidationError('mood must be a number');
  }
  if (input.mood < MIN_SCORE || input.mood > MAX_SCORE) {
    throw new JournalValidationError(`mood must be between ${MIN_SCORE} and ${MAX_SCORE}`);
  }

  // Validate energy
  if (typeof input.energy !== 'number' || isNaN(input.energy)) {
    throw new JournalValidationError('energy must be a number');
  }
  if (input.energy < MIN_SCORE || input.energy > MAX_SCORE) {
    throw new JournalValidationError(`energy must be between ${MIN_SCORE} and ${MAX_SCORE}`);
  }

  // Validate stress
  if (typeof input.stress !== 'number' || isNaN(input.stress)) {
    throw new JournalValidationError('stress must be a number');
  }
  if (input.stress < MIN_SCORE || input.stress > MAX_SCORE) {
    throw new JournalValidationError(`stress must be between ${MIN_SCORE} and ${MAX_SCORE}`);
  }

  // Validate notes (optional)
  if (input.notes !== undefined && input.notes !== null) {
    if (typeof input.notes !== 'string') {
      throw new JournalValidationError('notes must be a string');
    }
    if (input.notes.length > MAX_NOTES_LENGTH) {
      throw new JournalValidationError(`notes must not exceed ${MAX_NOTES_LENGTH} characters`);
    }
  }
}

/**
 * Get today's date as a string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Create or update a journal entry for today
 * If an entry exists for today, it updates it; otherwise creates a new one
 */
export async function createOrUpdateEntry(input: JournalEntryInput): Promise<JournalEntry> {
  validateJournalInput(input);

  const today = getTodayDateString();

  try {
    // Check if entry exists for today
    const existingEntry = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, input.userId),
          eq(journalEntries.entryDate, today)
        )
      )
      .limit(1);

    if (existingEntry.length > 0) {
      // Update existing entry
      const updated = await db
        .update(journalEntries)
        .set({
          mood: input.mood,
          energy: input.energy,
          stress: input.stress,
          notes: input.notes ?? null,
          updatedAt: new Date(),
        })
        .where(eq(journalEntries.id, existingEntry[0].id))
        .returning();

      return updated[0];
    }

    // Create new entry
    const newEntry: NewJournalEntry = {
      userId: input.userId,
      mood: input.mood,
      energy: input.energy,
      stress: input.stress,
      notes: input.notes ?? null,
      entryDate: today,
      isSynced: true,
    };

    const created = await db
      .insert(journalEntries)
      .values(newEntry)
      .returning();

    return created[0];
  } catch (error) {
    if (error instanceof JournalValidationError) {
      throw error;
    }
    console.error('Database error in createOrUpdateEntry:', error);
    throw new Error('Failed to create or update journal entry');
  }
}


/**
 * Get a journal entry for a specific date
 * @param userId - The user's ID
 * @param date - The date to fetch (Date object or YYYY-MM-DD string)
 * @returns The journal entry or null if not found
 */
export async function getEntryByDate(
  userId: string,
  date: Date | string
): Promise<JournalEntry | null> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new JournalValidationError('userId is required and must be a non-empty string');
  }

  const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  try {
    const results = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(journalEntries.entryDate, dateString)
        )
      )
      .limit(1);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database error in getEntryByDate:', error);
    throw new Error('Failed to get journal entry');
  }
}


/**
 * Get journal entry history for the last N days
 * @param userId - The user's ID
 * @param days - Number of days to fetch (default: 7)
 * @returns Array of journal entries sorted by date descending
 */
export async function getHistory(
  userId: string,
  days: number = 7
): Promise<JournalEntry[]> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new JournalValidationError('userId is required and must be a non-empty string');
  }

  if (typeof days !== 'number' || days < 1) {
    throw new JournalValidationError('days must be a positive number');
  }

  // Calculate the start date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateString = startDate.toISOString().split('T')[0];

  try {
    const results = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.entryDate, startDateString)
        )
      )
      .orderBy(desc(journalEntries.entryDate));

    return results;
  } catch (error) {
    console.error('Database error in getHistory:', error);
    throw new Error('Failed to get journal history');
  }
}


/**
 * Calculate trend direction based on comparing recent vs older entries
 * @param recentAvg - Average of recent entries (first half)
 * @param olderAvg - Average of older entries (second half)
 * @param isInverse - If true, lower is better (like stress)
 * @returns Trend direction
 */
function calculateTrendDirection(
  recentAvg: number,
  olderAvg: number,
  isInverse: boolean = false
): 'improving' | 'stable' | 'declining' {
  const threshold = 5; // Minimum difference to consider a trend
  const diff = recentAvg - olderAvg;

  if (Math.abs(diff) < threshold) {
    return 'stable';
  }

  if (isInverse) {
    // For stress: lower is better, so negative diff is improving
    return diff < 0 ? 'improving' : 'declining';
  }

  // For mood/energy: higher is better, so positive diff is improving
  return diff > 0 ? 'improving' : 'declining';
}

/**
 * Calculate trends from journal entries
 * Computes averages and trend direction for mood, energy, and stress
 * @param entries - Array of journal entries (should be sorted by date descending)
 * @returns Trend data with averages and directions
 */
export function calculateTrends(entries: JournalEntry[]): TrendData {
  if (!entries || entries.length === 0) {
    return {
      moodAvg: 0,
      energyAvg: 0,
      stressAvg: 0,
      moodTrend: 'stable',
      energyTrend: 'stable',
      stressTrend: 'stable',
    };
  }

  // Calculate overall averages
  const moodSum = entries.reduce((sum, e) => sum + e.mood, 0);
  const energySum = entries.reduce((sum, e) => sum + e.energy, 0);
  const stressSum = entries.reduce((sum, e) => sum + e.stress, 0);

  const moodAvg = Math.round(moodSum / entries.length);
  const energyAvg = Math.round(energySum / entries.length);
  const stressAvg = Math.round(stressSum / entries.length);

  // Calculate trends by comparing recent vs older entries
  // Need at least 2 entries to calculate a trend
  if (entries.length < 2) {
    return {
      moodAvg,
      energyAvg,
      stressAvg,
      moodTrend: 'stable',
      energyTrend: 'stable',
      stressTrend: 'stable',
    };
  }

  // Split entries into recent (first half) and older (second half)
  // Entries are sorted descending, so first half is more recent
  const midpoint = Math.floor(entries.length / 2);
  const recentEntries = entries.slice(0, midpoint);
  const olderEntries = entries.slice(midpoint);

  // Calculate averages for each half
  const recentMoodAvg = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
  const olderMoodAvg = olderEntries.reduce((sum, e) => sum + e.mood, 0) / olderEntries.length;

  const recentEnergyAvg = recentEntries.reduce((sum, e) => sum + e.energy, 0) / recentEntries.length;
  const olderEnergyAvg = olderEntries.reduce((sum, e) => sum + e.energy, 0) / olderEntries.length;

  const recentStressAvg = recentEntries.reduce((sum, e) => sum + e.stress, 0) / recentEntries.length;
  const olderStressAvg = olderEntries.reduce((sum, e) => sum + e.stress, 0) / olderEntries.length;

  return {
    moodAvg,
    energyAvg,
    stressAvg,
    moodTrend: calculateTrendDirection(recentMoodAvg, olderMoodAvg, false),
    energyTrend: calculateTrendDirection(recentEnergyAvg, olderEnergyAvg, false),
    stressTrend: calculateTrendDirection(recentStressAvg, olderStressAvg, true),
  };
}


/**
 * Delete a journal entry by ID
 * @param entryId - The entry's UUID
 * @param userId - The user's ID (for ownership verification)
 * @returns True if deleted, false if not found
 */
export async function deleteEntry(
  entryId: string,
  userId: string
): Promise<boolean> {
  if (!entryId || typeof entryId !== 'string' || entryId.trim() === '') {
    throw new JournalValidationError('entryId is required and must be a non-empty string');
  }

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new JournalValidationError('userId is required and must be a non-empty string');
  }

  try {
    // Delete only if the entry belongs to the user
    const result = await db
      .delete(journalEntries)
      .where(
        and(
          eq(journalEntries.id, entryId),
          eq(journalEntries.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error('Database error in deleteEntry:', error);
    throw new Error('Failed to delete journal entry');
  }
}
