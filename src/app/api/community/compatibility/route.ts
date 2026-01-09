import { NextRequest, NextResponse } from 'next/server';
import { calculateCompatibility } from '@/services/communityService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId1, userId2 } = body;

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { error: 'Both user IDs required' },
        { status: 400 }
      );
    }

    const result = await calculateCompatibility(userId1, userId2);

    if (!result) {
      return NextResponse.json(
        { error: 'Both users must have completed the assessment' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating compatibility:', error);
    return NextResponse.json(
      { error: 'Failed to calculate compatibility' },
      { status: 500 }
    );
  }
}
