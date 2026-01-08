import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { assessments, userProfiles, type Assessment, type NewAssessment, type UserProfile, type NewUserProfile } from '../db/schema';
import type { AnswerValue, PsychologicalScores, ArchetypeName } from '../types/assessment';

/**
 * Database service for PostgreSQL operations using Drizzle ORM
 */

/**
 * Create or get user profile by odId
 */
export async function createOrGetUserProfile(odId: string): Promise<UserProfile> {
  try {
    // Try to find existing user
    const existingUser = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.odId, odId))
      .limit(1);

    if (existingUser.length > 0) {
      return existingUser[0];
    }

    // Create new user if not found
    const newUser: NewUserProfile = {
      odId,
      isAnonymous: true,
      pseudonym: null,
      passwordHash: null,
    };

    const createdUsers = await db
      .insert(userProfiles)
      .values(newUser)
      .returning();

    return createdUsers[0];
  } catch (error) {
    console.error('Database error in createOrGetUserProfile:', error);
    throw new Error('Failed to create or get user profile');
  }
}

/**
 * Save assessment results to database
 */
export async function saveAssessment(
  userId: string,
  answers: AnswerValue[],
  scores: PsychologicalScores,
  archetype: ArchetypeName,
  groqInsights: string | null = null
): Promise<Assessment> {
  try {
    // Ensure user exists
    await createOrGetUserProfile(userId);

    const newAssessment: NewAssessment = {
      userId,
      answers: answers as any, // JSON field
      imposterSyndrome: scores.imposterSyndrome,
      founderDoubt: scores.founderDoubt,
      identityFusion: scores.identityFusion,
      fearOfRejection: scores.fearOfRejection,
      riskTolerance: scores.riskTolerance,
      motivationType: scores.motivationType,
      isolationLevel: scores.isolationLevel,
      archetype,
      groqInsights,
    };

    const createdAssessments = await db
      .insert(assessments)
      .values(newAssessment)
      .returning();

    return createdAssessments[0];
  } catch (error) {
    console.error('Database error in saveAssessment:', error);
    throw new Error('Failed to save assessment');
  }
}

/**
 * Get user's latest assessment
 */
export async function getLatestAssessment(userId: string): Promise<Assessment | null> {
  try {
    const results = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(assessments.createdAt)
      .limit(1);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database error in getLatestAssessment:', error);
    throw new Error('Failed to get latest assessment');
  }
}

/**
 * Get all assessments for a user
 */
export async function getUserAssessments(userId: string): Promise<Assessment[]> {
  try {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(assessments.createdAt);
  } catch (error) {
    console.error('Database error in getUserAssessments:', error);
    throw new Error('Failed to get user assessments');
  }
}

/**
 * Update assessment with Groq insights
 */
export async function updateAssessmentInsights(
  assessmentId: string,
  insights: string
): Promise<Assessment | null> {
  try {
    const updatedAssessments = await db
      .update(assessments)
      .set({ 
        groqInsights: insights,
        updatedAt: new Date()
      })
      .where(eq(assessments.id, assessmentId))
      .returning();

    return updatedAssessments.length > 0 ? updatedAssessments[0] : null;
  } catch (error) {
    console.error('Database error in updateAssessmentInsights:', error);
    throw new Error('Failed to update assessment insights');
  }
}

/**
 * Convert Assessment to PsychologicalScores
 */
export function assessmentToScores(assessment: Assessment): PsychologicalScores {
  return {
    imposterSyndrome: assessment.imposterSyndrome,
    founderDoubt: assessment.founderDoubt,
    identityFusion: assessment.identityFusion,
    fearOfRejection: assessment.fearOfRejection,
    riskTolerance: assessment.riskTolerance,
    motivationType: assessment.motivationType,
    isolationLevel: assessment.isolationLevel,
  };
}