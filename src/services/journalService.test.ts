import { describe, it, expect } from 'vitest';
import { 
  validateJournalInput, 
  calculateTrends, 
  JournalValidationError,
  type JournalEntryInput,
  type TrendData
} from './journalService';
import type { JournalEntry } from '../db/schema';

// Helper to create mock journal entries
function createMockEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
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

describe('validateJournalInput', () => {
  describe('userId validation', () => {
    it('throws error for missing userId', () => {
      const input = { mood: 50, energy: 50, stress: 50 } as JournalEntryInput;
      expect(() => validateJournalInput(input)).toThrow(JournalValidationError);
      expect(() => validateJournalInput(input)).toThrow('userId is required');
    });

    it('throws error for empty userId', () => {
      const input: JournalEntryInput = { userId: '', mood: 50, energy: 50, stress: 50 };
      expect(() => validateJournalInput(input)).toThrow(JournalValidationError);
    });

    it('throws error for whitespace-only userId', () => {
      const input: JournalEntryInput = { userId: '   ', mood: 50, energy: 50, stress: 50 };
      expect(() => validateJournalInput(input)).toThrow(JournalValidationError);
    });
  });

  describe('mood validation', () => {
    it('throws error for non-number mood', () => {
      const input = { userId: 'user1', mood: 'high' as any, energy: 50, stress: 50 };
      expect(() => validateJournalInput(input)).toThrow('mood must be a number');
    });

    it('throws error for mood below 0', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: -1, energy: 50, stress: 50 };
      expect(() => validateJournalInput(input)).toThrow('mood must be between 0 and 100');
    });

    it('throws error for mood above 100', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: 101, energy: 50, stress: 50 };
      expect(() => validateJournalInput(input)).toThrow('mood must be between 0 and 100');
    });

    it('accepts mood at boundary values', () => {
      expect(() => validateJournalInput({ userId: 'user1', mood: 0, energy: 50, stress: 50 })).not.toThrow();
      expect(() => validateJournalInput({ userId: 'user1', mood: 100, energy: 50, stress: 50 })).not.toThrow();
    });
  });

  describe('energy validation', () => {
    it('throws error for energy below 0', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: 50, energy: -5, stress: 50 };
      expect(() => validateJournalInput(input)).toThrow('energy must be between 0 and 100');
    });

    it('throws error for energy above 100', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: 50, energy: 150, stress: 50 };
      expect(() => validateJournalInput(input)).toThrow('energy must be between 0 and 100');
    });
  });

  describe('stress validation', () => {
    it('throws error for stress below 0', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: 50, energy: 50, stress: -10 };
      expect(() => validateJournalInput(input)).toThrow('stress must be between 0 and 100');
    });

    it('throws error for stress above 100', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: 50, energy: 50, stress: 200 };
      expect(() => validateJournalInput(input)).toThrow('stress must be between 0 and 100');
    });
  });

  describe('notes validation', () => {
    it('accepts undefined notes', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: 50, energy: 50, stress: 50 };
      expect(() => validateJournalInput(input)).not.toThrow();
    });

    it('accepts empty string notes', () => {
      const input: JournalEntryInput = { userId: 'user1', mood: 50, energy: 50, stress: 50, notes: '' };
      expect(() => validateJournalInput(input)).not.toThrow();
    });

    it('accepts notes within limit', () => {
      const input: JournalEntryInput = { 
        userId: 'user1', 
        mood: 50, 
        energy: 50, 
        stress: 50, 
        notes: 'A'.repeat(500) 
      };
      expect(() => validateJournalInput(input)).not.toThrow();
    });

    it('throws error for notes exceeding 500 characters', () => {
      const input: JournalEntryInput = { 
        userId: 'user1', 
        mood: 50, 
        energy: 50, 
        stress: 50, 
        notes: 'A'.repeat(501) 
      };
      expect(() => validateJournalInput(input)).toThrow('notes must not exceed 500 characters');
    });

    it('throws error for non-string notes', () => {
      const input = { userId: 'user1', mood: 50, energy: 50, stress: 50, notes: 123 as any };
      expect(() => validateJournalInput(input)).toThrow('notes must be a string');
    });
  });

  describe('valid input', () => {
    it('accepts valid input with all fields', () => {
      const input: JournalEntryInput = {
        userId: 'user1',
        mood: 75,
        energy: 60,
        stress: 30,
        notes: 'Feeling good today!',
      };
      expect(() => validateJournalInput(input)).not.toThrow();
    });
  });
});

describe('calculateTrends', () => {
  describe('empty entries', () => {
    it('returns zeros and stable trends for empty array', () => {
      const result = calculateTrends([]);
      expect(result).toEqual({
        moodAvg: 0,
        energyAvg: 0,
        stressAvg: 0,
        moodTrend: 'stable',
        energyTrend: 'stable',
        stressTrend: 'stable',
      });
    });

    it('returns zeros and stable trends for null/undefined', () => {
      const result = calculateTrends(null as any);
      expect(result.moodAvg).toBe(0);
      expect(result.moodTrend).toBe('stable');
    });
  });

  describe('single entry', () => {
    it('returns entry values as averages with stable trends', () => {
      const entries = [createMockEntry({ mood: 80, energy: 60, stress: 40 })];
      const result = calculateTrends(entries);
      
      expect(result.moodAvg).toBe(80);
      expect(result.energyAvg).toBe(60);
      expect(result.stressAvg).toBe(40);
      expect(result.moodTrend).toBe('stable');
      expect(result.energyTrend).toBe('stable');
      expect(result.stressTrend).toBe('stable');
    });
  });

  describe('average calculations', () => {
    it('calculates correct averages for multiple entries', () => {
      const entries = [
        createMockEntry({ mood: 60, energy: 70, stress: 30 }),
        createMockEntry({ mood: 80, energy: 50, stress: 50 }),
        createMockEntry({ mood: 70, energy: 60, stress: 40 }),
      ];
      const result = calculateTrends(entries);
      
      expect(result.moodAvg).toBe(70);    // (60+80+70)/3 = 70
      expect(result.energyAvg).toBe(60);  // (70+50+60)/3 = 60
      expect(result.stressAvg).toBe(40);  // (30+50+40)/3 = 40
    });

    it('rounds averages to nearest integer', () => {
      const entries = [
        createMockEntry({ mood: 33, energy: 33, stress: 33 }),
        createMockEntry({ mood: 34, energy: 34, stress: 34 }),
      ];
      const result = calculateTrends(entries);
      
      expect(result.moodAvg).toBe(34);    // (33+34)/2 = 33.5 -> 34
      expect(result.energyAvg).toBe(34);
      expect(result.stressAvg).toBe(34);
    });
  });

  describe('trend direction - mood and energy (higher is better)', () => {
    it('detects improving mood trend when recent entries are higher', () => {
      // Recent entries (first half) have higher mood
      const entries = [
        createMockEntry({ mood: 80, energy: 50, stress: 50 }), // Recent
        createMockEntry({ mood: 75, energy: 50, stress: 50 }), // Recent
        createMockEntry({ mood: 60, energy: 50, stress: 50 }), // Older
        createMockEntry({ mood: 55, energy: 50, stress: 50 }), // Older
      ];
      const result = calculateTrends(entries);
      
      // Recent avg: (80+75)/2 = 77.5, Older avg: (60+55)/2 = 57.5
      // Diff: 77.5 - 57.5 = 20 > 5 threshold
      expect(result.moodTrend).toBe('improving');
    });

    it('detects declining mood trend when recent entries are lower', () => {
      const entries = [
        createMockEntry({ mood: 40, energy: 50, stress: 50 }), // Recent
        createMockEntry({ mood: 45, energy: 50, stress: 50 }), // Recent
        createMockEntry({ mood: 70, energy: 50, stress: 50 }), // Older
        createMockEntry({ mood: 75, energy: 50, stress: 50 }), // Older
      ];
      const result = calculateTrends(entries);
      
      expect(result.moodTrend).toBe('declining');
    });

    it('detects stable mood trend when difference is small', () => {
      const entries = [
        createMockEntry({ mood: 52, energy: 50, stress: 50 }), // Recent
        createMockEntry({ mood: 53, energy: 50, stress: 50 }), // Recent
        createMockEntry({ mood: 50, energy: 50, stress: 50 }), // Older
        createMockEntry({ mood: 51, energy: 50, stress: 50 }), // Older
      ];
      const result = calculateTrends(entries);
      
      // Recent avg: 52.5, Older avg: 50.5, Diff: 2 < 5 threshold
      expect(result.moodTrend).toBe('stable');
    });
  });

  describe('trend direction - stress (lower is better)', () => {
    it('detects improving stress trend when recent entries are lower', () => {
      const entries = [
        createMockEntry({ mood: 50, energy: 50, stress: 30 }), // Recent - lower stress
        createMockEntry({ mood: 50, energy: 50, stress: 35 }), // Recent
        createMockEntry({ mood: 50, energy: 50, stress: 60 }), // Older - higher stress
        createMockEntry({ mood: 50, energy: 50, stress: 65 }), // Older
      ];
      const result = calculateTrends(entries);
      
      // Recent avg: 32.5, Older avg: 62.5
      // For stress, lower is better, so this is improving
      expect(result.stressTrend).toBe('improving');
    });

    it('detects declining stress trend when recent entries are higher', () => {
      const entries = [
        createMockEntry({ mood: 50, energy: 50, stress: 70 }), // Recent - higher stress
        createMockEntry({ mood: 50, energy: 50, stress: 75 }), // Recent
        createMockEntry({ mood: 50, energy: 50, stress: 40 }), // Older - lower stress
        createMockEntry({ mood: 50, energy: 50, stress: 45 }), // Older
      ];
      const result = calculateTrends(entries);
      
      expect(result.stressTrend).toBe('declining');
    });
  });

  describe('edge cases', () => {
    it('handles two entries correctly', () => {
      const entries = [
        createMockEntry({ mood: 80, energy: 70, stress: 20 }), // Recent
        createMockEntry({ mood: 60, energy: 50, stress: 40 }), // Older
      ];
      const result = calculateTrends(entries);
      
      expect(result.moodAvg).toBe(70);
      expect(result.moodTrend).toBe('improving');
      expect(result.stressTrend).toBe('improving'); // Stress went down
    });

    it('handles all same values', () => {
      const entries = [
        createMockEntry({ mood: 50, energy: 50, stress: 50 }),
        createMockEntry({ mood: 50, energy: 50, stress: 50 }),
        createMockEntry({ mood: 50, energy: 50, stress: 50 }),
        createMockEntry({ mood: 50, energy: 50, stress: 50 }),
      ];
      const result = calculateTrends(entries);
      
      expect(result.moodAvg).toBe(50);
      expect(result.moodTrend).toBe('stable');
      expect(result.energyTrend).toBe('stable');
      expect(result.stressTrend).toBe('stable');
    });

    it('handles boundary values (0 and 100)', () => {
      const entries = [
        createMockEntry({ mood: 100, energy: 0, stress: 100 }),
        createMockEntry({ mood: 0, energy: 100, stress: 0 }),
      ];
      const result = calculateTrends(entries);
      
      expect(result.moodAvg).toBe(50);
      expect(result.energyAvg).toBe(50);
      expect(result.stressAvg).toBe(50);
    });
  });
});
