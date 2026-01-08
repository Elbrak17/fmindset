import { pgTable, text, integer, timestamp, boolean, uuid, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { MotivationType, ArchetypeName } from '../types/assessment';

// Enums
export const motivationTypeEnum = pgEnum('motivation_type', ['intrinsic', 'extrinsic', 'mixed']);

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

// Relations
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  assessments: many(assessments),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  userProfile: one(userProfiles, {
    fields: [assessments.userId],
    references: [userProfiles.odId],
  }),
}));

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;