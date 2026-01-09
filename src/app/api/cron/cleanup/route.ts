import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldData } from '@/services/userDataService';

/**
 * Cron job endpoint for data cleanup
 * Should be called daily by a scheduler (e.g., Vercel Cron, GitHub Actions)
 * 
 * Security: Requires CRON_SECRET header to prevent unauthorized access
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await cleanupOldData();

    return NextResponse.json({
      success: true,
      message: 'Data cleanup completed',
      ...result,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request);
}
