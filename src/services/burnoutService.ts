import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { 
  type JournalEntry, 
  type Assessment, 
  type BurnoutScore,
  type NewBurnoutScore,
  burnoutScores 
} from '../db/schema';
import { type TrendData } from './journalService';

/**
 * Burnout service for calculating burnout risk scores
 */

// Risk level type
export type RiskLevel = 'low' | 'caution' | 'high' | 'critical';

// Burnout score result
export interface BurnoutScoreResult {
  score: number;
  riskLevel: RiskLevel;
  contributingFactors: string[];
}

// Assessment scores interface (extracted from Assessment table)
export interface AssessmentScores {
  imposterSyndrome: number;
  founderDoubt: number;
  identityFusion: number;
  fearOfRejection: number;
  riskTolerance: number;
  isolationLevel: number;
}

// Risk level thresholds
const RISK_THRESHOLDS = {
  low: { min: 0, max: 40 },
  caution: { min: 41, max: 60 },
  high: { min: 61, max: 80 },
  critical: { min: 81, max: 100 },
} as const;

// Assessment dimension threshold for contributing factors
const HIGH_DIMENSION_THRESHOLD = 70;

// Trend modifier value
const DECLINING_TREND_MODIFIER = 5;

// Assessment dimension modifiers
const ASSESSMENT_MODIFIER = 10;

/**
 * Calculate base burnout score from journal entry
 * Formula: (100 - mood) * 0.3 + (100 - energy) * 0.3 + stress * 0.4
 * 
 * @param journalEntry - The journal entry with mood, energy, stress values
 * @returns Base burnout score (0-100)
 */
function calculateBaseScore(journalEntry: JournalEntry): number {
  const moodContribution = (100 - journalEntry.mood) * 0.3;
  const energyContribution = (100 - journalEntry.energy) * 0.3;
  const stressContribution = journalEntry.stress * 0.4;
  
  return moodContribution + energyContribution + stressContribution;
}

/**
 * Extract psychological scores from assessment record
 * 
 * @param assessment - The assessment record from database
 * @returns AssessmentScores object
 */
function extractAssessmentScores(assessment: Assessment): AssessmentScores {
  return {
    imposterSyndrome: assessment.imposterSyndrome,
    founderDoubt: assessment.founderDoubt,
    identityFusion: assessment.identityFusion,
    fearOfRejection: assessment.fearOfRejection,
    riskTolerance: assessment.riskTolerance,
    isolationLevel: assessment.isolationLevel,
  };
}

/**
 * Calculate assessment modifiers based on high-risk dimensions
 * Adds +10 for each dimension exceeding the threshold
 * 
 * @param scores - Assessment psychological scores
 * @returns Total modifier value
 */
function calculateAssessmentModifiers(scores: AssessmentScores): number {
  let modifier = 0;
  
  // Check each "negative" dimension (higher = worse)
  // Note: riskTolerance is excluded as it's not a negative indicator
  if (scores.imposterSyndrome > HIGH_DIMENSION_THRESHOLD) {
    modifier += ASSESSMENT_MODIFIER;
  }
  if (scores.founderDoubt > HIGH_DIMENSION_THRESHOLD) {
    modifier += ASSESSMENT_MODIFIER;
  }
  if (scores.identityFusion > HIGH_DIMENSION_THRESHOLD) {
    modifier += ASSESSMENT_MODIFIER;
  }
  if (scores.fearOfRejection > HIGH_DIMENSION_THRESHOLD) {
    modifier += ASSESSMENT_MODIFIER;
  }
  if (scores.isolationLevel > HIGH_DIMENSION_THRESHOLD) {
    modifier += ASSESSMENT_MODIFIER;
  }
  
  return modifier;
}

/**
 * Calculate trend modifier based on recent trends
 * Adds +5 if any key metric is declining
 * 
 * @param trends - Trend data from journal entries
 * @returns Trend modifier value
 */
function calculateTrendModifier(trends?: TrendData): number {
  if (!trends) {
    return 0;
  }
  
  // Check if mood or energy is declining, or stress is increasing (declining for stress means improving)
  const hasDecliningTrend = 
    trends.moodTrend === 'declining' || 
    trends.energyTrend === 'declining' || 
    trends.stressTrend === 'declining'; // For stress, 'declining' means stress is going up (bad)
  
  return hasDecliningTrend ? DECLINING_TREND_MODIFIER : 0;
}

/**
 * Get risk level from burnout score
 * 
 * @param score - Burnout score (0-100)
 * @returns Risk level classification
 */
export function getRiskLevel(score: number): RiskLevel {
  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(100, score));
  
  if (clampedScore <= RISK_THRESHOLDS.low.max) {
    return 'low';
  }
  if (clampedScore <= RISK_THRESHOLDS.caution.max) {
    return 'caution';
  }
  if (clampedScore <= RISK_THRESHOLDS.high.max) {
    return 'high';
  }
  return 'critical';
}

/**
 * Get contributing factors from journal entry and assessment
 * Identifies which dimensions are contributing to burnout risk
 * 
 * @param journalEntry - The journal entry
 * @param assessment - Optional assessment data
 * @returns Array of contributing factor descriptions
 */
export function getContributingFactors(
  journalEntry: JournalEntry,
  assessment?: Assessment | null
): string[] {
  const factors: string[] = [];
  
  // Journal-based factors
  if (journalEntry.mood < 40) {
    factors.push('Low mood levels');
  }
  if (journalEntry.energy < 40) {
    factors.push('Low energy levels');
  }
  if (journalEntry.stress > 70) {
    factors.push('High stress levels');
  }
  
  // Assessment-based factors
  if (assessment) {
    const scores = extractAssessmentScores(assessment);
    
    if (scores.imposterSyndrome > HIGH_DIMENSION_THRESHOLD) {
      factors.push('High imposter syndrome');
    }
    if (scores.founderDoubt > HIGH_DIMENSION_THRESHOLD) {
      factors.push('High founder doubt');
    }
    if (scores.identityFusion > HIGH_DIMENSION_THRESHOLD) {
      factors.push('High identity fusion with startup');
    }
    if (scores.fearOfRejection > HIGH_DIMENSION_THRESHOLD) {
      factors.push('High fear of rejection');
    }
    if (scores.isolationLevel > HIGH_DIMENSION_THRESHOLD) {
      factors.push('High isolation level');
    }
  }
  
  return factors;
}

/**
 * Calculate burnout score from journal entry and optional assessment data
 * 
 * Formula:
 * - Base score from journal: (100 - mood) * 0.3 + (100 - energy) * 0.3 + stress * 0.4
 * - Assessment modifiers: +10 for each dimension > 70
 * - Trend modifier: +5 if declining trends detected
 * 
 * @param journalEntry - The journal entry with mood, energy, stress values
 * @param assessment - Optional assessment data for additional modifiers
 * @param trends - Optional trend data for trend-based modifiers
 * @returns BurnoutScoreResult with score, risk level, and contributing factors
 */
export function calculateBurnoutScore(
  journalEntry: JournalEntry,
  assessment?: Assessment | null,
  trends?: TrendData
): BurnoutScoreResult {
  // Calculate base score from journal entry
  let score = calculateBaseScore(journalEntry);
  
  // Add assessment modifiers if available
  if (assessment) {
    const assessmentScores = extractAssessmentScores(assessment);
    score += calculateAssessmentModifiers(assessmentScores);
  }
  
  // Add trend modifier if available
  score += calculateTrendModifier(trends);
  
  // Clamp final score to 0-100 range
  score = Math.round(Math.max(0, Math.min(100, score)));
  
  // Determine risk level
  const riskLevel = getRiskLevel(score);
  
  // Get contributing factors
  const contributingFactors = getContributingFactors(journalEntry, assessment);
  
  return {
    score,
    riskLevel,
    contributingFactors,
  };
}

/**
 * Save burnout score to database
 * 
 * @param userId - The user's odId
 * @param scoreResult - The calculated burnout score result
 * @param journalEntryId - Optional journal entry ID that triggered this calculation
 * @returns The saved burnout score record
 */
export async function saveBurnoutScore(
  userId: string,
  scoreResult: BurnoutScoreResult,
  journalEntryId?: string
): Promise<BurnoutScore> {
  try {
    const newBurnoutScore: NewBurnoutScore = {
      userId,
      journalEntryId: journalEntryId || null,
      score: scoreResult.score,
      riskLevel: scoreResult.riskLevel,
      contributingFactors: scoreResult.contributingFactors,
    };

    const createdScores = await db
      .insert(burnoutScores)
      .values(newBurnoutScore)
      .returning();

    return createdScores[0];
  } catch (error) {
    console.error('Database error in saveBurnoutScore:', error);
    throw new Error('Failed to save burnout score');
  }
}

/**
 * Get the latest burnout score for a user
 * 
 * @param userId - The user's odId
 * @returns The most recent burnout score or null if none exists
 */
export async function getLatestScore(userId: string): Promise<BurnoutScore | null> {
  try {
    const results = await db
      .select()
      .from(burnoutScores)
      .where(eq(burnoutScores.userId, userId))
      .orderBy(desc(burnoutScores.calculatedAt))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database error in getLatestScore:', error);
    throw new Error('Failed to get latest burnout score');
  }
}
