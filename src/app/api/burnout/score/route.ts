import { NextResponse } from 'next/server';
import { getLatestScore, type RiskLevel } from '../../../../services/burnoutService';
import { handleError, USER_ERROR_MESSAGES } from '../../../../utils/errorHandler';
import { 
  checkRateLimit, 
  createRateLimitHeaders, 
  getClientIdentifier,
  DEFAULT_RATE_LIMIT 
} from '../../../../utils/rateLimit';

/**
 * Crisis resources for critical risk levels
 */
const CRISIS_RESOURCES = {
  hotlines: [
    { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
  ],
  message: 'If you are in crisis or having thoughts of self-harm, please reach out to one of these resources immediately. You are not alone.',
};

/**
 * Recommendations based on risk level
 */
const RECOMMENDATIONS: Record<RiskLevel, string[]> = {
  low: [
    'Keep up your healthy habits and self-care routines',
    'Continue monitoring your mental state with regular check-ins',
    'Consider sharing your positive strategies with other founders',
  ],
  caution: [
    'Take short breaks throughout your workday',
    'Prioritize sleep and maintain a consistent sleep schedule',
    'Reach out to a trusted friend or mentor to talk',
    'Consider reducing your workload temporarily',
  ],
  high: [
    'Schedule time off as soon as possible',
    'Delegate tasks to reduce your immediate workload',
    'Speak with a mental health professional',
    'Limit work hours and set firm boundaries',
    'Practice stress-reduction techniques daily',
  ],
  critical: [
    'Seek professional mental health support immediately',
    'Take a break from work - your health comes first',
    'Reach out to your support network today',
    'Consider speaking with a therapist or counselor',
    'Do not make major decisions while in this state',
  ],
};

/**
 * GET /api/burnout/score
 * 
 * Returns the current burnout risk score for a user.
 * 
 * Query params:
 * - odId: string - User's unique identifier
 * 
 * Response:
 * - 200: { score, riskLevel, contributingFactors, recommendations, crisisResources? }
 * - 400: { error: string } - Missing or invalid odId
 * - 404: { error: string, message: string } - No burnout score exists
 * - 429: { error: string } - Rate limit exceeded
 * - 500: { error: string } - Server error
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');

    // Check rate limit (10 requests per minute)
    const clientId = getClientIdentifier(request, odId || undefined);
    const rateLimitResult = checkRateLimit(clientId, DEFAULT_RATE_LIMIT);
    
    if (!rateLimitResult.allowed) {
      const headers = createRateLimitHeaders(rateLimitResult, DEFAULT_RATE_LIMIT);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    // Validate odId is provided
    if (!odId || odId.trim() === '') {
      return NextResponse.json(
        { error: 'User ID (odId) is required' },
        { status: 400 }
      );
    }

    // Get the latest burnout score for the user
    const latestScore = await getLatestScore(odId);

    // Handle case where no burnout score exists
    if (!latestScore) {
      return NextResponse.json(
        { 
          error: 'No burnout score found',
          message: 'Complete a journal entry first to calculate your burnout risk score.',
        },
        { status: 404 }
      );
    }

    // Get recommendations based on risk level
    const riskLevel = latestScore.riskLevel as RiskLevel;
    const recommendations = RECOMMENDATIONS[riskLevel];

    // Build response
    const response: {
      score: number;
      riskLevel: string;
      contributingFactors: unknown;
      recommendations: string[];
      disclaimer: string;
      crisisResources?: typeof CRISIS_RESOURCES;
    } = {
      score: latestScore.score,
      riskLevel: latestScore.riskLevel,
      contributingFactors: latestScore.contributingFactors,
      recommendations,
      disclaimer: 'This is not a medical diagnosis. If you are struggling, please seek professional help.',
    };

    // Include crisis resources for high and critical risk levels
    if (riskLevel === 'high' || riskLevel === 'critical') {
      response.crisisResources = CRISIS_RESOURCES;
    }

    return NextResponse.json(response);
  } catch (error) {
    // Log full error and return generic message
    handleError('GET /api/burnout/score', error);
    
    return NextResponse.json(
      { error: USER_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
