import { AnswerValue, QuizQuestion } from '../types/assessment';

// Point mapping for answers
export const ANSWER_POINTS: Record<AnswerValue, number> = {
  A: 0,
  B: 33,
  C: 67,
  D: 100,
};

// All 25 quiz questions
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Dimension 1: Imposter Syndrome (Q1-5)
  {
    id: 1,
    dimension: 'Imposter Syndrome',
    text: 'I feel like a fraud despite my achievements and abilities',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 2,
    dimension: 'Imposter Syndrome',
    text: "I'm afraid people will discover I'm not as competent as they think",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 3,
    dimension: 'Imposter Syndrome',
    text: 'When I succeed, it feels more like luck than my own doing',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 4,
    dimension: 'Imposter Syndrome',
    text: "I often feel like I don't deserve my position as a founder",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 5,
    dimension: 'Imposter Syndrome',
    text: "I'm afraid my startup idea isn't original or good enough",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },

  // Dimension 2: Founder Doubt (Q6-9)
  {
    id: 6,
    dimension: 'Founder Doubt',
    text: 'I doubt whether my startup will actually succeed',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 7,
    dimension: 'Founder Doubt',
    text: 'I question my ability to lead my company effectively',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 8,
    dimension: 'Founder Doubt',
    text: "I worry that I don't have what it takes to be an entrepreneur",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 9,
    dimension: 'Founder Doubt',
    text: "I'm unsure if I made the right decision to start this company",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },

  // Dimension 3: Identity Fusion (Q10-13)
  {
    id: 10,
    dimension: 'Identity Fusion',
    text: "My self-worth is deeply tied to my startup's success",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 11,
    dimension: 'Identity Fusion',
    text: 'I define myself primarily as a founder',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 12,
    dimension: 'Identity Fusion',
    text: 'When my business struggles, it feels like a personal failure',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 13,
    dimension: 'Identity Fusion',
    text: 'I struggle to separate my identity from my role as founder',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },

  // Dimension 4: Fear of Rejection (Q14-18)
  {
    id: 14,
    dimension: 'Fear of Rejection',
    text: "I'm afraid the market will reject my product/service",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 15,
    dimension: 'Fear of Rejection',
    text: 'I worry about what others think of my startup idea',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 16,
    dimension: 'Fear of Rejection',
    text: 'I fear negative feedback on my business',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 17,
    dimension: 'Fear of Rejection',
    text: "I'm concerned peers or competitors will judge my startup negatively",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 18,
    dimension: 'Fear of Rejection',
    text: "I worry investors won't believe in my vision",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },

  // Dimension 5: Risk Tolerance (Q19-21)
  {
    id: 19,
    dimension: 'Risk Tolerance',
    text: "I'm comfortable making bold decisions with uncertain outcomes",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 20,
    dimension: 'Risk Tolerance',
    text: 'I embrace uncertainty as a necessary part of entrepreneurship',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 21,
    dimension: 'Risk Tolerance',
    text: "I'm willing to take calculated risks for potentially big rewards",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },

  // Dimension 6: Motivation Type (Q22-24)
  {
    id: 22,
    dimension: 'Motivation Type',
    text: "I'm driven primarily by my passion for solving this problem",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 23,
    dimension: 'Motivation Type',
    text: "I'm motivated by the potential financial rewards",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
  {
    id: 24,
    dimension: 'Motivation Type',
    text: "I'm driven by external validation and recognition",
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },

  // Dimension 7: Isolation (Q25)
  {
    id: 25,
    dimension: 'Isolation',
    text: 'I feel isolated or lonely as a founder',
    options: { A: 'Strongly Disagree', B: 'Disagree', C: 'Agree', D: 'Strongly Agree' },
  },
];
