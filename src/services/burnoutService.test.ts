import { describe, it, expect } from 'vitest';
import { 
  calculateBurnoutScore, 
  getRiskLevel, 
  getContributingFactors,
  type RiskLevel,
  type BurnoutScoreResult
} from './burnoutService';
import type { JournalEntry, Assessment } from '../db/schema';

// Helper to create mock journal entries
function createMockJournalEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'test-id-' + Math.random().toString(36).substr(2, 9),
    userId: 'test-user',
    mood: 50,
    energy: 50,
    stress: 50,
    notes: null,
    entryDate: new Date().toISOString().split('T')[0],
    isSynced: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

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

describe('getRiskLevel', () => {
  describe('low risk level (0-40)', () => {
    it('returns low for score 0', () => {
      expect(getRiskLevel(0)).toBe('low');
    });

    it('returns low for score 20', () => {
      expect(getRiskLevel(20)).toBe('low');
    });

    it('returns low for score 40 (boundary)', () => {
      expect(getRiskLevel(40)).toBe('low');
    });
  });

  describe('caution risk level (41-60)', () => {
    it('returns caution for score 41 (boundary)', () => {
      expect(getRiskLevel(41)).toBe('caution');
    });

    it('returns caution for score 50', () => {
      expect(getRiskLevel(50)).toBe('caution');
    });

    it('returns caution for score 60 (boundary)', () => {
      expect(getRiskLevel(60)).toBe('caution');
    });
  });

  describe('high risk level (61-80)', () => {
    it('returns high for score 61 (boundary)', () => {
      expect(getRiskLevel(61)).toBe('high');
    });

    it('returns high for score 70', () => {
      expect(getRiskLevel(70)).toBe('high');
    });

    it('returns high for score 80 (boundary)', () => {
      expect(getRiskLevel(80)).toBe('high');
    });
  });

  describe('critical risk level (81-100)', () => {
    it('returns critical for score 81 (boundary)', () => {
      expect(getRiskLevel(81)).toBe('critical');
    });

    it('returns critical for score 90', () => {
      expect(getRiskLevel(90)).toBe('critical');
    });

    it('returns critical for score 100', () => {
      expect(getRiskLevel(100)).toBe('critical');
    });
  });

  describe('edge cases', () => {
    it('clamps negative scores to low', () => {
      expect(getRiskLevel(-10)).toBe('low');
    });

    it('clamps scores above 100 to critical', () => {
      expect(getRiskLevel(150)).toBe('critical');
    });
  });
});


describe('getContributingFactors', () => {
  describe('journal-based factors', () => {
    it('identifies low mood as contributing factor', () => {
      const entry = createMockJournalEntry({ mood: 30, energy: 60, stress: 40 });
      const factors = getContributingFactors(entry);
      expect(factors).toContain('Low mood levels');
    });

    it('identifies low energy as contributing factor', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 30, stress: 40 });
      const factors = getContributingFactors(entry);
      expect(factors).toContain('Low energy levels');
    });

    it('identifies high stress as contributing factor', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 60, stress: 80 });
      const factors = getContributingFactors(entry);
      expect(factors).toContain('High stress levels');
    });

    it('returns empty array for healthy journal values', () => {
      const entry = createMockJournalEntry({ mood: 70, energy: 70, stress: 30 });
      const factors = getContributingFactors(entry);
      expect(factors).toHaveLength(0);
    });

    it('identifies multiple journal factors', () => {
      const entry = createMockJournalEntry({ mood: 20, energy: 20, stress: 90 });
      const factors = getContributingFactors(entry);
      expect(factors).toContain('Low mood levels');
      expect(factors).toContain('Low energy levels');
      expect(factors).toContain('High stress levels');
    });
  });

  describe('assessment-based factors', () => {
    it('identifies high imposter syndrome', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 60, stress: 40 });
      const assessment = createMockAssessment({ imposterSyndrome: 80 });
      const factors = getContributingFactors(entry, assessment);
      expect(factors).toContain('High imposter syndrome');
    });

    it('identifies high founder doubt', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 60, stress: 40 });
      const assessment = createMockAssessment({ founderDoubt: 75 });
      const factors = getContributingFactors(entry, assessment);
      expect(factors).toContain('High founder doubt');
    });

    it('identifies high identity fusion', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 60, stress: 40 });
      const assessment = createMockAssessment({ identityFusion: 85 });
      const factors = getContributingFactors(entry, assessment);
      expect(factors).toContain('High identity fusion with startup');
    });

    it('identifies high fear of rejection', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 60, stress: 40 });
      const assessment = createMockAssessment({ fearOfRejection: 90 });
      const factors = getContributingFactors(entry, assessment);
      expect(factors).toContain('High fear of rejection');
    });

    it('identifies high isolation level', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 60, stress: 40 });
      const assessment = createMockAssessment({ isolationLevel: 80 });
      const factors = getContributingFactors(entry, assessment);
      expect(factors).toContain('High isolation level');
    });

    it('does not flag dimensions at exactly 70', () => {
      const entry = createMockJournalEntry({ mood: 60, energy: 60, stress: 40 });
      const assessment = createMockAssessment({ imposterSyndrome: 70 });
      const factors = getContributingFactors(entry, assessment);
      expect(factors).not.toContain('High imposter syndrome');
    });
  });

  describe('combined factors', () => {
    it('combines journal and assessment factors', () => {
      const entry = createMockJournalEntry({ mood: 30, energy: 60, stress: 80 });
      const assessment = createMockAssessment({ imposterSyndrome: 85, isolationLevel: 75 });
      const factors = getContributingFactors(entry, assessment);
      
      expect(factors).toContain('Low mood levels');
      expect(factors).toContain('High stress levels');
      expect(factors).toContain('High imposter syndrome');
      expect(factors).toContain('High isolation level');
    });
  });
});


describe('calculateBurnoutScore', () => {
  describe('base score calculation from journal', () => {
    it('calculates score for neutral values (50/50/50)', () => {
      const entry = createMockJournalEntry({ mood: 50, energy: 50, stress: 50 });
      const result = calculateBurnoutScore(entry);
      
      // Base: (100-50)*0.3 + (100-50)*0.3 + 50*0.4 = 15 + 15 + 20 = 50
      expect(result.score).toBe(50);
      expect(result.riskLevel).toBe('caution');
    });

    it('calculates low score for positive values', () => {
      const entry = createMockJournalEntry({ mood: 90, energy: 90, stress: 10 });
      const result = calculateBurnoutScore(entry);
      
      // Base: (100-90)*0.3 + (100-90)*0.3 + 10*0.4 = 3 + 3 + 4 = 10
      expect(result.score).toBe(10);
      expect(result.riskLevel).toBe('low');
    });

    it('calculates high score for negative values', () => {
      const entry = createMockJournalEntry({ mood: 20, energy: 20, stress: 90 });
      const result = calculateBurnoutScore(entry);
      
      // Base: (100-20)*0.3 + (100-20)*0.3 + 90*0.4 = 24 + 24 + 36 = 84
      expect(result.score).toBe(84);
      expect(result.riskLevel).toBe('critical');
    });

    it('calculates maximum score for worst values', () => {
      const entry = createMockJournalEntry({ mood: 0, energy: 0, stress: 100 });
      const result = calculateBurnoutScore(entry);
      
      // Base: (100-0)*0.3 + (100-0)*0.3 + 100*0.4 = 30 + 30 + 40 = 100
      expect(result.score).toBe(100);
      expect(result.riskLevel).toBe('critical');
    });

    it('calculates minimum score for best values', () => {
      const entry = createMockJournalEntry({ mood: 100, energy: 100, stress: 0 });
      const result = calculateBurnoutScore(entry);
      
      // Base: (100-100)*0.3 + (100-100)*0.3 + 0*0.4 = 0
      expect(result.score).toBe(0);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('assessment modifiers', () => {
    it('adds modifier for high imposter syndrome', () => {
      const entry = createMockJournalEntry({ mood: 70, energy: 70, stress: 30 });
      const assessment = createMockAssessment({ imposterSyndrome: 80 });
      
      const withoutAssessment = calculateBurnoutScore(entry);
      const withAssessment = calculateBurnoutScore(entry, assessment);
      
      expect(withAssessment.score).toBe(withoutAssessment.score + 10);
    });

    it('adds modifiers for multiple high dimensions', () => {
      const entry = createMockJournalEntry({ mood: 70, energy: 70, stress: 30 });
      const assessment = createMockAssessment({ 
        imposterSyndrome: 80, 
        founderDoubt: 75,
        isolationLevel: 85 
      });
      
      const withoutAssessment = calculateBurnoutScore(entry);
      const withAssessment = calculateBurnoutScore(entry, assessment);
      
      // 3 dimensions above 70 = +30
      expect(withAssessment.score).toBe(withoutAssessment.score + 30);
    });

    it('does not add modifier for riskTolerance', () => {
      const entry = createMockJournalEntry({ mood: 70, energy: 70, stress: 30 });
      const assessment = createMockAssessment({ riskTolerance: 90 });
      
      const withoutAssessment = calculateBurnoutScore(entry);
      const withAssessment = calculateBurnoutScore(entry, assessment);
      
      // riskTolerance should not add modifier
      expect(withAssessment.score).toBe(withoutAssessment.score);
    });

    it('handles null assessment', () => {
      const entry = createMockJournalEntry({ mood: 50, energy: 50, stress: 50 });
      const result = calculateBurnoutScore(entry, null);
      
      expect(result.score).toBe(50);
    });
  });

  describe('trend modifiers', () => {
    it('adds modifier for declining mood trend', () => {
      const entry = createMockJournalEntry({ mood: 70, energy: 70, stress: 30 });
      const trends = { 
        moodAvg: 60, energyAvg: 70, stressAvg: 30,
        moodTrend: 'declining' as const, 
        energyTrend: 'stable' as const, 
        stressTrend: 'stable' as const 
      };
      
      const withoutTrends = calculateBurnoutScore(entry);
      const withTrends = calculateBurnoutScore(entry, null, trends);
      
      expect(withTrends.score).toBe(withoutTrends.score + 5);
    });

    it('adds modifier for declining energy trend', () => {
      const entry = createMockJournalEntry({ mood: 70, energy: 70, stress: 30 });
      const trends = { 
        moodAvg: 70, energyAvg: 60, stressAvg: 30,
        moodTrend: 'stable' as const, 
        energyTrend: 'declining' as const, 
        stressTrend: 'stable' as const 
      };
      
      const withoutTrends = calculateBurnoutScore(entry);
      const withTrends = calculateBurnoutScore(entry, null, trends);
      
      expect(withTrends.score).toBe(withoutTrends.score + 5);
    });

    it('does not add modifier for improving trends', () => {
      const entry = createMockJournalEntry({ mood: 70, energy: 70, stress: 30 });
      const trends = { 
        moodAvg: 70, energyAvg: 70, stressAvg: 30,
        moodTrend: 'improving' as const, 
        energyTrend: 'improving' as const, 
        stressTrend: 'improving' as const 
      };
      
      const withoutTrends = calculateBurnoutScore(entry);
      const withTrends = calculateBurnoutScore(entry, null, trends);
      
      expect(withTrends.score).toBe(withoutTrends.score);
    });
  });

  describe('score clamping', () => {
    it('clamps score to maximum 100', () => {
      const entry = createMockJournalEntry({ mood: 0, energy: 0, stress: 100 });
      const assessment = createMockAssessment({ 
        imposterSyndrome: 90, 
        founderDoubt: 90,
        identityFusion: 90,
        fearOfRejection: 90,
        isolationLevel: 90 
      });
      const trends = { 
        moodAvg: 20, energyAvg: 20, stressAvg: 80,
        moodTrend: 'declining' as const, 
        energyTrend: 'declining' as const, 
        stressTrend: 'declining' as const 
      };
      
      const result = calculateBurnoutScore(entry, assessment, trends);
      
      // Base 100 + 50 (5 dimensions) + 5 (trends) = 155, clamped to 100
      expect(result.score).toBe(100);
      expect(result.riskLevel).toBe('critical');
    });
  });

  describe('result structure', () => {
    it('returns complete result object', () => {
      const entry = createMockJournalEntry({ mood: 30, energy: 40, stress: 70 });
      const assessment = createMockAssessment({ imposterSyndrome: 80 });
      
      const result = calculateBurnoutScore(entry, assessment);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('contributingFactors');
      expect(typeof result.score).toBe('number');
      expect(['low', 'caution', 'high', 'critical']).toContain(result.riskLevel);
      expect(Array.isArray(result.contributingFactors)).toBe(true);
    });

    it('includes contributing factors in result', () => {
      const entry = createMockJournalEntry({ mood: 30, energy: 60, stress: 80 });
      const assessment = createMockAssessment({ imposterSyndrome: 85 });
      
      const result = calculateBurnoutScore(entry, assessment);
      
      expect(result.contributingFactors).toContain('Low mood levels');
      expect(result.contributingFactors).toContain('High stress levels');
      expect(result.contributingFactors).toContain('High imposter syndrome');
    });
  });
});
