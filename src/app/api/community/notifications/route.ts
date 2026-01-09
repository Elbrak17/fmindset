import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markNotificationsRead, getUnreadCount } from '@/services/communityService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const countOnly = searchParams.get('countOnly') === 'true';

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (countOnly) {
      const count = await getUnreadCount(odId);
      return NextResponse.json({ count });
    }

    const notifications = await getNotifications(odId, unreadOnly);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { odId, notificationIds } = body;

    if (!odId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await markNotificationsRead(odId, notificationIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications read' },
      { status: 500 }
    );
  }
}
