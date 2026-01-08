import { NextResponse } from 'next/server';
import { 
  generateDailyActions, 
  hasActionsForToday, 
  clearActionsForDate,
  getTodaysActions,
  getCompletionStats
} from '../../../../services/actionPlanService';
import { getLatestAssessment } from '../../../../services/databaseService';
import { getLatestScore } from '../../../../services/burnoutService';
import { handleError, USER_ERROR_MESSAGES } from '../../../../utils/errorHandler';
import { 
  checkRateLimit, 
  createRateLimitHeaders, 
  getClientIdentifier,
  DEFAULT_RATE_LIMIT 
} from '../../../../utils/rateLimit';
import type { ArchetypeName } from '../../../../types/assessment';

/**
 * POST /api/actions/generate
 * 
 * Triggers action generation for a user. Creates new daily actions based on
 * the user's archetype, burnout score, and assessment data.
 * 
 * Request body:
 * - odId: string - User's unique identifier
 * - forceRegenerate?: boolean - If true, clears existing actions and regenerates
 * 
 * Response:
 * - 200: { success: true, actions, completedToday, totalToday, completionStats }
 * - 400: { error: string } - Missing or invalid parameters
 * - 409: { error: string, message: string } - Actions already exist for today
 * - 429: { error: string } - Rate limit exceeded
 * - 500: { error: string } - Server error
 * 
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { odId, forceRegenerate = false } = body;

    // Check rate limit (10 requests per minute)
    const clientId = getClientIdentifier(request, odId);
    const rateLimitResult = checkRateLimit(clientId, DEFAULT_RATE_LIMIT);
    
    if (!rateLimitResult.allowed) {
      const headers = createRateLimitHeaders(rateLimitResult, DEFAULT_RATE_LIMIT);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    // Validate odId is provided
    if (!odId || typeof odId !== 'string' || odId.trim() === '') {
      return NextResponse.json(
        { error: 'User ID (odId) is required' },
        { status: 400 }
      );
    }

    // Check if actions already exist for today
    const hasExistingActions = await hasActionsForToday(odId);
    
    if (hasExistingActions && !forceRegenerate) {
      // Return existing actions instead of error
      const existingActions = await getTodaysActions(odId);
      const completedToday = existingActions.filter(a => a.isCompleted).length;
      const completionStats = await getCompletionStats(odId, 7);
      
      return NextResponse.json({
        success: true,
        actions: existingActions,
        completedToday,
        totalToday: existingActions.length,
        completionStats,
        message: 'Actions already exist for today. Use forceRegenerate: true to regenerate.',
      });
    }

    // If force regenerate, clear existing actions for today
    if (hasExistingActions && forceRegenerate) {
      const today = new Date().toISOString().split('T')[0];
      await clearActionsForDate(odId, today);
    }

    // Get user's assessment for archetype and dimension data
    const assessment = await getLatestAssessment(odId);
    
    // Default archetype if no assessment exists
    const archetype: ArchetypeName = assessment?.archetype as ArchetypeName || 'Balanced Founder';

    // Get latest burnout score for action prioritization
    const burnoutScore = await getLatestScore(odId);
    
    // Convert burnout score to the expected format
    const burnoutScoreResult = burnoutScore ? {
      score: burnoutScore.score,
      riskLevel: burnoutScore.riskLevel as 'low' | 'caution' | 'high' | 'critical',
      contributingFactors: burnoutScore.contributingFactors as string[],
    } : null;

    // Generate new daily actions
    const actions = await generateDailyActions(
      odId,
      archetype,
      burnoutScoreResult,
      assessment
    );

    // Calculate completion stats
    const completedToday = actions.filter(a => a.isCompleted).length;
    const completionStats = await getCompletionStats(odId, 7);

    return NextResponse.json({
      success: true,
      actions,
      completedToday,
      totalToday: actions.length,
      completionStats,
    });
  } catch (error) {
    // Log full error and return generic message
    handleError('POST /api/actions/generate', error);
    
    return NextResponse.json(
      { error: USER_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
