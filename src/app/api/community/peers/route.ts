import { NextRequest, NextResponse } from 'next/server';
import { findPeerMatches, dismissPeerMatch, optInForPeerConnection } from '@/services/communityService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const matches = await findPeerMatches(odId);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error finding peer matches:', error);
    return NextResponse.json(
      { error: 'Failed to find peer matches' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { odId, matchId, action } = body;

    if (!odId || !matchId) {
      return NextResponse.json({ error: 'User ID and match ID required' }, { status: 400 });
    }

    if (action === 'dismiss') {
      await dismissPeerMatch(odId, matchId);
      return NextResponse.json({ success: true });
    }

    if (action === 'optIn') {
      const match = await optInForPeerConnection(odId, matchId);
      return NextResponse.json({ match });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating peer match:', error);
    return NextResponse.json(
      { error: 'Failed to update peer match' },
      { status: 500 }
    );
  }
}
