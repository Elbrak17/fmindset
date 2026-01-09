/**
 * Community Service
 * Handles forum posts, replies, peer matching, and co-founder compatibility
 */

import { eq, and, desc, sql, ne, or, ilike } from 'drizzle-orm';
import { db } from '../db/connection';
import {
  forumPosts,
  forumReplies,
  postReports,
  peerMatches,
  notifications,
  assessments,
  userProfiles,
  type ForumPost,
  type NewForumPost,
  type ForumReply,
  type NewForumReply,
  type PeerMatch,
  type Notification,
  type Assessment,
} from '../db/schema';
import type { ArchetypeName } from '../types/assessment';

// Constants
const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 2000;
const MAX_REPLY_LENGTH = 1000;
const POSTS_PER_PAGE = 20;
const MAX_PEER_MATCHES = 5;
const AUTO_HIDE_REPORT_THRESHOLD = 3;
const DIMENSION_MATCH_THRESHOLD = 15;

// Profanity filter (basic)
const PROFANITY_LIST = ['spam', 'scam', 'hate'];

export type PostCategory = 'burnout' | 'imposter_syndrome' | 'isolation' | 'general';
export type SortOrder = 'recent' | 'popular';

// Validation error
export class CommunityValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommunityValidationError';
  }
}

/**
 * Generate a random pseudonym for anonymous posting
 */
export function generatePseudonym(): string {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `Founder-${number}`;
}

/**
 * Basic profanity check
 */
function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PROFANITY_LIST.some(word => lowerText.includes(word));
}

/**
 * Validate post content
 */
function validatePostContent(title: string, body: string): void {
  if (!title || title.trim().length === 0) {
    throw new CommunityValidationError('Title is required');
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new CommunityValidationError(`Title must not exceed ${MAX_TITLE_LENGTH} characters`);
  }
  if (!body || body.trim().length === 0) {
    throw new CommunityValidationError('Body is required');
  }
  if (body.length > MAX_BODY_LENGTH) {
    throw new CommunityValidationError(`Body must not exceed ${MAX_BODY_LENGTH} characters`);
  }
  if (containsProfanity(title) || containsProfanity(body)) {
    throw new CommunityValidationError('Content contains inappropriate language');
  }
}

/**
 * Create a new forum post
 */
export async function createPost(
  userId: string,
  title: string,
  body: string,
  category: PostCategory = 'general',
  showArchetype: boolean = false
): Promise<ForumPost> {
  validatePostContent(title, body);

  // Get user's pseudonym or generate one
  let pseudonym: string;
  let archetype: ArchetypeName | null = null;

  const userProfile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.odId, userId))
    .limit(1);

  if (userProfile.length > 0 && userProfile[0].pseudonym) {
    pseudonym = userProfile[0].pseudonym;
  } else {
    pseudonym = generatePseudonym();
    // Save pseudonym to user profile
    if (userProfile.length > 0) {
      await db
        .update(userProfiles)
        .set({ pseudonym })
        .where(eq(userProfiles.odId, userId));
    }
  }

  // Get archetype if showing
  if (showArchetype) {
    const assessment = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt))
      .limit(1);
    
    if (assessment.length > 0) {
      archetype = assessment[0].archetype as ArchetypeName;
    }
  }

  const newPost: NewForumPost = {
    userId,
    pseudonym,
    title: title.trim(),
    body: body.trim(),
    category,
    showArchetype,
    archetype,
  };

  const created = await db.insert(forumPosts).values(newPost).returning();
  return created[0];
}


/**
 * Get forum posts with pagination and filtering
 */
export async function getPosts(
  page: number = 1,
  category?: PostCategory,
  sortBy: SortOrder = 'recent',
  searchQuery?: string
): Promise<{ posts: ForumPost[]; total: number }> {
  const offset = (page - 1) * POSTS_PER_PAGE;

  let query = db.select().from(forumPosts).where(eq(forumPosts.isHidden, false));

  // Apply category filter
  if (category) {
    query = query.where(eq(forumPosts.category, category));
  }

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    const search = `%${searchQuery.trim()}%`;
    query = query.where(
      or(
        ilike(forumPosts.title, search),
        ilike(forumPosts.body, search)
      )
    );
  }

  // Apply sorting
  if (sortBy === 'popular') {
    query = query.orderBy(desc(forumPosts.replyCount), desc(forumPosts.createdAt));
  } else {
    query = query.orderBy(desc(forumPosts.createdAt));
  }

  const posts = await query.limit(POSTS_PER_PAGE).offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(forumPosts)
    .where(eq(forumPosts.isHidden, false));

  return {
    posts,
    total: Number(countResult[0]?.count || 0),
  };
}

/**
 * Get trending posts (most replies in last 24h)
 */
export async function getTrendingPosts(limit: number = 5): Promise<ForumPost[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const posts = await db
    .select()
    .from(forumPosts)
    .where(
      and(
        eq(forumPosts.isHidden, false),
        sql`${forumPosts.createdAt} >= ${oneDayAgo}`
      )
    )
    .orderBy(desc(forumPosts.replyCount))
    .limit(limit);

  return posts;
}

/**
 * Get a single post by ID with replies
 */
export async function getPostById(postId: string): Promise<{
  post: ForumPost;
  replies: ForumReply[];
} | null> {
  const post = await db
    .select()
    .from(forumPosts)
    .where(and(eq(forumPosts.id, postId), eq(forumPosts.isHidden, false)))
    .limit(1);

  if (post.length === 0) return null;

  const replies = await db
    .select()
    .from(forumReplies)
    .where(and(eq(forumReplies.postId, postId), eq(forumReplies.isHidden, false)))
    .orderBy(forumReplies.createdAt);

  return { post: post[0], replies };
}

/**
 * Create a reply to a post
 */
export async function createReply(
  postId: string,
  userId: string,
  body: string,
  parentReplyId?: string
): Promise<ForumReply> {
  if (!body || body.trim().length === 0) {
    throw new CommunityValidationError('Reply body is required');
  }
  if (body.length > MAX_REPLY_LENGTH) {
    throw new CommunityValidationError(`Reply must not exceed ${MAX_REPLY_LENGTH} characters`);
  }
  if (containsProfanity(body)) {
    throw new CommunityValidationError('Content contains inappropriate language');
  }

  // Check nesting level (max 2 levels)
  if (parentReplyId) {
    const parentReply = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.id, parentReplyId))
      .limit(1);

    if (parentReply.length > 0 && parentReply[0].parentReplyId) {
      throw new CommunityValidationError('Cannot nest replies more than 2 levels deep');
    }
  }

  // Get post to find user's pseudonym in this thread
  const post = await db
    .select()
    .from(forumPosts)
    .where(eq(forumPosts.id, postId))
    .limit(1);

  if (post.length === 0) {
    throw new CommunityValidationError('Post not found');
  }

  // Check if user already replied - use same pseudonym
  let pseudonym: string;
  const existingReply = await db
    .select()
    .from(forumReplies)
    .where(and(eq(forumReplies.postId, postId), eq(forumReplies.userId, userId)))
    .limit(1);

  if (existingReply.length > 0) {
    pseudonym = existingReply[0].pseudonym;
  } else if (post[0].userId === userId) {
    pseudonym = post[0].pseudonym;
  } else {
    pseudonym = generatePseudonym();
  }

  const newReply: NewForumReply = {
    postId,
    userId,
    pseudonym,
    body: body.trim(),
    parentReplyId: parentReplyId || null,
  };

  const created = await db.insert(forumReplies).values(newReply).returning();

  // Update reply count on post
  await db
    .update(forumPosts)
    .set({ replyCount: sql`${forumPosts.replyCount} + 1` })
    .where(eq(forumPosts.id, postId));

  // Create notification for post author
  if (post[0].userId !== userId) {
    await createNotification(
      post[0].userId,
      'reply',
      'New reply to your post',
      `Someone replied to "${post[0].title.substring(0, 30)}..."`,
      postId,
      created[0].id
    );
  }

  return created[0];
}


/**
 * Report a post or reply
 */
export async function reportContent(
  reporterId: string,
  reason: string,
  postId?: string,
  replyId?: string
): Promise<void> {
  if (!postId && !replyId) {
    throw new CommunityValidationError('Must specify post or reply to report');
  }

  await db.insert(postReports).values({
    postId: postId || null,
    replyId: replyId || null,
    reporterId,
    reason,
  });

  // Update report count and auto-hide if threshold reached
  if (postId) {
    await db
      .update(forumPosts)
      .set({ reportCount: sql`${forumPosts.reportCount} + 1` })
      .where(eq(forumPosts.id, postId));

    const post = await db.select().from(forumPosts).where(eq(forumPosts.id, postId)).limit(1);
    if (post.length > 0 && post[0].reportCount >= AUTO_HIDE_REPORT_THRESHOLD) {
      await db.update(forumPosts).set({ isHidden: true }).where(eq(forumPosts.id, postId));
    }
  }

  if (replyId) {
    await db
      .update(forumReplies)
      .set({ reportCount: sql`${forumReplies.reportCount} + 1` })
      .where(eq(forumReplies.id, replyId));

    const reply = await db.select().from(forumReplies).where(eq(forumReplies.id, replyId)).limit(1);
    if (reply.length > 0 && reply[0].reportCount >= AUTO_HIDE_REPORT_THRESHOLD) {
      await db.update(forumReplies).set({ isHidden: true }).where(eq(forumReplies.id, replyId));
    }
  }
}

/**
 * Create a notification
 */
async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedPostId?: string,
  relatedReplyId?: string
): Promise<Notification> {
  const created = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      message,
      relatedPostId: relatedPostId || null,
      relatedReplyId: relatedReplyId || null,
    })
    .returning();

  return created[0];
}

/**
 * Get user notifications
 */
export async function getNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let query = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId));

  if (unreadOnly) {
    query = query.where(eq(notifications.isRead, false));
  }

  return query.orderBy(desc(notifications.createdAt)).limit(50);
}

/**
 * Mark notifications as read
 */
export async function markNotificationsRead(userId: string, notificationIds?: string[]): Promise<void> {
  if (notificationIds && notificationIds.length > 0) {
    for (const id of notificationIds) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    }
  } else {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return Number(result[0]?.count || 0);
}


/**
 * Find peer matches based on archetype and dimensions
 */
export async function findPeerMatches(userId: string): Promise<PeerMatch[]> {
  // Get user's latest assessment
  const userAssessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, userId))
    .orderBy(desc(assessments.createdAt))
    .limit(1);

  if (userAssessment.length === 0) {
    return [];
  }

  const user = userAssessment[0];

  // Find users with same archetype or similar dimensions
  const potentialMatches = await db
    .select()
    .from(assessments)
    .where(ne(assessments.userId, userId))
    .orderBy(desc(assessments.createdAt));

  // Group by userId (latest assessment only)
  const userAssessments = new Map<string, Assessment>();
  for (const assessment of potentialMatches) {
    if (!userAssessments.has(assessment.userId)) {
      userAssessments.set(assessment.userId, assessment);
    }
  }

  // Check for dismissed matches
  const dismissedMatches = await db
    .select()
    .from(peerMatches)
    .where(and(eq(peerMatches.userId, userId), eq(peerMatches.isDismissed, true)));

  const dismissedUserIds = new Set(dismissedMatches.map(m => m.matchedUserId));

  // Calculate match scores
  const matches: Array<{ matchedUserId: string; score: number; sharedDimensions: string[] }> = [];

  for (const [matchedUserId, assessment] of userAssessments) {
    if (dismissedUserIds.has(matchedUserId)) continue;

    let score = 0;
    const sharedDimensions: string[] = [];

    // Same archetype = +40 points
    if (assessment.archetype === user.archetype) {
      score += 40;
      sharedDimensions.push(`Same archetype: ${user.archetype}`);
    }

    // Similar dimensions (within threshold) = +10 each
    const dimensions = [
      { name: 'Imposter Syndrome', user: user.imposterSyndrome, match: assessment.imposterSyndrome },
      { name: 'Founder Doubt', user: user.founderDoubt, match: assessment.founderDoubt },
      { name: 'Identity Fusion', user: user.identityFusion, match: assessment.identityFusion },
      { name: 'Fear of Rejection', user: user.fearOfRejection, match: assessment.fearOfRejection },
      { name: 'Isolation Level', user: user.isolationLevel, match: assessment.isolationLevel },
    ];

    for (const dim of dimensions) {
      if (Math.abs(dim.user - dim.match) <= DIMENSION_MATCH_THRESHOLD) {
        score += 10;
        if (dim.user > 60) {
          sharedDimensions.push(`High ${dim.name}`);
        }
      }
    }

    if (score >= 30) {
      matches.push({ matchedUserId, score, sharedDimensions });
    }
  }

  // Sort by score and take top matches
  matches.sort((a, b) => b.score - a.score);
  const topMatches = matches.slice(0, MAX_PEER_MATCHES);

  // Save matches to database
  const savedMatches: PeerMatch[] = [];
  for (const match of topMatches) {
    // Check if match already exists
    const existing = await db
      .select()
      .from(peerMatches)
      .where(
        and(
          eq(peerMatches.userId, userId),
          eq(peerMatches.matchedUserId, match.matchedUserId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      const created = await db
        .insert(peerMatches)
        .values({
          userId,
          matchedUserId: match.matchedUserId,
          matchScore: match.score,
          sharedDimensions: match.sharedDimensions,
        })
        .returning();
      savedMatches.push(created[0]);
    } else {
      savedMatches.push(existing[0]);
    }
  }

  return savedMatches;
}

/**
 * Dismiss a peer match
 */
export async function dismissPeerMatch(userId: string, matchId: string): Promise<void> {
  await db
    .update(peerMatches)
    .set({ isDismissed: true })
    .where(and(eq(peerMatches.id, matchId), eq(peerMatches.userId, userId)));
}

/**
 * Opt-in for peer connection
 */
export async function optInForPeerConnection(userId: string, matchId: string): Promise<PeerMatch | null> {
  // Update this user's opt-in
  const match = await db
    .select()
    .from(peerMatches)
    .where(and(eq(peerMatches.id, matchId), eq(peerMatches.userId, userId)))
    .limit(1);

  if (match.length === 0) return null;

  // Check if the other user has also opted in
  const reverseMatch = await db
    .select()
    .from(peerMatches)
    .where(
      and(
        eq(peerMatches.userId, match[0].matchedUserId),
        eq(peerMatches.matchedUserId, userId)
      )
    )
    .limit(1);

  const isMutual = reverseMatch.length > 0;

  const updated = await db
    .update(peerMatches)
    .set({ isMutualOptIn: isMutual })
    .where(eq(peerMatches.id, matchId))
    .returning();

  // If mutual, update the reverse match too
  if (isMutual && reverseMatch.length > 0) {
    await db
      .update(peerMatches)
      .set({ isMutualOptIn: true })
      .where(eq(peerMatches.id, reverseMatch[0].id));

    // Notify both users
    await createNotification(
      userId,
      'match',
      'Mutual connection!',
      'You and another founder have both opted in to connect.'
    );
    await createNotification(
      match[0].matchedUserId,
      'match',
      'Mutual connection!',
      'You and another founder have both opted in to connect.'
    );
  }

  return updated[0];
}


/**
 * Calculate co-founder compatibility between two users
 */
export async function calculateCompatibility(
  userId1: string,
  userId2: string
): Promise<{
  score: number;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
} | null> {
  // Get both users' assessments
  const [assessment1] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, userId1))
    .orderBy(desc(assessments.createdAt))
    .limit(1);

  const [assessment2] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, userId2))
    .orderBy(desc(assessments.createdAt))
    .limit(1);

  if (!assessment1 || !assessment2) {
    return null;
  }

  let score = 50; // Base score
  const strengths: string[] = [];
  const challenges: string[] = [];
  const recommendations: string[] = [];

  // Complementary dimensions (one high, one low = good balance)
  const dimensions = [
    { name: 'Risk Tolerance', v1: assessment1.riskTolerance, v2: assessment2.riskTolerance },
    { name: 'Imposter Syndrome', v1: assessment1.imposterSyndrome, v2: assessment2.imposterSyndrome },
    { name: 'Founder Doubt', v1: assessment1.founderDoubt, v2: assessment2.founderDoubt },
    { name: 'Isolation Level', v1: assessment1.isolationLevel, v2: assessment2.isolationLevel },
  ];

  for (const dim of dimensions) {
    const diff = Math.abs(dim.v1 - dim.v2);
    
    // Complementary (one high, one low)
    if (diff > 40) {
      if (dim.name === 'Risk Tolerance') {
        score += 10;
        strengths.push('Balanced risk approach - one brings caution, one brings boldness');
      } else if (dim.name === 'Isolation Level') {
        score += 5;
        strengths.push('Different social needs can complement each other');
      }
    }
    
    // Both high in negative dimensions = challenge
    if (dim.v1 > 70 && dim.v2 > 70 && dim.name !== 'Risk Tolerance') {
      score -= 10;
      challenges.push(`Both have high ${dim.name} - may amplify each other's struggles`);
    }
    
    // Both low in negative dimensions = strength
    if (dim.v1 < 40 && dim.v2 < 40 && dim.name !== 'Risk Tolerance') {
      score += 10;
      strengths.push(`Both have healthy ${dim.name} levels`);
    }
  }

  // Motivation type compatibility
  if (assessment1.motivationType === assessment2.motivationType) {
    score += 10;
    strengths.push(`Aligned motivation type: ${assessment1.motivationType}`);
  } else if (
    (assessment1.motivationType === 'intrinsic' && assessment2.motivationType === 'extrinsic') ||
    (assessment1.motivationType === 'extrinsic' && assessment2.motivationType === 'intrinsic')
  ) {
    score += 5;
    strengths.push('Complementary motivations - passion meets pragmatism');
    recommendations.push('Discuss how to balance purpose-driven and results-driven decisions');
  }

  // Archetype compatibility
  const compatiblePairs: Record<string, string[]> = {
    'Perfectionist Builder': ['Opportunistic Visionary', 'Growth Seeker'],
    'Opportunistic Visionary': ['Perfectionist Builder', 'Community-Driven'],
    'Isolated Dreamer': ['Community-Driven', 'Self-Assured Hustler'],
    'Self-Assured Hustler': ['Isolated Dreamer', 'Balanced Founder'],
    'Community-Driven': ['Isolated Dreamer', 'Opportunistic Visionary'],
    'Balanced Founder': ['Growth Seeker', 'Self-Assured Hustler'],
    'Growth Seeker': ['Balanced Founder', 'Perfectionist Builder'],
  };

  if (compatiblePairs[assessment1.archetype]?.includes(assessment2.archetype)) {
    score += 15;
    strengths.push(`Complementary archetypes: ${assessment1.archetype} + ${assessment2.archetype}`);
  }

  // Both Burning Out = major challenge
  if (assessment1.archetype === 'Burning Out' || assessment2.archetype === 'Burning Out') {
    score -= 20;
    challenges.push('One or both founders showing burnout signs - prioritize wellbeing first');
    recommendations.push('Address individual burnout before co-founding partnership');
  }

  // Generate recommendations based on analysis
  if (challenges.length > strengths.length) {
    recommendations.push('Consider working on individual growth areas before partnering');
  }
  if (strengths.length >= 3) {
    recommendations.push('Strong foundation for partnership - establish clear communication early');
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    strengths,
    challenges,
    recommendations,
  };
}

/**
 * Get user's posts
 */
export async function getUserPosts(userId: string): Promise<ForumPost[]> {
  return db
    .select()
    .from(forumPosts)
    .where(eq(forumPosts.userId, userId))
    .orderBy(desc(forumPosts.createdAt));
}

/**
 * Regenerate user pseudonym (once per month limit should be enforced at API level)
 */
export async function regeneratePseudonym(userId: string): Promise<string> {
  const newPseudonym = generatePseudonym();
  
  await db
    .update(userProfiles)
    .set({ pseudonym: newPseudonym })
    .where(eq(userProfiles.odId, userId));

  return newPseudonym;
}

/**
 * Delete a post (only by the owner)
 */
export async function deletePost(postId: string, userId: string): Promise<void> {
  // Verify ownership
  const post = await db
    .select()
    .from(forumPosts)
    .where(eq(forumPosts.id, postId))
    .limit(1);

  if (post.length === 0) {
    throw new CommunityValidationError('Post not found');
  }

  if (post[0].userId !== userId) {
    throw new CommunityValidationError('You can only delete your own posts');
  }

  // Delete replies first (cascade)
  await db.delete(forumReplies).where(eq(forumReplies.postId, postId));
  
  // Delete reports
  await db.delete(postReports).where(eq(postReports.postId, postId));
  
  // Delete the post
  await db.delete(forumPosts).where(eq(forumPosts.id, postId));
}
