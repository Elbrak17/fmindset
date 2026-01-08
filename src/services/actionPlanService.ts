/**
 * Action Plan Service
 * Generates and manages personalized daily micro-actions for founders
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { 
  actionItems, 
  type ActionItem, 
  type NewActionItem,
  type Assessment 
} from '../db/schema';
import type { ArchetypeName } from '../types/assessment';
import type { BurnoutScoreResult } from './burnoutService';
import { 
  DIMENSION_ACTIONS, 
  ARCHETYPE_ACTIONS, 
  GENERAL_WELLNESS_ACTIONS,
  type ActionTemplate,
  type Dimension,
  type ActionCategory
} from '../utils/actionTemplates';

// Constants
const MIN_DAILY_ACTIONS = 3;
const MAX_DAILY_ACTIONS = 5;
const HIGH_DIMENSION_THRESHOLD = 70;
const LOW_JOURNAL_THRESHOLD = 40;
const HIGH_STRESS_THRESHOLD = 70;

// Completion stats interface
export interface CompletionStats {
  totalActions: number;
  completedActions: number;
  completionRate: number;
  streakDays: number;
}

/**
 * Get today's date as a string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Simple seeded random number generator for daily rotation
 * Uses date + userId as seed for consistent daily results per user
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

/**
 * Shuffle array using seeded random for consistent daily rotation
 */
function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Identify high-risk dimensions from assessment
 */
function getHighRiskDimensions(assessment: Assessment | null): Dimension[] {
  if (!assessment) return [];
  
  const dimensions: Dimension[] = [];
  
  if (assessment.imposterSyndrome > HIGH_DIMENSION_THRESHOLD) {
    dimensions.push('imposterSyndrome');
  }
  if (assessment.founderDoubt > HIGH_DIMENSION_THRESHOLD) {
    dimensions.push('founderDoubt');
  }
  if (assessment.identityFusion > HIGH_DIMENSION_THRESHOLD) {
    dimensions.push('identityFusion');
  }
  if (assessment.fearOfRejection > HIGH_DIMENSION_THRESHOLD) {
    dimensions.push('fearOfRejection');
  }
  if (assessment.isolationLevel > HIGH_DIMENSION_THRESHOLD) {
    dimensions.push('isolationLevel');
  }
  
  return dimensions;
}

/**
 * Identify dimensions needing attention from burnout score
 */
function getDimensionsFromBurnout(burnoutScore: BurnoutScoreResult | null): Dimension[] {
  if (!burnoutScore) return [];
  
  const dimensions: Dimension[] = [];
  
  // Check contributing factors for clues
  const factors = burnoutScore.contributingFactors;
  
  if (factors.some(f => f.toLowerCase().includes('mood'))) {
    dimensions.push('mood');
  }
  if (factors.some(f => f.toLowerCase().includes('energy'))) {
    dimensions.push('energy');
  }
  if (factors.some(f => f.toLowerCase().includes('stress'))) {
    dimensions.push('stress');
  }
  if (factors.some(f => f.toLowerCase().includes('imposter'))) {
    dimensions.push('imposterSyndrome');
  }
  if (factors.some(f => f.toLowerCase().includes('doubt'))) {
    dimensions.push('founderDoubt');
  }
  if (factors.some(f => f.toLowerCase().includes('isolation'))) {
    dimensions.push('isolationLevel');
  }
  if (factors.some(f => f.toLowerCase().includes('identity'))) {
    dimensions.push('identityFusion');
  }
  if (factors.some(f => f.toLowerCase().includes('rejection'))) {
    dimensions.push('fearOfRejection');
  }
  
  return dimensions;
}


/**
 * Select actions ensuring variety in categories
 */
function selectDiverseActions(
  candidates: ActionTemplate[],
  count: number,
  seed: string
): ActionTemplate[] {
  if (candidates.length === 0) return [];
  if (candidates.length <= count) return candidates;
  
  // Shuffle candidates with seed for daily rotation
  const shuffled = shuffleWithSeed(candidates, seed);
  
  // Try to get diverse categories
  const selected: ActionTemplate[] = [];
  const usedCategories = new Set<ActionCategory>();
  
  // First pass: pick one from each category
  for (const action of shuffled) {
    if (selected.length >= count) break;
    if (!usedCategories.has(action.category)) {
      selected.push(action);
      usedCategories.add(action.category);
    }
  }
  
  // Second pass: fill remaining slots
  for (const action of shuffled) {
    if (selected.length >= count) break;
    if (!selected.includes(action)) {
      selected.push(action);
    }
  }
  
  return selected;
}

/**
 * Generate daily actions based on user profile, archetype, and burnout score
 * Creates 3-5 personalized micro-actions
 * 
 * @param userId - The user's odId
 * @param archetype - The user's archetype from assessment
 * @param burnoutScore - Current burnout score result
 * @param assessment - Optional full assessment data
 * @returns Array of created action items
 */
export async function generateDailyActions(
  userId: string,
  archetype: ArchetypeName,
  burnoutScore: BurnoutScoreResult | null,
  assessment: Assessment | null = null
): Promise<ActionItem[]> {
  const today = getTodayDateString();
  const seed = `${userId}-${today}`;
  
  // Collect candidate actions based on needs
  const candidateActions: ActionTemplate[] = [];
  
  // 1. Add archetype-specific actions (high priority)
  const archetypeActions = ARCHETYPE_ACTIONS[archetype] || [];
  candidateActions.push(...archetypeActions);
  
  // 2. Add dimension-specific actions based on high-risk areas
  const highRiskDimensions = getHighRiskDimensions(assessment);
  const burnoutDimensions = getDimensionsFromBurnout(burnoutScore);
  const allRiskDimensions = [...new Set([...highRiskDimensions, ...burnoutDimensions])];
  
  for (const dimension of allRiskDimensions) {
    const dimensionActions = DIMENSION_ACTIONS[dimension] || [];
    candidateActions.push(...dimensionActions);
  }
  
  // 3. Add general wellness actions to fill gaps
  candidateActions.push(...GENERAL_WELLNESS_ACTIONS);
  
  // Determine action count based on burnout risk
  let actionCount = MIN_DAILY_ACTIONS;
  if (burnoutScore) {
    if (burnoutScore.riskLevel === 'high' || burnoutScore.riskLevel === 'critical') {
      actionCount = MAX_DAILY_ACTIONS; // More support when struggling
    } else if (burnoutScore.riskLevel === 'caution') {
      actionCount = 4;
    }
  }
  
  // Select diverse actions
  const selectedActions = selectDiverseActions(candidateActions, actionCount, seed);
  
  // Create action items in database
  const createdActions: ActionItem[] = [];
  
  for (const template of selectedActions) {
    const newAction: NewActionItem = {
      userId,
      actionText: template.text,
      category: template.category,
      targetDimension: template.targetDimension,
      assignedDate: today,
      isCompleted: false,
    };
    
    try {
      const created = await db
        .insert(actionItems)
        .values(newAction)
        .returning();
      
      createdActions.push(created[0]);
    } catch (error) {
      console.error('Error creating action item:', error);
      // Continue with other actions even if one fails
    }
  }
  
  return createdActions;
}

/**
 * Mark an action as completed
 * 
 * @param actionId - The action item's UUID
 * @param userId - The user's odId (for ownership verification)
 * @returns The updated action item or null if not found
 */
export async function markActionComplete(
  actionId: string,
  userId: string
): Promise<ActionItem | null> {
  if (!actionId || !userId) {
    throw new Error('actionId and userId are required');
  }
  
  try {
    const updated = await db
      .update(actionItems)
      .set({
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(actionItems.id, actionId),
          eq(actionItems.userId, userId)
        )
      )
      .returning();
    
    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error('Database error in markActionComplete:', error);
    throw new Error('Failed to mark action as complete');
  }
}

/**
 * Get today's actions for a user
 * 
 * @param userId - The user's odId
 * @returns Array of today's action items
 */
export async function getTodaysActions(userId: string): Promise<ActionItem[]> {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  const today = getTodayDateString();
  
  try {
    const actions = await db
      .select()
      .from(actionItems)
      .where(
        and(
          eq(actionItems.userId, userId),
          eq(actionItems.assignedDate, today)
        )
      )
      .orderBy(actionItems.createdAt);
    
    return actions;
  } catch (error) {
    console.error('Database error in getTodaysActions:', error);
    throw new Error('Failed to get today\'s actions');
  }
}

/**
 * Calculate completion statistics for a user
 * 
 * @param userId - The user's odId
 * @param days - Number of days to calculate stats for (default: 7)
 * @returns Completion statistics
 */
export async function getCompletionStats(
  userId: string,
  days: number = 7
): Promise<CompletionStats> {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  // Calculate start date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateString = startDate.toISOString().split('T')[0];
  
  try {
    // Get all actions in the period
    const actions = await db
      .select()
      .from(actionItems)
      .where(
        and(
          eq(actionItems.userId, userId),
          sql`${actionItems.assignedDate} >= ${startDateString}`
        )
      )
      .orderBy(desc(actionItems.assignedDate));
    
    const totalActions = actions.length;
    const completedActions = actions.filter(a => a.isCompleted).length;
    const completionRate = totalActions > 0 
      ? Math.round((completedActions / totalActions) * 100) 
      : 0;
    
    // Calculate streak (consecutive days with at least one completion)
    const streakDays = calculateStreak(actions);
    
    return {
      totalActions,
      completedActions,
      completionRate,
      streakDays,
    };
  } catch (error) {
    console.error('Database error in getCompletionStats:', error);
    throw new Error('Failed to get completion stats');
  }
}

/**
 * Calculate streak of consecutive days with completions
 */
function calculateStreak(actions: ActionItem[]): number {
  if (actions.length === 0) return 0;
  
  // Group actions by date
  const actionsByDate = new Map<string, ActionItem[]>();
  for (const action of actions) {
    const date = action.assignedDate;
    if (!actionsByDate.has(date)) {
      actionsByDate.set(date, []);
    }
    actionsByDate.get(date)!.push(action);
  }
  
  // Check consecutive days starting from today
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) { // Max 1 year lookback
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    const dayActions = actionsByDate.get(dateString);
    if (!dayActions) {
      // No actions on this day - streak broken (unless it's today and no actions yet)
      if (i === 0) continue; // Skip today if no actions yet
      break;
    }
    
    const hasCompletion = dayActions.some(a => a.isCompleted);
    if (hasCompletion) {
      streak++;
    } else if (i > 0) {
      // No completions and not today - streak broken
      break;
    }
  }
  
  return streak;
}

/**
 * Check if user already has actions for today
 * 
 * @param userId - The user's odId
 * @returns True if actions exist for today
 */
export async function hasActionsForToday(userId: string): Promise<boolean> {
  const actions = await getTodaysActions(userId);
  return actions.length > 0;
}

/**
 * Delete all actions for a specific date (for regeneration)
 * 
 * @param userId - The user's odId
 * @param date - The date to clear actions for
 * @returns Number of deleted actions
 */
export async function clearActionsForDate(
  userId: string,
  date: string
): Promise<number> {
  if (!userId || !date) {
    throw new Error('userId and date are required');
  }
  
  try {
    const deleted = await db
      .delete(actionItems)
      .where(
        and(
          eq(actionItems.userId, userId),
          eq(actionItems.assignedDate, date)
        )
      )
      .returning();
    
    return deleted.length;
  } catch (error) {
    console.error('Database error in clearActionsForDate:', error);
    throw new Error('Failed to clear actions');
  }
}
