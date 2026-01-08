import { NextResponse } from 'next/server';
import { getTodaysActions, getCompletionStats } from '../../../../services/actionPlanService';
import { handleError, USER_ERROR_MESSAGES } from '../../../../utils/errorHandler';
import { 
  checkRateLimit, 
  createRateLimitHeaders, 
  getClientIdentifier,
  DEFAULT_RATE_LIMIT 
} from '../../../../utils/rateLimit';

/**
 * GET /api/actions/daily
 * 
 * Returns today's action items for a user with completion status.
 * 
 * Query params:
 * - odId: string - User's unique identifier
 * 
 * Response:
 * - 200: { actions, completedToday, totalToday, completionStats }
 * - 400: { error: string } - Missing or invalid odId
 * - 429: { error: string } - Rate limit exceeded
 * - 500: { error: string } - Server error
 * 
 * Requirements: 4.1, 4.3
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

    // Get today's actions for the user
    const actions = await getTodaysActions(odId);

    // Calculate completion stats
    const completedToday = actions.filter(a => a.isCompleted).length;
    const totalToday = actions.length;

    // Get overall completion stats (last 7 days)
    const completionStats = await getCompletionStats(odId, 7);

    return NextResponse.json({
      actions,
      completedToday,
      totalToday,
      completionStats,
    });
  } catch (error) {
    // Log full error and return generic message
    handleError('GET /api/actions/daily', error);
    
    return NextResponse.json(
      { error: USER_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
