-- Community Module Migration

-- Post category enum
DO $$ BEGIN
    CREATE TYPE post_category AS ENUM ('burnout', 'imposter_syndrome', 'isolation', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Forum Posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category post_category NOT NULL DEFAULT 'general',
    show_archetype BOOLEAN NOT NULL DEFAULT false,
    archetype archetype,
    reply_count INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Forum Replies table
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    body TEXT NOT NULL,
    report_count INTEGER NOT NULL DEFAULT 0,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Post Reports table
CREATE TABLE IF NOT EXISTS post_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    reporter_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Peer Matches table
CREATE TABLE IF NOT EXISTS peer_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    matched_user_id TEXT NOT NULL,
    match_score INTEGER NOT NULL,
    shared_dimensions JSONB NOT NULL DEFAULT '[]',
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    is_mutual_opt_in BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
    related_reply_id UUID REFERENCES forum_replies(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_hidden ON forum_posts(is_hidden);

CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id);

CREATE INDEX IF NOT EXISTS idx_peer_matches_user_id ON peer_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_matches_matched_user_id ON peer_matches(matched_user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
