import { NextResponse } from 'next/server';
import { markActionComplete } from '../../../../services/actionPlanService';
import { handleError, USER_ERROR_MESSAGES } from '../../../../utils/errorHandler';
import { 
  checkRateLimit, 
  createRateLimitHeaders, 
  getClientIdentifier,
  DEFAULT_RATE_LIMIT 
} from '../../../../utils/rateLimit';

/**
 * POST /api/actions/complete
 * 
 * Marks an action item as completed.
 * 
 * Request body:
 * - actionId: string - The action item's UUID
 * - odId: string - User's unique identifier (for ownership verification)
 * 
 * Response:
 * - 200: { success: true, action }
 * - 400: { error: string } - Missing or invalid parameters
 * - 404: { error: string } - Action not found
 * - 429: { error: string } - Rate limit exceeded
 * - 500: { error: string } - Server error
 * 
 * Requirements: 4.3
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { actionId, odId } = body;

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

    // Validate actionId is provided
    if (!actionId || typeof actionId !== 'string' || actionId.trim() === '') {
      return NextResponse.json(
        { error: 'Action ID is required' },
        { status: 400 }
      );
    }

    // Validate odId is provided
    if (!odId || typeof odId !== 'string' || odId.trim() === '') {
      return NextResponse.json(
        { error: 'User ID (odId) is required' },
        { status: 400 }
      );
    }

    // Mark the action as complete
    const updatedAction = await markActionComplete(actionId, odId);

    // Check if action was found and updated
    if (!updatedAction) {
      return NextResponse.json(
        { error: 'Action not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      action: updatedAction,
    });
  } catch (error) {
    // Log full error and return generic message
    handleError('POST /api/actions/complete', error);
    
    return NextResponse.json(
      { error: USER_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
