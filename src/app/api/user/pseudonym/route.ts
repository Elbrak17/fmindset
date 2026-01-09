import { NextRequest, NextResponse } from 'next/server';
import { regeneratePseudonymWithLimit, canRegeneratePseudonym } from '@/services/userDataService';

/**
 * GET - Check if user can regenerate pseudonym
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const result = await canRegeneratePseudonym(odId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking pseudonym status:', error);
    return NextResponse.json(
      { error: 'Failed to check pseudonym status' },
      { status: 500 }
    );
  }
}

/**
 * POST - Regenerate user pseudonym (once per month limit)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { odId } = body;

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const result = await regeneratePseudonymWithLimit(odId);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          nextAvailableDate: result.nextAvailableDate,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      pseudonym: result.pseudonym,
    });
  } catch (error) {
    console.error('Error regenerating pseudonym:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate pseudonym' },
      { status: 500 }
    );
  }
}
