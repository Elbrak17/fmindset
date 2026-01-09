CREATE TYPE "public"."action_category" AS ENUM('mindfulness', 'social', 'physical', 'professional', 'rest');--> statement-breakpoint
CREATE TYPE "public"."post_category" AS ENUM('burnout', 'imposter_syndrome', 'isolation', 'general');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'caution', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "action_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"action_text" text NOT NULL,
	"category" "action_category" NOT NULL,
	"target_dimension" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"assigned_date" date DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "burnout_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"journal_entry_id" uuid,
	"score" integer NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"contributing_factors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"pseudonym" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" "post_category" DEFAULT 'general' NOT NULL,
	"show_archetype" boolean DEFAULT false NOT NULL,
	"archetype" "archetype",
	"reply_count" integer DEFAULT 0 NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"parent_reply_id" uuid,
	"user_id" text NOT NULL,
	"pseudonym" text NOT NULL,
	"body" text NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mood" integer NOT NULL,
	"energy" integer NOT NULL,
	"stress" integer NOT NULL,
	"notes" text,
	"entry_date" date DEFAULT now() NOT NULL,
	"is_synced" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"related_post_id" uuid,
	"related_reply_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "peer_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"matched_user_id" text NOT NULL,
	"match_score" integer NOT NULL,
	"shared_dimensions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_dismissed" boolean DEFAULT false NOT NULL,
	"is_mutual_opt_in" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid,
	"reply_id" uuid,
	"reporter_id" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
