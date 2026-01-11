import { PsychologicalScores, ArchetypeName } from '../types/assessment';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_TIMEOUT = 3000;

const FALLBACK_TEXT = "We're generating personalized insights for you. Check back in a moment.";

/**
 * Constructs the prompt for Groq API including all 7 dimensions and archetype
 * @param scores - PsychologicalScores object with all 7 dimensions
 * @param archetype - The determined archetype name
 * @returns Formatted prompt string for Groq API
 */
export function constructInsightPrompt(scores: PsychologicalScores, archetype: ArchetypeName): string {
  return `You are a supportive founder psychologist. A young founder (age 16-24) just completed a psychological assessment. Here are their scores (0-100, higher = more intense):

- Imposter Syndrome: ${scores.imposterSyndrome}
- Founder Doubt: ${scores.founderDoubt}
- Identity Fusion: ${scores.identityFusion}
- Fear of Rejection: ${scores.fearOfRejection}
- Risk Tolerance: ${scores.riskTolerance}
- Motivation Type: ${scores.motivationType}
- Isolation Level: ${scores.isolationLevel}

Their archetype is: ${archetype}

Provide:
1. A brief assessment of their psychological state (2-3 sentences)
2. 3 specific, actionable recommendations
3. 1 warning sign to watch for

Tone: Warm, supportive, non-clinical. Speak directly to the founder. Keep response under 300 words.`;
}

/**
 * Fetches personalized psychological insights from Groq API
 * 
 * - Uses llama-3.1-8b-instant model
 * - 3000ms timeout
 * - Returns fallback text on timeout or error (never throws)
 * - Logs errors to console
 * 
 * @param scores - PsychologicalScores object with all 7 dimensions
 * @param archetype - The determined archetype name
 * @returns Promise resolving to insights string (or fallback text on error)
 */
export async function getInsights(scores: PsychologicalScores, archetype: ArchetypeName): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: constructInsightPrompt(scores, archetype) }],
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Groq API error: ${response.status}`);
      return FALLBACK_TEXT;
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content || '';

    // Validate response has meaningful content (> 50 chars per requirement 6.6)
    if (insights.length < 50) {
      console.error('Groq API returned insufficient content');
      return FALLBACK_TEXT;
    }

    return insights;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Groq API error:', error);
    return FALLBACK_TEXT;
  }
}
