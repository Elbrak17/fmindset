import { NextRequest, NextResponse } from 'next/server';
import { reportContent } from '@/services/communityService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { odId, reason, replyId } = body;

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Reason required' }, { status: 400 });
    }

    await reportContent(odId, reason, replyId ? undefined : postId, replyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reporting content:', error);
    const message = error instanceof Error ? error.message : 'Failed to report content';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
