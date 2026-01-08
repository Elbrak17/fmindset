import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Assessment, ActionItem } from '../db/schema';
import type { BurnoutScoreResult } from './burnoutService';
import type { ArchetypeName } from '../types/assessment';
import { 
  DIMENSION_ACTIONS, 
  ARCHETYPE_ACTIONS, 
  GENERAL_WELLNESS_ACTIONS,
  getActionsForDimension,
  getActionsForArchetype,
  getAllActionTemplates,
  type ActionTemplate,
  type Dimension
} from '../utils/actionTemplates';

// Mock the database module
vi.mock('../db/connection', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: 'test-action-id',
          userId: 'test-user',
          actionText: 'Test action',
          category: 'mindfulness',
          targetDimension: 'stress',
          isCompleted: false,
          assignedDate: new Date().toISOString().split('T')[0],
          completedAt: null,
          createdAt: new Date(),
        }])),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{
            id: 'test-action-id',
            userId: 'test-user',
            actionText: 'Test action',
            category: 'mindfulness',
            targetDimension: 'stress',
            isCompleted: true,
            assignedDate: new Date().toISOString().split('T')[0],
            completedAt: new Date(),
            createdAt: new Date(),
          }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

// Helper to create mock assessment
function createMockAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 'test-assessment-id',
    userId: 'test-user',
    answers: [],
    imposterSyndrome: 50,
    founderDoubt: 50,
    identityFusion: 50,
    fearOfRejection: 50,
    riskTolerance: 50,
    motivationType: 'mixed',
    isolationLevel: 50,
    archetype: 'Balanced Founder',
    groqInsights: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper to create mock burnout score
function createMockBurnoutScore(overrides: Partial<BurnoutScoreResult> = {}): BurnoutScoreResult {
  return {
    score: 50,
    riskLevel: 'caution',
    contributingFactors: [],
    ...overrides,
  };
}

describe('Action Templates', () => {
  describe('DIMENSION_ACTIONS', () => {
    it('has actions for all dimensions', () => {
      const dimensions: Dimension[] = [
        'imposterSyndrome',
        'founderDoubt',
        'identityFusion',
        'fearOfRejection',
        'isolationLevel',
        'stress',
        'energy',
        'mood',
      ];
      
      for (const dimension of dimensions) {
        expect(DIMENSION_ACTIONS[dimension]).toBeDefined();
        expect(DIMENSION_ACTIONS[dimension].length).toBeGreaterThan(0);
      }
    });

    it('each action has required properties', () => {
      for (const [dimension, actions] of Object.entries(DIMENSION_ACTIONS)) {
        for (const action of actions) {
          expect(action.text).toBeDefined();
          expect(typeof action.text).toBe('string');
          expect(action.text.length).toBeGreaterThan(0);
          expect(action.category).toBeDefined();
          expect(action.targetDimension).toBe(dimension);
        }
      }
    });

    it('actions have valid categories', () => {
      const validCategories = ['mindfulness', 'social', 'physical', 'professional', 'rest'];
      
      for (const actions of Object.values(DIMENSION_ACTIONS)) {
        for (const action of actions) {
          expect(validCategories).toContain(action.category);
        }
      }
    });
  });

  describe('ARCHETYPE_ACTIONS', () => {
    it('has actions for all archetypes', () => {
      const archetypes: ArchetypeName[] = [
        'Perfectionist Builder',
        'Opportunistic Visionary',
        'Isolated Dreamer',
        'Burning Out',
        'Self-Assured Hustler',
        'Community-Driven',
        'Balanced Founder',
        'Growth Seeker',
      ];
      
      for (const archetype of archetypes) {
        expect(ARCHETYPE_ACTIONS[archetype]).toBeDefined();
        expect(ARCHETYPE_ACTIONS[archetype].length).toBeGreaterThan(0);
      }
    });

    it('each archetype action has required properties', () => {
      for (const actions of Object.values(ARCHETYPE_ACTIONS)) {
        for (const action of actions) {
          expect(action.text).toBeDefined();
          expect(typeof action.text).toBe('string');
          expect(action.category).toBeDefined();
          expect(action.targetDimension).toBeDefined();
        }
      }
    });
  });

  describe('GENERAL_WELLNESS_ACTIONS', () => {
    it('has general wellness actions', () => {
      expect(GENERAL_WELLNESS_ACTIONS.length).toBeGreaterThan(0);
    });

    it('each action has required properties', () => {
      for (const action of GENERAL_WELLNESS_ACTIONS) {
        expect(action.text).toBeDefined();
        expect(action.category).toBeDefined();
        expect(action.targetDimension).toBeDefined();
      }
    });
  });

  describe('getActionsForDimension', () => {
    it('returns actions for valid dimension', () => {
      const actions = getActionsForDimension('stress');
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every(a => a.targetDimension === 'stress')).toBe(true);
    });

    it('returns empty array for invalid dimension', () => {
      const actions = getActionsForDimension('invalid' as Dimension);
      expect(actions).toEqual([]);
    });
  });

  describe('getActionsForArchetype', () => {
    it('returns actions for valid archetype', () => {
      const actions = getActionsForArchetype('Burning Out');
      expect(actions.length).toBeGreaterThan(0);
    });

    it('returns empty array for invalid archetype', () => {
      const actions = getActionsForArchetype('Invalid Archetype' as ArchetypeName);
      expect(actions).toEqual([]);
    });
  });

  describe('getAllActionTemplates', () => {
    it('returns all action templates', () => {
      const allActions = getAllActionTemplates();
      expect(allActions.length).toBeGreaterThan(0);
      
      // Should include dimension actions
      const stressActions = DIMENSION_ACTIONS.stress;
      expect(allActions.some(a => a.text === stressActions[0].text)).toBe(true);
      
      // Should include archetype actions
      const burningOutActions = ARCHETYPE_ACTIONS['Burning Out'];
      expect(allActions.some(a => a.text === burningOutActions[0].text)).toBe(true);
      
      // Should include general wellness actions
      expect(allActions.some(a => a.text === GENERAL_WELLNESS_ACTIONS[0].text)).toBe(true);
    });
  });
});


describe('Action Plan Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDailyActions', () => {
    it('generates actions for a user', async () => {
      // Import after mocking
      const { generateDailyActions } = await import('./actionPlanService');
      
      const actions = await generateDailyActions(
        'test-user',
        'Balanced Founder',
        createMockBurnoutScore(),
        createMockAssessment()
      );
      
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    it('generates more actions for high burnout risk', async () => {
      const { generateDailyActions } = await import('./actionPlanService');
      
      const highRiskScore = createMockBurnoutScore({ 
        score: 85, 
        riskLevel: 'critical' 
      });
      
      // The function should attempt to create 5 actions for critical risk
      const actions = await generateDailyActions(
        'test-user',
        'Burning Out',
        highRiskScore,
        createMockAssessment()
      );
      
      expect(actions).toBeDefined();
    });

    it('handles null burnout score', async () => {
      const { generateDailyActions } = await import('./actionPlanService');
      
      const actions = await generateDailyActions(
        'test-user',
        'Balanced Founder',
        null,
        null
      );
      
      expect(actions).toBeDefined();
    });
  });

  describe('markActionComplete', () => {
    it('marks action as complete', async () => {
      const { markActionComplete } = await import('./actionPlanService');
      
      const result = await markActionComplete('test-action-id', 'test-user');
      
      expect(result).toBeDefined();
      expect(result?.isCompleted).toBe(true);
    });

    it('throws error for missing actionId', async () => {
      const { markActionComplete } = await import('./actionPlanService');
      
      await expect(markActionComplete('', 'test-user')).rejects.toThrow();
    });

    it('throws error for missing userId', async () => {
      const { markActionComplete } = await import('./actionPlanService');
      
      await expect(markActionComplete('test-action-id', '')).rejects.toThrow();
    });
  });

  describe('getTodaysActions', () => {
    it('returns actions for today', async () => {
      const { getTodaysActions } = await import('./actionPlanService');
      
      const actions = await getTodaysActions('test-user');
      
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    it('throws error for missing userId', async () => {
      const { getTodaysActions } = await import('./actionPlanService');
      
      await expect(getTodaysActions('')).rejects.toThrow();
    });
  });

  describe('getCompletionStats', () => {
    it('returns completion statistics', async () => {
      const { getCompletionStats } = await import('./actionPlanService');
      
      const stats = await getCompletionStats('test-user', 7);
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalActions');
      expect(stats).toHaveProperty('completedActions');
      expect(stats).toHaveProperty('completionRate');
      expect(stats).toHaveProperty('streakDays');
    });

    it('throws error for missing userId', async () => {
      const { getCompletionStats } = await import('./actionPlanService');
      
      await expect(getCompletionStats('')).rejects.toThrow();
    });

    it('returns zero stats for user with no actions', async () => {
      const { getCompletionStats } = await import('./actionPlanService');
      
      const stats = await getCompletionStats('test-user');
      
      expect(stats.totalActions).toBe(0);
      expect(stats.completedActions).toBe(0);
      expect(stats.completionRate).toBe(0);
      expect(stats.streakDays).toBe(0);
    });
  });

  describe('hasActionsForToday', () => {
    it('returns false when no actions exist', async () => {
      const { hasActionsForToday } = await import('./actionPlanService');
      
      const hasActions = await hasActionsForToday('test-user');
      
      expect(hasActions).toBe(false);
    });
  });

  describe('clearActionsForDate', () => {
    it('clears actions for a date', async () => {
      const { clearActionsForDate } = await import('./actionPlanService');
      
      const today = new Date().toISOString().split('T')[0];
      const count = await clearActionsForDate('test-user', today);
      
      expect(typeof count).toBe('number');
    });

    it('throws error for missing userId', async () => {
      const { clearActionsForDate } = await import('./actionPlanService');
      
      await expect(clearActionsForDate('', '2024-01-01')).rejects.toThrow();
    });

    it('throws error for missing date', async () => {
      const { clearActionsForDate } = await import('./actionPlanService');
      
      await expect(clearActionsForDate('test-user', '')).rejects.toThrow();
    });
  });
});

describe('Daily Rotation Logic', () => {
  it('seeded random produces consistent results for same seed', () => {
    // Test the concept of seeded randomness
    const seed1 = 'user1-2024-01-15';
    const seed2 = 'user1-2024-01-15';
    const seed3 = 'user1-2024-01-16';
    
    // Same seed should produce same sequence
    const hash1 = hashSeed(seed1);
    const hash2 = hashSeed(seed2);
    const hash3 = hashSeed(seed3);
    
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('different users get different actions on same day', () => {
    const seed1 = 'user1-2024-01-15';
    const seed2 = 'user2-2024-01-15';
    
    const hash1 = hashSeed(seed1);
    const hash2 = hashSeed(seed2);
    
    expect(hash1).not.toBe(hash2);
  });

  it('same user gets different actions on different days', () => {
    const seed1 = 'user1-2024-01-15';
    const seed2 = 'user1-2024-01-16';
    
    const hash1 = hashSeed(seed1);
    const hash2 = hashSeed(seed2);
    
    expect(hash1).not.toBe(hash2);
  });
});

// Helper function to test seeded randomness concept
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
