/**
 * Score color utility functions for the Assessment module
 * Extracted for testability without React dependencies
 */

export interface ScoreColorResult {
  bg: string;
  text: string;
  tooltip: string | null;
}

/**
 * Get color class based on score value
 * Property 8: Score Color Coding
 * - 0-60: green (default)
 * - 61-75: yellow (caution zone)
 * - 76-100: red (high risk)
 * 
 * **Validates: Requirements 5.4, 5.6, 5.7**
 */
export function getScoreColor(score: number): ScoreColorResult {
  if (score <= 60) {
    return { bg: 'bg-green-500', text: 'text-green-700', tooltip: null };
  } else if (score <= 75) {
    return { bg: 'bg-yellow-500', text: 'text-yellow-700', tooltip: 'Caution zone' };
  } else {
    return { bg: 'bg-red-500', text: 'text-red-700', tooltip: 'High risk' };
  }
}
