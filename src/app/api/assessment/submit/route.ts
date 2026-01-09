import { NextResponse } from 'next/server';
import { calculateScores, determineArchetype, getRecommendations } from '../../../../services/assessmentService';
import { saveAssessment } from '../../../../services/databaseService';
import { AnswerValue, AssessmentSubmitResponse } from '../../../../types/assessment';

/**
 * POST /api/assessment/submit
 * 
 * Validates and processes a 25-question assessment submission.
 * 
 * Request body:
 * - answers: string[] - Array of 25 answers, each A/B/C/D
 * 
 * Response:
 * - 200: { scores, archetype, recommendations }
 * - 400: { error: string } - Invalid input
 * - 500: { error: string } - Server error
 * 
 * Requirements: 3.1, 7.1, 7.2, 7.5, 7.6, 7.10
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { answers } = body;

    // Validate answers array exists and has correct length
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid submission. Refresh.' },
        { status: 400 }
      );
    }

    if (answers.length !== 25) {
      return NextResponse.json(
        { error: 'Exactly 25 answers required' },
        { status: 400 }
      );
    }

    // Validate each answer is A, B, C, or D
    const validAnswers: AnswerValue[] = ['A', 'B', 'C', 'D'];
    if (!answers.every((a: unknown) => typeof a === 'string' && validAnswers.includes(a as AnswerValue))) {
      return NextResponse.json(
        { error: 'Invalid answer format' },
        { status: 400 }
      );
    }

    // Calculate scores and determine archetype
    const scores = calculateScores(answers);
    const archetype = determineArchetype(scores);
    const recommendations = getRecommendations(scores, archetype.name);

    // Get user ID from request body or generate anonymous one
    // The client should send the persistent odId
    const { odId } = body;
    const userId = odId || 'anonymous-' + crypto.randomUUID();

    // Save assessment to PostgreSQL database
    try {
      await saveAssessment(
        userId,
        answers as AnswerValue[],
        scores,
        archetype.name,
        null // Groq insights will be added later via separate API call
      );
    } catch (dbError) {
      // Log database error but don't fail the request
      // User still gets their results even if saving fails
      console.error('Assessment submission error:', dbError);
      
      // In production, you might want to queue this for retry
      // For now, we continue and return results to user
    }

    // Return successful response
    const response: AssessmentSubmitResponse = {
      scores,
      archetype,
      recommendations,
    };

    return NextResponse.json(response);
  } catch (error) {
    // Log full error to console (Requirement 7.10)
    console.error('Assessment submission error:', error);

    // Return generic error message without exposing internals
    return NextResponse.json(
      { error: 'Server error. Try again later.' },
      { status: 500 }
    );
  }
}
