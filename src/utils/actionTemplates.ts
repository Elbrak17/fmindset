/**
 * Action templates organized by dimension and archetype
 * Used for generating personalized daily micro-actions
 */

import type { ArchetypeName } from '../types/assessment';

// Action category type (matches schema enum)
export type ActionCategory = 'mindfulness' | 'social' | 'physical' | 'professional' | 'rest';

// Psychological dimension type
export type Dimension = 
  | 'imposterSyndrome'
  | 'founderDoubt'
  | 'identityFusion'
  | 'fearOfRejection'
  | 'isolationLevel'
  | 'stress'
  | 'energy'
  | 'mood';

// Action template structure
export interface ActionTemplate {
  text: string;
  category: ActionCategory;
  targetDimension: Dimension;
}

/**
 * Action templates organized by target dimension
 * Each dimension has multiple actions to choose from
 */
export const DIMENSION_ACTIONS: Record<Dimension, ActionTemplate[]> = {
  imposterSyndrome: [
    { text: 'Write down 3 accomplishments from this week', category: 'mindfulness', targetDimension: 'imposterSyndrome' },
    { text: 'Share a recent win with a trusted friend or mentor', category: 'social', targetDimension: 'imposterSyndrome' },
    { text: 'Review positive feedback you\'ve received recently', category: 'mindfulness', targetDimension: 'imposterSyndrome' },
    { text: 'Document one skill you\'ve improved this month', category: 'professional', targetDimension: 'imposterSyndrome' },
    { text: 'Remind yourself: everyone starts somewhere', category: 'mindfulness', targetDimension: 'imposterSyndrome' },
  ],
  founderDoubt: [
    { text: 'Revisit your original vision and why you started', category: 'mindfulness', targetDimension: 'founderDoubt' },
    { text: 'Talk to a customer about the value you provide', category: 'social', targetDimension: 'founderDoubt' },
    { text: 'List 3 problems your product solves', category: 'professional', targetDimension: 'founderDoubt' },
    { text: 'Read a founder success story for inspiration', category: 'rest', targetDimension: 'founderDoubt' },
    { text: 'Celebrate one small milestone today', category: 'mindfulness', targetDimension: 'founderDoubt' },
  ],
  identityFusion: [
    { text: 'Spend 30 minutes on a hobby unrelated to work', category: 'rest', targetDimension: 'identityFusion' },
    { text: 'Have a conversation without mentioning your startup', category: 'social', targetDimension: 'identityFusion' },
    { text: 'Write about who you are outside of being a founder', category: 'mindfulness', targetDimension: 'identityFusion' },
    { text: 'Reconnect with an old friend from before your startup', category: 'social', targetDimension: 'identityFusion' },
    { text: 'Take a walk without checking your phone', category: 'physical', targetDimension: 'identityFusion' },
  ],
  fearOfRejection: [
    { text: 'Reach out to one potential customer or partner', category: 'professional', targetDimension: 'fearOfRejection' },
    { text: 'Ask for feedback on something small', category: 'social', targetDimension: 'fearOfRejection' },
    { text: 'Reframe a past rejection as a learning opportunity', category: 'mindfulness', targetDimension: 'fearOfRejection' },
    { text: 'Practice a pitch with a supportive friend', category: 'social', targetDimension: 'fearOfRejection' },
    { text: 'Remember: rejection is redirection, not failure', category: 'mindfulness', targetDimension: 'fearOfRejection' },
  ],
  isolationLevel: [
    { text: 'Message a fellow founder to check in', category: 'social', targetDimension: 'isolationLevel' },
    { text: 'Join an online founder community discussion', category: 'social', targetDimension: 'isolationLevel' },
    { text: 'Schedule a virtual coffee with someone in your network', category: 'social', targetDimension: 'isolationLevel' },
    { text: 'Attend a local meetup or networking event', category: 'social', targetDimension: 'isolationLevel' },
    { text: 'Share a challenge you\'re facing with your support network', category: 'social', targetDimension: 'isolationLevel' },
  ],
  stress: [
    { text: 'Take 5 deep breaths right now', category: 'mindfulness', targetDimension: 'stress' },
    { text: 'Go for a 15-minute walk outside', category: 'physical', targetDimension: 'stress' },
    { text: 'Do a 10-minute guided meditation', category: 'mindfulness', targetDimension: 'stress' },
    { text: 'Write down what\'s stressing you and one action to address it', category: 'mindfulness', targetDimension: 'stress' },
    { text: 'Take a proper lunch break away from your desk', category: 'rest', targetDimension: 'stress' },
  ],
  energy: [
    { text: 'Take a 20-minute power nap', category: 'rest', targetDimension: 'energy' },
    { text: 'Do 10 minutes of stretching or light exercise', category: 'physical', targetDimension: 'energy' },
    { text: 'Drink a full glass of water right now', category: 'physical', targetDimension: 'energy' },
    { text: 'Step outside for fresh air and sunlight', category: 'physical', targetDimension: 'energy' },
    { text: 'Set a firm end time for work today', category: 'rest', targetDimension: 'energy' },
  ],
  mood: [
    { text: 'Listen to a song that makes you happy', category: 'rest', targetDimension: 'mood' },
    { text: 'Write down 3 things you\'re grateful for', category: 'mindfulness', targetDimension: 'mood' },
    { text: 'Call or text someone who makes you smile', category: 'social', targetDimension: 'mood' },
    { text: 'Watch a short funny video for a quick laugh', category: 'rest', targetDimension: 'mood' },
    { text: 'Do something kind for someone else today', category: 'social', targetDimension: 'mood' },
  ],
};


/**
 * Archetype-specific action templates
 * These are tailored to the specific challenges of each archetype
 */
export const ARCHETYPE_ACTIONS: Record<ArchetypeName, ActionTemplate[]> = {
  'Perfectionist Builder': [
    { text: 'Ship something imperfect today - done is better than perfect', category: 'professional', targetDimension: 'imposterSyndrome' },
    { text: 'Set a time limit on a task and stop when it\'s up', category: 'professional', targetDimension: 'stress' },
    { text: 'Ask for feedback before you think it\'s ready', category: 'social', targetDimension: 'fearOfRejection' },
  ],
  'Opportunistic Visionary': [
    { text: 'Seek out one piece of critical feedback today', category: 'social', targetDimension: 'founderDoubt' },
    { text: 'Consult with an advisor before making a big decision', category: 'professional', targetDimension: 'founderDoubt' },
    { text: 'Write down potential risks of your current plan', category: 'mindfulness', targetDimension: 'founderDoubt' },
  ],
  'Isolated Dreamer': [
    { text: 'Reach out to one person in your network today', category: 'social', targetDimension: 'isolationLevel' },
    { text: 'Share your current challenge with someone who can help', category: 'social', targetDimension: 'isolationLevel' },
    { text: 'Join a founder community or forum discussion', category: 'social', targetDimension: 'isolationLevel' },
  ],
  'Burning Out': [
    { text: 'Take a real break - no screens for 30 minutes', category: 'rest', targetDimension: 'stress' },
    { text: 'Reach out to a mental health professional or trusted mentor', category: 'social', targetDimension: 'stress' },
    { text: 'Delegate or postpone one task today', category: 'professional', targetDimension: 'energy' },
  ],
  'Self-Assured Hustler': [
    { text: 'Ask someone for honest feedback on a blind spot', category: 'social', targetDimension: 'founderDoubt' },
    { text: 'Listen more than you speak in your next conversation', category: 'social', targetDimension: 'fearOfRejection' },
    { text: 'Consider an alternative perspective on a decision', category: 'mindfulness', targetDimension: 'founderDoubt' },
  ],
  'Community-Driven': [
    { text: 'Make a decision today without consulting others', category: 'professional', targetDimension: 'founderDoubt' },
    { text: 'Trust your gut on something small', category: 'mindfulness', targetDimension: 'imposterSyndrome' },
    { text: 'Spend time working alone without interruptions', category: 'professional', targetDimension: 'identityFusion' },
  ],
  'Balanced Founder': [
    { text: 'Document what\'s keeping you balanced right now', category: 'mindfulness', targetDimension: 'mood' },
    { text: 'Share your balance strategies with another founder', category: 'social', targetDimension: 'isolationLevel' },
    { text: 'Plan something fun for the weekend', category: 'rest', targetDimension: 'energy' },
  ],
  'Growth Seeker': [
    { text: 'Learn something new related to your business today', category: 'professional', targetDimension: 'founderDoubt' },
    { text: 'Reflect on a recent challenge and what you learned', category: 'mindfulness', targetDimension: 'imposterSyndrome' },
    { text: 'Set one small growth goal for this week', category: 'professional', targetDimension: 'mood' },
  ],
};

/**
 * General wellness actions that apply to everyone
 * Used to fill out action plans when specific needs are met
 */
export const GENERAL_WELLNESS_ACTIONS: ActionTemplate[] = [
  { text: 'Take a 5-minute mindfulness break', category: 'mindfulness', targetDimension: 'stress' },
  { text: 'Drink water and have a healthy snack', category: 'physical', targetDimension: 'energy' },
  { text: 'Step away from screens for 10 minutes', category: 'rest', targetDimension: 'energy' },
  { text: 'Write down your top 3 priorities for tomorrow', category: 'professional', targetDimension: 'stress' },
  { text: 'End work at a reasonable hour today', category: 'rest', targetDimension: 'energy' },
  { text: 'Express gratitude to someone who helped you', category: 'social', targetDimension: 'mood' },
  { text: 'Review your wins from this week', category: 'mindfulness', targetDimension: 'imposterSyndrome' },
  { text: 'Do something that brings you joy', category: 'rest', targetDimension: 'mood' },
];

/**
 * Get all available actions for a specific dimension
 */
export function getActionsForDimension(dimension: Dimension): ActionTemplate[] {
  return DIMENSION_ACTIONS[dimension] || [];
}

/**
 * Get archetype-specific actions
 */
export function getActionsForArchetype(archetype: ArchetypeName): ActionTemplate[] {
  return ARCHETYPE_ACTIONS[archetype] || [];
}

/**
 * Get all action templates (for testing/debugging)
 */
export function getAllActionTemplates(): ActionTemplate[] {
  const allActions: ActionTemplate[] = [];
  
  // Add dimension actions
  Object.values(DIMENSION_ACTIONS).forEach(actions => {
    allActions.push(...actions);
  });
  
  // Add archetype actions
  Object.values(ARCHETYPE_ACTIONS).forEach(actions => {
    allActions.push(...actions);
  });
  
  // Add general wellness actions
  allActions.push(...GENERAL_WELLNESS_ACTIONS);
  
  return allActions;
}
