import { NextResponse } from 'next/server';
import { 
  deleteEntry,
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
 * DELETE /api/journal/[id]
 * 
 * Deletes a journal entry by ID.
 * Requires odId for ownership verification.
 * 
 * Path params:
 * - id: string - Journal entry UUID
 * 
 * Query params:
 * - odId: string - User's unique identifier (required for ownership verification)
 * 
 * Response:
 * - 200: { success: true, message: string }
 * - 400: { error: string } - Invalid input
 * - 404: { error: string } - Entry not found or not owned by user
 * - 500: { error: string } - Server error
 * 
 * Requirements: 5.2, 5.4
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
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

    // Validate entry ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid entry ID format' },
        { status: 400 }
      );
    }

    // Validate odId is provided for ownership verification
    if (!odId || odId.trim() === '') {
      return NextResponse.json(
        { error: 'User ID is required for verification' },
        { status: 400 }
      );
    }

    // Delete the entry (service validates ownership)
    const deleted = await deleteEntry(id, odId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Entry not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Journal entry deleted successfully',
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
    handleError('DELETE /api/journal/[id]', error);
    
    return NextResponse.json(
      { error: USER_ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
