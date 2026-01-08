import { NextResponse } from 'next/server';
import { 
  getHistory, 
  calculateTrends,
  JournalValidationError 
} from '../../../../services/journalService';
import { handleError, USER_ERROR_MESSAGES } from '../../../../utils/errorHandler';
import { 
  checkRateLimit, 
  createRateLimitHeaders, 
  getClientIdentifier,
  DEFAULT_RATE_LIMIT 
} from '../../../../utils/rateLimit';

/**
 * GET /api/journal/history
 * 
 * Retrieves journal entry history for a user with trend analysis.
 * 
 * Query params:
 * - odId: string - User's unique identifier (required)
 * - days: number - Number of days to fetch (7, 14, or 30, default: 7)
 * 
 * Response:
 * - 200: { entries, total, trends }
 * - 400: { error: string } - Invalid input
 * - 500: { error: string } - Server error
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');
    const daysParam = searchParams.get('days');

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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Parse and validate days parameter
    let days = 7; // default
    if (daysParam) {
      const parsedDays = parseInt(daysParam, 10);
      if (isNaN(parsedDays) || ![7, 14, 30].includes(parsedDays)) {
        return NextResponse.json(
          { error: 'Days must be 7, 14, or 30' },
          { status: 400 }
        );
      }
      days = parsedDays;
    }

    // Get journal history
    const entries = await getHistory(odId, days);

    // Calculate trends from entries
    const trends = calculateTrends(entries);

    // Check if we have enough entries for meaningful trends
    const hasSufficientData = entries.length >= 3;

    return NextResponse.json({
      entries,
      total: entries.length,
      trends: hasSufficientData ? trends : null,
      message: !hasSufficientData && entries.length > 0 
        ? 'Keep logging to see your trends! At least 3 entries needed.' 
        : undefined,
    });
  } catch (error) {
    // Handle validation errors with specific messages
    if (error instanceof JournalValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log full error and return generic message
    handleError('GET /api/journal/history', error);
    
    return NextResponse.json(
      { error: USER_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
