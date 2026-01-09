import { NextRequest, NextResponse } from 'next/server';
import { getPostById, createReply, deletePost } from '@/services/communityService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getPostById(id);

    if (!result) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { odId, body: replyBody, parentReplyId } = body;

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const reply = await createReply(postId, odId, replyBody, parentReplyId);
    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    const message = error instanceof Error ? error.message : 'Failed to create reply';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { odId } = body;

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await deletePost(postId, odId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete post';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
