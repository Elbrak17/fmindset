import { NextRequest, NextResponse } from 'next/server';
import { createPost, getPosts, getTrendingPosts, type PostCategory, type SortOrder } from '@/services/communityService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') as PostCategory | undefined;
    const sortBy = (searchParams.get('sort') || 'recent') as SortOrder;
    const search = searchParams.get('search') || undefined;
    const trending = searchParams.get('trending') === 'true';

    if (trending) {
      const posts = await getTrendingPosts();
      return NextResponse.json({ posts });
    }

    const result = await getPosts(page, category, sortBy, search);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { odId, title, body: postBody, category, showArchetype } = body;

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const post = await createPost(odId, title, postBody, category, showArchetype);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    const message = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
