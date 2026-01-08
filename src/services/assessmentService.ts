import { AnswerValue, MotivationType, PsychologicalScores, ArchetypeResult, ArchetypeName } from '../types/assessment';
import { ANSWER_POINTS } from '../utils/constants';
import { ARCHETYPES } from '../utils/archetypes';

/**
 * Validates that the answers array contains exactly 25 valid answers (A, B, C, or D)
 * @throws Error if validation fails
 */
function validateAnswers(answers: string[]): asserts answers is AnswerValue[] {
  if (!Array.isArray(answers)) {
    throw new Error('Answers must be an array');
  }
  if (answers.length !== 25) {
    throw new Error('Exactly 25 answers required');
  }
  const validAnswers: AnswerValue[] = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < answers.length; i++) {
    if (!validAnswers.includes(answers[i] as AnswerValue)) {
      throw new Error(`Invalid answer at position ${i + 1}: must be A, B, C, or D`);
    }
  }
}

/**
 * Calculate average score for a range of questions (0-indexed)
 * @param answers - Array of validated answers
 * @param startIndex - Start index (inclusive, 0-indexed)
 * @param endIndex - End index (inclusive, 0-indexed)
 * @returns Average score rounded to nearest integer (0-100)
 */
function calculateDimensionScore(answers: AnswerValue[], startIndex: number, endIndex: number): number {
  const relevantAnswers = answers.slice(startIndex, endIndex + 1);
  const sum = relevantAnswers.reduce((acc, answer) => acc + ANSWER_POINTS[answer], 0);
  return Math.round(sum / relevantAnswers.length);
}

/**
 * Determine motivation type from Q22-24 comparison
 * Q22 (index 21) = passion/intrinsic
 * Q23 (index 22) = financial/extrinsic
 * Q24 (index 23) = recognition/extrinsic
 * 
 * If passion > avg(financial, recognition) → intrinsic
 * If avg(financial, recognition) > passion → extrinsic
 * Otherwise → mixed
 */
function determineMotivationType(answers: AnswerValue[]): MotivationType {
  const passion = ANSWER_POINTS[answers[21]];      // Q22
  const financial = ANSWER_POINTS[answers[22]];    // Q23
  const recognition = ANSWER_POINTS[answers[23]];  // Q24
  
  const extrinsicAvg = (financial + recognition) / 2;
  
  if (passion > extrinsicAvg) return 'intrinsic';
  if (extrinsicAvg > passion) return 'extrinsic';
  return 'mixed';
}

/**
 * Calculate psychological scores from 25 quiz answers
 * 
 * Dimension mapping:
 * - Imposter Syndrome: Q1-5 (indices 0-4)
 * - Founder Doubt: Q6-9 (indices 5-8)
 * - Identity Fusion: Q10-13 (indices 9-12)
 * - Fear of Rejection: Q14-18 (indices 13-17)
 * - Risk Tolerance: Q19-21 (indices 18-20)
 * - Motivation Type: Q22-24 (indices 21-23) - comparison based
 * - Isolation Level: Q25 (index 24) - single question
 * 
 * @param answers - Array of 25 answers, each A/B/C/D
 * @returns PsychologicalScores object with all 7 dimensions
 * @throws Error if validation fails
 */
export function calculateScores(answers: string[]): PsychologicalScores {
  // Validate input
  validateAnswers(answers);
  
  // Calculate each dimension
  const scores: PsychologicalScores = {
    imposterSyndrome: calculateDimensionScore(answers, 0, 4),    // Q1-5
    founderDoubt: calculateDimensionScore(answers, 5, 8),        // Q6-9
    identityFusion: calculateDimensionScore(answers, 9, 12),     // Q10-13
    fearOfRejection: calculateDimensionScore(answers, 13, 17),   // Q14-18
    riskTolerance: calculateDimensionScore(answers, 18, 20),     // Q19-21
    motivationType: determineMotivationType(answers),
    isolationLevel: ANSWER_POINTS[answers[24]],                  // Q25
  };
  
  return scores;
}

/**
 * Determine archetype based on psychological scores
 * 
 * Priority order:
 * 1. Burning Out - 3+ dimensions > 70 (urgent)
 * 2. Perfectionist Builder - imposterSyndrome > 60 AND founderDoubt > 60 AND riskTolerance < 50
 * 3. Opportunistic Visionary - riskTolerance > 70 AND founderDoubt < 40 AND imposterSyndrome < 40
 * 4. Isolated Dreamer - isolationLevel > 70 AND (identityFusion > 50 OR founderDoubt > 50)
 * 5. Self-Assured Hustler - imposterSyndrome < 40 AND founderDoubt < 40 AND riskTolerance > 60
 * 6. Community-Driven - isolationLevel < 40 AND (imposterSyndrome < 50 OR founderDoubt < 50)
 * 7. Balanced Founder - all numeric scores between 40-60
 * 8. Growth Seeker - default (includes encouragement message)
 * 
 * @param scores - PsychologicalScores object with all 7 dimensions
 * @returns ArchetypeResult with name, description, traits, strength, challenge, recommendation
 */
export function determineArchetype(scores: PsychologicalScores): ArchetypeResult {
  // Count dimensions > 70 for burnout check
  // Only check the 5 "negative" dimensions (not riskTolerance which is positive)
  const highDimensions = [
    scores.imposterSyndrome,
    scores.founderDoubt,
    scores.identityFusion,
    scores.fearOfRejection,
    scores.isolationLevel,
  ].filter(score => score > 70).length;

  // 1. Check Burning Out first (highest priority - urgent)
  if (highDimensions >= 3) {
    return ARCHETYPES['Burning Out'];
  }

  // 2. Perfectionist Builder
  if (scores.imposterSyndrome > 60 && scores.founderDoubt > 60 && scores.riskTolerance < 50) {
    return ARCHETYPES['Perfectionist Builder'];
  }

  // 3. Opportunistic Visionary
  if (scores.riskTolerance > 70 && scores.founderDoubt < 40 && scores.imposterSyndrome < 40) {
    return ARCHETYPES['Opportunistic Visionary'];
  }

  // 4. Isolated Dreamer
  if (scores.isolationLevel > 70 && (scores.identityFusion > 50 || scores.founderDoubt > 50)) {
    return ARCHETYPES['Isolated Dreamer'];
  }

  // 5. Self-Assured Hustler
  if (scores.imposterSyndrome < 40 && scores.founderDoubt < 40 && scores.riskTolerance > 60) {
    return ARCHETYPES['Self-Assured Hustler'];
  }

  // 6. Community-Driven
  if (scores.isolationLevel < 40 && (scores.imposterSyndrome < 50 || scores.founderDoubt < 50)) {
    return ARCHETYPES['Community-Driven'];
  }

  // 7. Balanced Founder - all numeric scores between 40-60
  const numericScores = [
    scores.imposterSyndrome,
    scores.founderDoubt,
    scores.identityFusion,
    scores.fearOfRejection,
    scores.riskTolerance,
    scores.isolationLevel,
  ];
  if (numericScores.every(s => s >= 40 && s <= 60)) {
    return ARCHETYPES['Balanced Founder'];
  }

  // 8. Default to Growth Seeker (includes encouragement)
  return ARCHETYPES['Growth Seeker'];
}

/**
 * Generate personalized recommendations based on psychological scores and archetype
 * 
 * Recommendations are generated for dimensions scoring > 70 (high-risk areas)
 * The archetype-specific recommendation is always included
 * Returns maximum 2-3 recommendations to avoid overwhelming the user
 * 
 * @param scores - PsychologicalScores object with all 7 dimensions
 * @param archetype - The determined archetype name
 * @returns Array of 2-3 recommendation strings
 */
export function getRecommendations(scores: PsychologicalScores, archetype: ArchetypeName): string[] {
  const recommendations: string[] = [];

  // Add dimension-specific recommendations for high-scoring areas (> 70)
  if (scores.imposterSyndrome > 70) {
    recommendations.push('Document your wins daily - imposter syndrome fades when you see evidence of your competence.');
  }
  if (scores.founderDoubt > 70) {
    recommendations.push('Find a mentor who has been through the founder journey - their perspective will help ground your doubts.');
  }
  if (scores.isolationLevel > 70) {
    recommendations.push('Join a founder community this week - isolation amplifies every other challenge.');
  }
  if (scores.identityFusion > 70) {
    recommendations.push('Schedule non-startup activities weekly - your identity needs to be broader than your company.');
  }
  if (scores.fearOfRejection > 70) {
    recommendations.push('Reframe rejection as data - every "no" teaches you something about your market.');
  }

  // Always include archetype-specific recommendation
  recommendations.push(ARCHETYPES[archetype].recommendation);

  // Return max 3 recommendations (prioritizing dimension-specific ones first)
  return recommendations.slice(0, 3);
}
