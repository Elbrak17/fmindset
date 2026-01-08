// Answer values
export type AnswerValue = 'A' | 'B' | 'C' | 'D';

// Motivation types
export type MotivationType = 'intrinsic' | 'extrinsic' | 'mixed';

// Archetype names (exact strings)
export type ArchetypeName =
  | 'Perfectionist Builder'
  | 'Opportunistic Visionary'
  | 'Isolated Dreamer'
  | 'Burning Out'
  | 'Self-Assured Hustler'
  | 'Community-Driven'
  | 'Balanced Founder'
  | 'Growth Seeker';

// Psychological scores (7 dimensions)
export interface PsychologicalScores {
  imposterSyndrome: number;    // Q1-5 average (0-100)
  founderDoubt: number;        // Q6-9 average (0-100)
  identityFusion: number;      // Q10-13 average (0-100)
  fearOfRejection: number;     // Q14-18 average (0-100)
  riskTolerance: number;       // Q19-21 average (0-100)
  motivationType: MotivationType; // Q22-24 comparison
  isolationLevel: number;      // Q25 (0-100)
}

// Archetype result
export interface ArchetypeResult {
  name: ArchetypeName;
  description: string;
  traits: string[];
  strength: string;
  challenge: string;
  recommendation: string;
  isUrgent: boolean;        // true for Burning Out
  encouragement?: string;   // for Growth Seeker
}

// Quiz option structure
export interface QuizOption {
  value: AnswerValue;
  label: string;
}

// Quiz question structure
export interface QuizQuestion {
  id: number;
  dimension: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

// Assessment submission request
export interface AssessmentSubmitRequest {
  answers: AnswerValue[];
}

// Assessment submission response
export interface AssessmentSubmitResponse {
  scores: PsychologicalScores;
  archetype: ArchetypeResult;
  recommendations: string[];
}

// Groq insights request
export interface GroqInsightsRequest {
  scores: PsychologicalScores;
  archetype: ArchetypeName;
}

// Groq insights response
export interface GroqInsightsResponse {
  insights: string;
}
