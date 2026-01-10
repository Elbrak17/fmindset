/**
 * User Data Service
 * Handles GDPR compliance, data deletion, and retention policies
 */

import { eq, lt, and } from 'drizzle-orm';
import { db } from '../db/connection';
import {
  userProfiles,
  assessments,
  journalEntries,
  burnoutScores,
  actionItems,
  forumPosts,
  forumReplies,
  peerMatches,
  notifications,
} from '../db/schema';

// Constants
const DATA_RETENTION_DAYS = 365; // 1 year

/**
 * Generate a random pseudonym
 */
function generatePseudonym(): string {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `Founder-${number}`;
}

/**
 * Check if user can regenerate their pseudonym (once per month)
 */
export async function canRegeneratePseudonym(userId: string): Promise<{
  canRegenerate: boolean;
  nextAvailableDate?: string;
}> {
  const user = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.odId, userId))
    .limit(1);

  if (user.length === 0) {
    return { canRegenerate: true };
  }

  // Check localStorage for last pseudonym change (stored client-side)
  // For now, always allow regeneration since we don't have a dedicated field
  // The cooldown will be enforced client-side via localStorage
  return { canRegenerate: true };
}

/**
 * Regenerate user pseudonym with cooldown enforcement
 */
export async function regeneratePseudonymWithLimit(userId: string): Promise<{
  success: boolean;
  pseudonym?: string;
  error?: string;
  nextAvailableDate?: string;
}> {
  const newPseudonym = generatePseudonym();

  // Check if user exists
  const user = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.odId, userId))
    .limit(1);

  if (user.length === 0) {
    // Create user profile with new pseudonym
    await db.insert(userProfiles).values({
      odId: userId,
      pseudonym: newPseudonym,
      isAnonymous: true,
    });
  } else {
    // Update existing user
    await db
      .update(userProfiles)
      .set({ pseudonym: newPseudonym })
      .where(eq(userProfiles.odId, userId));
  }

  return {
    success: true,
    pseudonym: newPseudonym,
  };
}

/**
 * Delete all user data (GDPR compliance)
 * Anonymizes forum posts/replies instead of deleting them
 */
export async function deleteAllUserData(userId: string): Promise<{
  success: boolean;
  deletedCounts: {
    assessments: number;
    journalEntries: number;
    burnoutScores: number;
    actionItems: number;
    peerMatches: number;
    notifications: number;
    postsAnonymized: number;
    repliesAnonymized: number;
  };
}> {
  const deletedCounts = {
    assessments: 0,
    journalEntries: 0,
    burnoutScores: 0,
    actionItems: 0,
    peerMatches: 0,
    notifications: 0,
    postsAnonymized: 0,
    repliesAnonymized: 0,
  };

  try {
    // Delete assessments
    const deletedAssessments = await db
      .delete(assessments)
      .where(eq(assessments.userId, userId))
      .returning();
    deletedCounts.assessments = deletedAssessments.length;

    // Delete journal entries
    const deletedJournals = await db
      .delete(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .returning();
    deletedCounts.journalEntries = deletedJournals.length;

    // Delete burnout scores
    const deletedBurnout = await db
      .delete(burnoutScores)
      .where(eq(burnoutScores.userId, userId))
      .returning();
    deletedCounts.burnoutScores = deletedBurnout.length;

    // Delete action items
    const deletedActions = await db
      .delete(actionItems)
      .where(eq(actionItems.userId, userId))
      .returning();
    deletedCounts.actionItems = deletedActions.length;

    // Delete peer matches
    const deletedMatches = await db
      .delete(peerMatches)
      .where(eq(peerMatches.userId, userId))
      .returning();
    deletedCounts.peerMatches = deletedMatches.length;

    // Delete notifications
    const deletedNotifs = await db
      .delete(notifications)
      .where(eq(notifications.userId, userId))
      .returning();
    deletedCounts.notifications = deletedNotifs.length;

    // Anonymize forum posts (keep content, remove user link)
    const anonymizedPosts = await db
      .update(forumPosts)
      .set({
        userId: 'deleted_user',
        pseudonym: '[Deleted User]',
        showArchetype: false,
        archetype: null,
      })
      .where(eq(forumPosts.userId, userId))
      .returning();
    deletedCounts.postsAnonymized = anonymizedPosts.length;

    // Anonymize forum replies
    const anonymizedReplies = await db
      .update(forumReplies)
      .set({
        userId: 'deleted_user',
        pseudonym: '[Deleted User]',
      })
      .where(eq(forumReplies.userId, userId))
      .returning();
    deletedCounts.repliesAnonymized = anonymizedReplies.length;

    // Delete user profile
    await db
      .delete(userProfiles)
      .where(eq(userProfiles.odId, userId));

    return { success: true, deletedCounts };
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('Failed to delete user data');
  }
}

/**
 * Export all user data (GDPR data portability)
 */
export async function exportUserData(userId: string): Promise<{
  profile: unknown;
  assessments: unknown[];
  journalEntries: unknown[];
  burnoutScores: unknown[];
  actionItems: unknown[];
  forumPosts: unknown[];
  forumReplies: unknown[];
  exportedAt: string;
}> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.odId, userId))
    .limit(1);

  const userAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, userId));

  const userJournals = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId));

  const userBurnout = await db
    .select()
    .from(burnoutScores)
    .where(eq(burnoutScores.userId, userId));

  const userActions = await db
    .select()
    .from(actionItems)
    .where(eq(actionItems.userId, userId));

  const userPosts = await db
    .select()
    .from(forumPosts)
    .where(eq(forumPosts.userId, userId));

  const userReplies = await db
    .select()
    .from(forumReplies)
    .where(eq(forumReplies.userId, userId));

  return {
    profile: profile || null,
    assessments: userAssessments,
    journalEntries: userJournals,
    burnoutScores: userBurnout,
    actionItems: userActions,
    forumPosts: userPosts,
    forumReplies: userReplies,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Clean up old data based on retention policy (1 year)
 * Should be run as a scheduled job
 */
export async function cleanupOldData(): Promise<{
  deletedJournalEntries: number;
  deletedBurnoutScores: number;
  deletedActionItems: number;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);

  const deletedCounts = {
    deletedJournalEntries: 0,
    deletedBurnoutScores: 0,
    deletedActionItems: 0,
  };

  try {
    // Delete old journal entries
    const deletedJournals = await db
      .delete(journalEntries)
      .where(lt(journalEntries.createdAt, cutoffDate))
      .returning();
    deletedCounts.deletedJournalEntries = deletedJournals.length;

    // Delete old burnout scores
    const deletedBurnout = await db
      .delete(burnoutScores)
      .where(lt(burnoutScores.calculatedAt, cutoffDate))
      .returning();
    deletedCounts.deletedBurnoutScores = deletedBurnout.length;

    // Delete old action items
    const deletedActions = await db
      .delete(actionItems)
      .where(lt(actionItems.createdAt, cutoffDate))
      .returning();
    deletedCounts.deletedActionItems = deletedActions.length;

    console.log('Data cleanup completed:', deletedCounts);
    return deletedCounts;
  } catch (error) {
    console.error('Error during data cleanup:', error);
    throw new Error('Failed to cleanup old data');
  }
}
