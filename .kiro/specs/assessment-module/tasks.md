# Implementation Plan: Assessment Module

## Overview

This implementation plan builds the FMindset Assessment Module incrementally, starting with core data models and scoring logic, then building UI components, and finally wiring everything together with API routes. Each task builds on previous work, ensuring no orphaned code.

## Tasks

- [x] 1. Set up project structure and TypeScript types
  - Create `src/types/assessment.ts` with all interfaces (PsychologicalScores, ArchetypeResult, QuizQuestion, etc.)
  - Create `src/utils/constants.ts` with ANSWER_POINTS mapping and QUIZ_QUESTIONS array (all 25 questions)
  - Create `src/utils/archetypes.ts` with ARCHETYPES constant containing all 8 archetype definitions
  - _Requirements: 3.14, 4.3_

- [x] 2. Implement MongoDB schemas
  - [x] 2.1 Create `src/services/mongooseModels.ts` with Assessment and UserProfile schemas
    - Assessment schema with userId, answers (25 elements), scores, archetype, groqInsights, timestamps
    - UserProfile schema with odId, isAnonymous, pseudonym, passwordHash, assessmentIds
    - Add Mongoose validation for 25 answers, score ranges 0-100, archetype enum
    - _Requirements: 5.10_

- [x] 3. Implement scoring algorithm
  - [x] 3.1 Create `src/services/assessmentService.ts` with calculateScores function
    - Validate exactly 25 answers, each A/B/C/D
    - Calculate dimension averages using ANSWER_POINTS (A=0, B=33, C=67, D=100)
    - Determine motivationType from Q22-24 comparison
    - Return typed PsychologicalScores object
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

  - [x] 3.2 Write property tests for scoring algorithm
    - **Property 1: Answer Validation Correctness**
    - **Property 2: Dimension Scoring Correctness**
    - **Property 3: Scoring Invariants**
    - **Validates: Requirements 3.2, 3.3, 3.4-3.10, 3.11, 3.12, 3.14**

- [x] 4. Implement archetype determination
  - [x] 4.1 Add determineArchetype function to assessmentService.ts
    - Check Burning Out first (3+ dimensions > 70)
    - Check each archetype condition in priority order
    - Return complete ArchetypeResult with name, description, traits, strength, challenge, recommendation
    - Set isUrgent flag for Burning Out, encouragement for Growth Seeker
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [x] 4.2 Write property tests for archetype determination
    - **Property 4: Archetype Classification Uniqueness**
    - **Property 5: Archetype Result Completeness**
    - **Property 6: Burning Out Detection**
    - **Property 7: Growth Seeker Encouragement**
    - **Validates: Requirements 4.2, 4.3, 4.4-4.8, 4.9, 4.10**

- [x] 5. Implement recommendations generator
  - [x] 5.1 Add getRecommendations function to assessmentService.ts
    - Generate recommendations based on high-scoring dimensions (> 70)
    - Include archetype-specific recommendation
    - Return 2-3 recommendations max
    - _Requirements: 5.5_

- [x] 6. Checkpoint - Core services complete
  - Ensure all unit tests pass for assessmentService
  - Verify scoring produces valid results for edge cases (all A's, all D's)
  - Ask the user if questions arise

- [x] 7. Implement Groq service
  - [x] 7.1 Create `src/services/groqService.ts` with getInsights function
    - constructInsightPrompt function including all 7 dimensions and archetype
    - Call Groq API with mixtral-8x7b-32768 model, 3000ms timeout
    - Return fallback text on timeout or error (don't throw)
    - Log errors to console
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [x] 7.2 Write property tests for Groq service
    - **Property 12: Groq Request Validation**
    - **Property 13: Groq Error Resilience**
    - **Validates: Requirements 6.2, 6.3, 6.9**

- [x] 8. Implement API routes
  - [x] 8.1 Create `src/app/api/assessment/submit/route.ts`
    - Validate answers array (25 elements, each A/B/C/D)
    - Call calculateScores, determineArchetype, getRecommendations
    - Save Assessment to MongoDB
    - Return scores, archetype, recommendations
    - Handle errors with appropriate status codes (400, 500)
    - _Requirements: 3.1, 7.1, 7.2, 7.5, 7.6, 7.10_

  - [x] 8.2 Create `src/app/api/groq/insights/route.ts`
    - Validate scores object has all 7 dimensions
    - Call groqService.getInsights
    - Return insights (or fallback on error)
    - Never throw errors to client
    - _Requirements: 6.1, 6.2, 7.3_

- [x] 9. Checkpoint - Backend complete
  - Test API routes with curl/Postman
  - Verify MongoDB persistence
  - Verify Groq integration (or fallback)
  - Ask the user if questions arise

- [x] 10. Implement QuizQuestion component
  - [x] 10.1 Create `src/components/Assessment/QuizQuestion.tsx`
    - Props: questionId, questionText, dimensionLabel, options, selectedOption, onSelect, progress
    - Display dimension label, question text, 4 radio options
    - Handle option selection with visual feedback (highlight)
    - Show progress indicator (e.g., "5/25")
    - Mobile-responsive layout with Tailwind
    - Max 150 lines
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 11. Implement QuizContainer component
  - [x] 11.1 Create `src/components/Assessment/QuizContainer.tsx`
    - State: currentQuestionIndex, answers[], isSubmitting, error
    - Load all 25 questions from constants
    - Navigate between questions (Previous/Next buttons)
    - Disable Previous on Q1, show Submit on Q25
    - Validate answer selected before advancing
    - Debounce rapid clicks
    - Handle submission flow
    - Max 250 lines
    - _Requirements: 1.4, 1.7, 1.8, 1.9, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [x] 11.2 Write property tests for quiz state management
    - **Property 9: Quiz State Preservation**
    - **Property 10: Submission Debounce**
    - **Validates: Requirements 2.3, 2.8, 2.9, 2.12, 7.4**

- [x] 12. Implement ResultsDisplay component
  - [x] 12.1 Create `src/components/Assessment/ResultsDisplay.tsx`
    - Props: scores, archetype, recommendations, groqInsights, isLoadingInsights
    - Display archetype card (name, emoji, description)
    - Render 7 score bars with color coding (green 0-60, yellow 61-75, red 76-100)
    - Show tooltips for caution/high-risk zones
    - Display 2-3 expandable recommendation cards
    - Show Groq insights with fade-in animation
    - Display burnout alert if archetype is "Burning Out"
    - Attribution text for AI insights
    - Max 250 lines
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.12, 5.13_

  - [x] 12.2 Write property tests for score color coding
    - **Property 8: Score Color Coding**
    - **Validates: Requirements 5.4, 5.6, 5.7**

- [x] 13. Checkpoint - Components complete
  - Verify all components render correctly
  - Test mobile responsiveness
  - Ask the user if questions arise

- [x] 14. Implement quiz page
  - [x] 14.1 Create `src/app/assessment/quiz/page.tsx`
    - Check NextAuth session on load
    - Show landing with "Start Anonymous Assessment" button if no session
    - Create anonymous user on button click
    - Display QuizContainer
    - Handle submission → navigate to /assessment/results
    - Preserve progress in session state
    - Mobile responsive
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.10, 5.1_

- [x] 15. Implement results page
  - [x] 15.1 Create `src/app/assessment/results/page.tsx`
    - Load assessment results from state/API
    - Display ResultsDisplay immediately (don't wait for Groq)
    - Call /api/groq/insights async
    - Fade in insights when ready
    - Show fallback if Groq fails
    - Buttons: Retake Assessment, Go to Dashboard
    - Mobile responsive
    - _Requirements: 5.1, 5.10, 5.11, 5.12, 5.13, 6.10, 6.11, 6.12_

- [x] 16. Implement error handling and edge cases
  - [x] 16.1 Add error handling to quiz page
    - Session expiry: save to localStorage, allow resume
    - Offline detection: save to localStorage, sync when online
    - Validation errors: show message, preserve answers
    - _Requirements: 1.11, 1.12, 7.2, 7.7, 7.8_

  - [x] 16.2 Add error handling to results page
    - MongoDB failure: show error, allow retry
    - Groq failure: show fallback, don't block results
    - _Requirements: 7.1, 7.3_

  - [x] 16.3 Write property tests for error handling
    - **Property 11: Error Logging Without Exposure**
    - **Validates: Requirements 7.10**

- [x] 17. Final checkpoint - Full integration
  - Complete end-to-end flow: anonymous signup → quiz → results → insights
  - Verify all error scenarios handled gracefully
  - Test on mobile devices
  - Ensure all tests pass
  - Ask the user if questions arise

## Notes

- All tasks including property tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Max line limits: QuizQuestion 150, QuizContainer 250, ResultsDisplay 250, assessmentService 150, groqService 80
