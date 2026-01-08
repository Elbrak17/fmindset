import { pgTable, text, integer, timestamp, boolean, uuid, jsonb, pgEnum, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const motivationTypeEnum = pgEnum('motivation_type', ['intrinsic', 'extrinsic', 'mixed']);

export const riskLevelEnum = pgEnum('risk_level', ['low', 'caution', 'high', 'critical']);

export const actionCategoryEnum = pgEnum('action_category', [
  'mindfulness', 'social', 'physical', 'professional', 'rest'
]);

export const archetypeEnum = pgEnum('archetype', [
  'Perfectionist Builder',
  'Opportunistic Visionary', 
  'Isolated Dreamer',
  'Burning Out',
  'Self-Assured Hustler',
  'Community-Driven',
  'Balanced Founder',
  'Growth Seeker'
]);

// User Profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  odId: text('od_id').notNull().unique(),
  isAnonymous: boolean('is_anonymous').notNull().default(true),
  pseudonym: text('pseudonym'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Assessments table
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  answers: jsonb('answers').notNull(), // Array of 25 answers (A, B, C, D)
  
  // Psychological scores
  imposterSyndrome: integer('imposter_syndrome').notNull(),
  founderDoubt: integer('founder_doubt').notNull(),
  identityFusion: integer('identity_fusion').notNull(),
  fearOfRejection: integer('fear_of_rejection').notNull(),
  riskTolerance: integer('risk_tolerance').notNull(),
  motivationType: motivationTypeEnum('motivation_type').notNull(),
  isolationLevel: integer('isolation_level').notNull(),
  
  archetype: archetypeEnum('archetype').notNull(),
  groqInsights: text('groq_insights'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Journal Entries table
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  mood: integer('mood').notNull(),
  energy: integer('energy').notNull(),
  stress: integer('stress').notNull(),
  notes: text('notes'),
  entryDate: date('entry_date').notNull().defaultNow(),
  isSynced: boolean('is_synced').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Burnout Scores table
export const burnoutScores = pgTable('burnout_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  journalEntryId: uuid('journal_entry_id'),
  score: integer('score').notNull(),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  contributingFactors: jsonb('contributing_factors').notNull().default([]),
  calculatedAt: timestamp('calculated_at').notNull().defaultNow(),
});

// Action Items table
export const actionItems = pgTable('action_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  actionText: text('action_text').notNull(),
  category: actionCategoryEnum('category').notNull(),
  targetDimension: text('target_dimension'),
  isCompleted: boolean('is_completed').notNull().default(false),
  assignedDate: date('assigned_date').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  assessments: many(assessments),
  journalEntries: many(journalEntries),
  burnoutScores: many(burnoutScores),
  actionItems: many(actionItems),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  userProfile: one(userProfiles, {
    fields: [assessments.userId],
    references: [userProfiles.odId],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  userProfile: one(userProfiles, {
    fields: [journalEntries.userId],
    references: [userProfiles.odId],
  }),
  burnoutScores: many(burnoutScores),
}));

export const burnoutScoresRelations = relations(burnoutScores, ({ one }) => ({
  userProfile: one(userProfiles, {
    fields: [burnoutScores.userId],
    references: [userProfiles.odId],
  }),
  journalEntry: one(journalEntries, {
    fields: [burnoutScores.journalEntryId],
    references: [journalEntries.id],
  }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  userProfile: one(userProfiles, {
    fields: [actionItems.userId],
    references: [userProfiles.odId],
  }),
}));

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type BurnoutScore = typeof burnoutScores.$inferSelect;
export type NewBurnoutScore = typeof burnoutScores.$inferInsert;
export type ActionItem = typeof actionItems.$inferSelect;
export type NewActionItem = typeof actionItems.$inferInsert;