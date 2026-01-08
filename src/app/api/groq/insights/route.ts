import { NextResponse } from 'next/server';
import { getInsights } from '../../../../services/groqService';
import { PsychologicalScores, ArchetypeName, GroqInsightsResponse } from '../../../../types/assessment';

// Required fields for scores validation
const REQUIRED_SCORE_FIELDS = [
  'imposterSyndrome',
  'founderDoubt',
  'identityFusion',
  'fearOfRejection',
  'riskTolerance',
  'motivationType',
  'isolationLevel',
] as const;

// Valid archetype names for validation
const VALID_ARCHETYPES: ArchetypeName[] = [
  'Perfectionist Builder',
  'Opportunistic Visionary',
  'Isolated Dreamer',
  'Burning Out',
  'Self-Assured Hustler',
  'Community-Driven',
  'Balanced Founder',
  'Growth Seeker',
];

// Fallback text when Groq fails
const FALLBACK_TEXT = "We're generating personalized insights for you. Check back in a moment.";

/**
 * Validates that the scores object contains all 7 required dimensions
 */
function validateScores(scores: unknown): scores is PsychologicalScores {
  if (!scores || typeof scores !== 'object') {
    return false;
  }

  const scoresObj = scores as Record<string, unknown>;

  // Check all required fields exist
  for (const field of REQUIRED_SCORE_FIELDS) {
    if (!(field in scoresObj)) {
      return false;
    }
  }

  // Validate numeric fields are numbers in range 0-100
  const numericFields = [
    'imposterSyndrome',
    'founderDoubt',
    'identityFusion',
    'fearOfRejection',
    'riskTolerance',
    'isolationLevel',
  ];

  for (const field of numericFields) {
    const value = scoresObj[field];
    if (typeof value !== 'number' || value < 0 || value > 100) {
      return false;
    }
  }

  // Validate motivationType is valid
  const validMotivationTypes = ['intrinsic', 'extrinsic', 'mixed'];
  if (!validMotivationTypes.includes(scoresObj.motivationType as string)) {
    return false;
  }

  return true;
}

/**
 * Validates that the archetype is a valid archetype name
 */
function validateArchetype(archetype: unknown): archetype is ArchetypeName {
  return typeof archetype === 'string' && VALID_ARCHETYPES.includes(archetype as ArchetypeName);
}

/**
 * POST /api/groq/insights
 * 
 * Generates AI-powered psychological insights using Groq API.
 * Never throws errors to client - always returns fallback on failure.
 * 
 * Request body:
 * - scores: PsychologicalScores - Object with all 7 dimensions
 * - archetype: ArchetypeName - The determined archetype
 * 
 * Response:
 * - 200: { insights: string } - Always returns 200, with fallback on error
 * - 400: { error: string } - Invalid input (only for validation errors)
 * 
 * Requirements: 6.1, 6.2, 7.3
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { scores, archetype } = body;

    // Validate scores object has all 7 dimensions (Requirement 6.2)
    if (!validateScores(scores)) {
      return NextResponse.json(
        { error: 'Invalid scores object' },
        { status: 400 }
      );
    }

    // Validate archetype
    if (!validateArchetype(archetype)) {
      return NextResponse.json(
        { error: 'Invalid archetype' },
        { status: 400 }
      );
    }

    // Get insights from Groq (handles errors internally, returns fallback)
    const insights = await getInsights(scores, archetype);

    const response: GroqInsightsResponse = { insights };
    return NextResponse.json(response);
  } catch (error) {
    // Log error to console (Requirement 7.3 - never throw to client)
    console.error('Groq insights error:', error);

    // Return fallback instead of error (Requirement 7.3)
    const response: GroqInsightsResponse = { insights: FALLBACK_TEXT };
    return NextResponse.json(response);
  }
}
