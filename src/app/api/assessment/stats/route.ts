import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { assessments } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

/**
 * GET /api/assessment/stats
 * 
 * Returns assessment statistics for a user
 * Query params:
 * - odId: User's anonymous ID
 * 
 * Response:
 * - 200: { count, lastAssessment, archetype }
 * - 400: { error: string } - Missing odId
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const odId = searchParams.get('odId');

    if (!odId) {
      return NextResponse.json(
        { error: 'Missing odId parameter' },
        { status: 400 }
      );
    }

    // Get count of assessments
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(assessments)
      .where(eq(assessments.userId, odId));

    const count = Number(countResult[0]?.count || 0);

    // Get latest assessment
    const latestAssessment = await db
      .select({
        archetype: assessments.archetype,
        createdAt: assessments.createdAt,
      })
      .from(assessments)
      .where(eq(assessments.userId, odId))
      .orderBy(desc(assessments.createdAt))
      .limit(1);

    return NextResponse.json({
      count,
      lastAssessment: latestAssessment[0]?.createdAt || null,
      archetype: latestAssessment[0]?.archetype || null,
    });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
