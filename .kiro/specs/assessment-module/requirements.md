# Requirements Document

## Introduction

The Assessment Module is the core feature of FMindset, a psychological companion platform for young founders (age 16-24). It provides a 25-question psychological assessment that measures 7 dimensions (Imposter Syndrome, Founder Doubt, Identity Fusion, Fear of Rejection, Risk Tolerance, Motivation Type, Isolation Level), classifies founders into 8 archetypes, and delivers AI-powered personalized insights via Groq. The module prioritizes psychological safety, anonymous access, and a supportive user experience.

## Glossary

- **System**: The FMindset Assessment Module application
- **User**: A young founder (age 16-24) taking the psychological assessment
- **Quiz**: The 25-question psychological assessment
- **Dimension**: One of 7 psychological metrics measured (scored 0-100)
- **Archetype**: One of 8 founder personality classifications based on dimension scores
- **Session**: A NextAuth session tracking user state (anonymous or authenticated)
- **Groq_API**: The Mixtral 8x7b-32768 AI service for generating psychological insights
- **Assessment_Record**: MongoDB document storing quiz answers, scores, archetype, and insights
- **Burnout_Alert**: Urgent notification triggered when 3+ dimensions score above 70

## Requirements

### Requirement 1: Quiz Initialization and Authentication

**User Story:** As a young founder, I want to access the assessment without providing an email, so that I can assess myself anonymously and without friction.

#### Acceptance Criteria

1. WHEN a user navigates to /assessment/quiz, THE System SHALL check for an existing NextAuth session
2. WHEN a user has no active session, THE System SHALL display a landing page with a "Start Anonymous Assessment" button
3. WHEN a user clicks the "Start Anonymous Assessment" button, THE System SHALL create a temporary anonymous user ID without storing email
4. WHEN a temporary user is created, THE System SHALL initialize quiz state with currentQuestion set to 0 and answers as an empty array
5. WHEN a session exists, THE System SHALL redirect the user directly to the quiz and resume from the last answered question
6. WHEN a user previously started a quiz, THE System SHALL display progress and resume position without restarting
7. WHEN the quiz initializes, THE System SHALL load all 25 questions
8. WHEN the quiz loads, THE System SHALL display question 1 of 25 with the dimension category visible
9. WHEN the quiz loads, THE System SHALL show a progress bar indicating 1 of 25 answered
10. WHEN a user navigates away and returns, THE System SHALL preserve quiz progress in session state
11. IF a session expires mid-quiz, THEN THE System SHALL preserve answers in local state and allow resume
12. IF a user submits with fewer than 25 answers, THEN THE System SHALL display error message "All 25 questions required"
13. IF the browser crashes mid-quiz, THEN THE System SHALL allow the user to continue or restart

### Requirement 2: Quiz Question Interaction

**User Story:** As a young founder, I want to answer 25 questions with clear feedback, so that I understand what is being measured and feel confident in my responses.

#### Acceptance Criteria

1. WHEN the quiz displays a question, THE System SHALL show the dimension label, question text, 4 radio options (A, B, C, D), and progress indicator (e.g., "5/25")
2. WHEN a user hovers over an option, THE System SHALL display a subtle highlight effect
3. WHEN a user clicks an option, THE System SHALL mark the option as selected, save the answer to state, and highlight the selection visually
4. WHEN an option is selected, THE System SHALL update the progress counter to reflect answered questions
5. WHEN the user is on question 1, THE System SHALL disable the Previous button
6. IF a user attempts to advance without selecting an answer, THEN THE System SHALL display error message "Please select an answer"
7. WHEN the user is on question 25, THE System SHALL replace the Next button with a "Submit Quiz" button
8. WHEN a user changes their answer, THE System SHALL immediately update the stored answer
9. WHEN a user navigates to a previous question, THE System SHALL preserve all previously entered answers
10. WHEN a user clicks Submit, THE System SHALL validate that all 25 answers are present
11. IF a user rapid-clicks options, THEN THE System SHALL register only the final click via debounce
12. WHEN navigating back to a previous question, THE System SHALL display the previously selected answer as pre-selected

### Requirement 3: Scoring Algorithm

**User Story:** As a young founder, I want my answers scored accurately and consistently, so that my psychological profile is reliable.

#### Acceptance Criteria

1. WHEN a user submits 25 answers, THE System SHALL call the calculateScores function with the answers array
2. WHEN calculateScores executes, THE System SHALL validate that exactly 25 answers exist and each answer is A, B, C, or D
3. IF validation fails, THEN THE System SHALL throw an error with a user-friendly message
4. WHEN validation passes, THE System SHALL calculate imposterSyndrome as the average of Q1-5 scores (0-100)
5. WHEN validation passes, THE System SHALL calculate founderDoubt as the average of Q6-9 scores (0-100)
6. WHEN validation passes, THE System SHALL calculate identityFusion as the average of Q10-13 scores (0-100)
7. WHEN validation passes, THE System SHALL calculate fearOfRejection as the average of Q14-18 scores (0-100)
8. WHEN validation passes, THE System SHALL calculate riskTolerance as the average of Q19-21 scores (0-100)
9. WHEN validation passes, THE System SHALL determine motivationType based on Q22-24 comparison as intrinsic, extrinsic, or mixed
10. WHEN validation passes, THE System SHALL calculate isolationLevel as the Q25 score (0-100)
11. WHEN a score is calculated, THE System SHALL verify the value is within 0-100 range with no NaN or negative values
12. WHEN multiple users submit identical answer patterns, THE System SHALL produce identical scores (deterministic)
13. WHEN edge cases occur (all A answers or all D answers), THE System SHALL handle calculation without errors
14. WHEN scores are calculated, THE System SHALL return a typed PsychologicalScores object
15. WHEN calculateScores is called, THE System SHALL complete execution in under 500 milliseconds

### Requirement 4: Archetype Determination

**User Story:** As a young founder, I want to see my archetype based on my scores, so that I understand my founder personality type.

#### Acceptance Criteria

1. WHEN scores are calculated, THE System SHALL call the determineArchetype function with the scores object
2. WHEN determineArchetype executes, THE System SHALL classify the user into exactly 1 of 8 archetypes: Perfectionist Builder, Opportunistic Visionary, Isolated Dreamer, Burning Out, Self-Assured Hustler, Community-Driven, Balanced Founder, or Growth Seeker
3. WHEN archetype is determined, THE System SHALL return the archetype name as an exact string match
4. WHEN archetype is determined, THE System SHALL return a 1-2 sentence description
5. WHEN archetype is determined, THE System SHALL return a list of 2-3 personality traits
6. WHEN archetype is determined, THE System SHALL return the top strength
7. WHEN archetype is determined, THE System SHALL return the primary challenge
8. WHEN archetype is determined, THE System SHALL return a 1-2 sentence recommendation
9. WHEN the Burning Out archetype is detected, THE System SHALL include an urgent alert flag in the response
10. WHEN the Growth Seeker archetype is determined, THE System SHALL include an encouragement message

### Requirement 5: Results Display and Visualization

**User Story:** As a young founder, I want to see my results as a clear visual profile, so that I understand my psychological patterns at a glance.

#### Acceptance Criteria

1. WHEN assessment is submitted, THE System SHALL navigate to /assessment/results
2. WHEN results load, THE System SHALL display an archetype card with name, emoji, and description
3. WHEN results load, THE System SHALL display 7 score bars showing dimension name, score out of 100, and visual bar
4. WHEN results load, THE System SHALL highlight scores above 70 as caution zones
5. WHEN results load, THE System SHALL display 2-3 personalized recommendation cards
6. WHEN a score is between 61 and 75, THE System SHALL highlight the bar in yellow with tooltip "Caution zone"
7. WHEN a score is above 75, THE System SHALL highlight the bar in red with tooltip "High risk"
8. WHEN the archetype is Burning Out, THE System SHALL display a prominent alert with mental health resources link
9. WHEN a user clicks a recommendation card, THE System SHALL expand to show the full explanation
10. WHEN results load, THE System SHALL save the Assessment_Record to MongoDB immediately
11. WHEN results display, THE System SHALL initiate an async Groq_API call without blocking rendering
12. WHEN Groq insights load, THE System SHALL fade in the insights section below results
13. IF Groq_API fails, THEN THE System SHALL display graceful fallback text without showing an error message

### Requirement 6: Groq AI Psychological Insights

**User Story:** As a young founder, I want AI-generated personalized insights, so that I receive guidance beyond the numerical scores.

#### Acceptance Criteria

1. WHEN results display, THE System SHALL make an async POST request to /api/groq/insights
2. WHEN the API receives a request, THE System SHALL validate that the scores object contains all 7 dimensions
3. WHEN scores are validated, THE System SHALL construct a Groq prompt including all 7 dimension values and archetype
4. WHEN the prompt is ready, THE System SHALL call Groq_API with model "mixtral-8x7b-32768" and timeout of 3000 milliseconds
5. WHEN Groq_API responds, THE System SHALL verify status 200 and extract text from response
6. WHEN Groq_API responds, THE System SHALL validate that response text exceeds 50 characters
7. WHEN insights are extracted, THE System SHALL return the text to the frontend
8. IF Groq_API times out, THEN THE System SHALL return fallback text "Generating insights for you..."
9. IF Groq_API errors, THEN THE System SHALL log the error to console, return fallback text, and not throw an error
10. WHEN insights are returned, THE System SHALL display them with a fade-in animation
11. WHEN a user refreshes the page, THE System SHALL not re-query Groq_API if insights are cached in state
12. WHEN insights are displayed, THE System SHALL show attribution text "Generated by AI psychologist"

### Requirement 7: Error Handling and Edge Cases

**User Story:** As a young founder, I want graceful error handling, so that technical issues do not ruin my assessment experience.

#### Acceptance Criteria

1. IF MongoDB connection fails, THEN THE System SHALL display "Connection error. Refresh." and log to console
2. IF input validation fails, THEN THE System SHALL display "Invalid response. Try again." and preserve existing answers
3. IF Groq_API fails, THEN THE System SHALL continue displaying results without insights
4. IF a user double-submits, THEN THE System SHALL debounce and submit only once
5. IF API returns status 400, THEN THE System SHALL display "Invalid submission. Refresh."
6. IF API returns status 500, THEN THE System SHALL display "Server error. Try again later."
7. IF network timeout exceeds 5 seconds, THEN THE System SHALL display "Network timeout. Check connection." with a retry button
8. IF user goes offline mid-quiz, THEN THE System SHALL save answers to local storage and resume when online
9. IF data becomes corrupted, THEN THE System SHALL allow the user to start a new assessment via "Start New" button
10. WHEN any error occurs, THE System SHALL log the full error to console without exposing internals to the user
