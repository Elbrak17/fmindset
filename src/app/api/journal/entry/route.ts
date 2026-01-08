import { NextResponse } from 'next/server';
import { 
  createOrUpdateEntry, 
  getHistory, 
  calculateTrends,
  JournalValidationError 
} from '../../../../services/journalService';
import { 
  calculateBurnoutScore, 
  saveBurnoutScore 
} from '../../../../services/burnoutService';
import { getLatestAssessment } from '../../../../services/databaseService';
import { handleError, USER_ERROR_MESSAGES } from '../../../../utils/errorHandler';
import { 
  checkRateLimit, 
  createRateLimitHeaders, 
  getClientIdentifier,
  DEFAULT_RATE_LIMIT 
} from '../../../../utils/rateLimit';

/**
 * POST /api/journal/entry
 * 
 * Creates or updates today's journal entry for a user.
 * Also calculates and returns the burnout score.
 * 
 * Request body:
 * - odId: string - User's unique identifier
 * - mood: number - Mood level (0-100)
 * - energy: number - Energy level (0-100)
 * - stress: number - Stress level (0-100)
 * - notes?: string - Optional notes (max 500 chars)
 * 
 * Response:
 * - 200: { success: true, entry, burnoutScore }
 * - 400: { error: string } - Invalid input
 * - 500: { error: string } - Server error
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.5
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { odId, mood, energy, stress, notes } = body;

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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate mood
    if (typeof mood !== 'number' || isNaN(mood) || mood < 0 || mood > 100) {
      return NextResponse.json(
        { error: 'Mood must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate energy
    if (typeof energy !== 'number' || isNaN(energy) || energy < 0 || energy > 100) {
      return NextResponse.json(
        { error: 'Energy must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate stress
    if (typeof stress !== 'number' || isNaN(stress) || stress < 0 || stress > 100) {
      return NextResponse.json(
        { error: 'Stress must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate notes if provided
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== 'string') {
        return NextResponse.json(
          { error: 'Notes must be a string' },
          { status: 400 }
        );
      }
      if (notes.length > 500) {
        return NextResponse.json(
          { error: 'Notes must not exceed 500 characters' },
          { status: 400 }
        );
      }
    }

    // Create or update the journal entry
    const entry = await createOrUpdateEntry({
      userId: odId,
      mood,
      energy,
      stress,
      notes: notes || undefined,
    });

    // Get user's assessment for burnout calculation
    const assessment = await getLatestAssessment(odId);

    // Get recent history for trend calculation
    const history = await getHistory(odId, 7);
    const trends = calculateTrends(history);

    // Calculate burnout score
    const burnoutResult = calculateBurnoutScore(entry, assessment, trends);

    // Save burnout score to database
    const savedBurnoutScore = await saveBurnoutScore(odId, burnoutResult, entry.id);

    return NextResponse.json({
      success: true,
      entry,
      burnoutScore: {
        score: savedBurnoutScore.score,
        riskLevel: savedBurnoutScore.riskLevel,
        contributingFactors: savedBurnoutScore.contributingFactors,
      },
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
    handleError('POST /api/journal/entry', error);
    
    return NextResponse.json(
      { error: USER_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
