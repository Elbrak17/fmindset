-- Create enum types
CREATE TYPE "motivation_type" AS ENUM('intrinsic', 'extrinsic', 'mixed');

CREATE TYPE "archetype" AS ENUM(
  'Perfectionist Builder',
  'Opportunistic Visionary', 
  'Isolated Dreamer',
  'Burning Out',
  'Self-Assured Hustler',
  'Community-Driven',
  'Balanced Founder',
  'Growth Seeker'
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"od_id" text NOT NULL,
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"pseudonym" text,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_od_id_unique" UNIQUE("od_id")
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"answers" jsonb NOT NULL,
	"imposter_syndrome" integer NOT NULL,
	"founder_doubt" integer NOT NULL,
	"identity_fusion" integer NOT NULL,
	"fear_of_rejection" integer NOT NULL,
	"risk_tolerance" integer NOT NULL,
	"motivation_type" "motivation_type" NOT NULL,
	"isolation_level" integer NOT NULL,
	"archetype" "archetype" NOT NULL,
	"groq_insights" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_profiles_od_id" ON "user_profiles" ("od_id");
CREATE INDEX IF NOT EXISTS "idx_assessments_user_id" ON "assessments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_assessments_created_at" ON "assessments" ("created_at");

-- Add constraints for score validation (0-100)
ALTER TABLE "assessments" ADD CONSTRAINT "check_imposter_syndrome_range" CHECK ("imposter_syndrome" >= 0 AND "imposter_syndrome" <= 100);
ALTER TABLE "assessments" ADD CONSTRAINT "check_founder_doubt_range" CHECK ("founder_doubt" >= 0 AND "founder_doubt" <= 100);
ALTER TABLE "assessments" ADD CONSTRAINT "check_identity_fusion_range" CHECK ("identity_fusion" >= 0 AND "identity_fusion" <= 100);
ALTER TABLE "assessments" ADD CONSTRAINT "check_fear_of_rejection_range" CHECK ("fear_of_rejection" >= 0 AND "fear_of_rejection" <= 100);
ALTER TABLE "assessments" ADD CONSTRAINT "check_risk_tolerance_range" CHECK ("risk_tolerance" >= 0 AND "risk_tolerance" <= 100);
ALTER TABLE "assessments" ADD CONSTRAINT "check_isolation_level_range" CHECK ("isolation_level" >= 0 AND "isolation_level" <= 100);