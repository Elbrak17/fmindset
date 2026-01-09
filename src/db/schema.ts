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

// Community Enums
export const postCategoryEnum = pgEnum('post_category', [
  'burnout', 'imposter_syndrome', 'isolation', 'general'
]);

// Forum Posts table
export const forumPosts = pgTable('forum_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  pseudonym: text('pseudonym').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  category: postCategoryEnum('category').notNull().default('general'),
  showArchetype: boolean('show_archetype').notNull().default(false),
  archetype: archetypeEnum('archetype'),
  replyCount: integer('reply_count').notNull().default(0),
  reportCount: integer('report_count').notNull().default(0),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Forum Replies table
export const forumReplies = pgTable('forum_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull(),
  parentReplyId: uuid('parent_reply_id'),
  userId: text('user_id').notNull(),
  pseudonym: text('pseudonym').notNull(),
  body: text('body').notNull(),
  reportCount: integer('report_count').notNull().default(0),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Post Reports table
export const postReports = pgTable('post_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id'),
  replyId: uuid('reply_id'),
  reporterId: text('reporter_id').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Peer Matches table
export const peerMatches = pgTable('peer_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  matchedUserId: text('matched_user_id').notNull(),
  matchScore: integer('match_score').notNull(),
  sharedDimensions: jsonb('shared_dimensions').notNull().default([]),
  isDismissed: boolean('is_dismissed').notNull().default(false),
  isMutualOptIn: boolean('is_mutual_opt_in').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'reply', 'match', 'system'
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedPostId: uuid('related_post_id'),
  relatedReplyId: uuid('related_reply_id'),
  isRead: boolean('is_read').notNull().default(false),
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

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  userProfile: one(userProfiles, {
    fields: [forumPosts.userId],
    references: [userProfiles.odId],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumReplies.postId],
    references: [forumPosts.id],
  }),
  parentReply: one(forumReplies, {
    fields: [forumReplies.parentReplyId],
    references: [forumReplies.id],
  }),
}));

export const peerMatchesRelations = relations(peerMatches, ({ one }) => ({
  user: one(userProfiles, {
    fields: [peerMatches.userId],
    references: [userProfiles.odId],
  }),
  matchedUser: one(userProfiles, {
    fields: [peerMatches.matchedUserId],
    references: [userProfiles.odId],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  userProfile: one(userProfiles, {
    fields: [notifications.userId],
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
export type ForumPost = typeof forumPosts.$inferSelect;
export type NewForumPost = typeof forumPosts.$inferInsert;
export type ForumReply = typeof forumReplies.$inferSelect;
export type NewForumReply = typeof forumReplies.$inferInsert;
export type PostReport = typeof postReports.$inferSelect;
export type NewPostReport = typeof postReports.$inferInsert;
export type PeerMatch = typeof peerMatches.$inferSelect;
export type NewPeerMatch = typeof peerMatches.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;