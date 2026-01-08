CREATE TYPE "public"."archetype" AS ENUM('Perfectionist Builder', 'Opportunistic Visionary', 'Isolated Dreamer', 'Burning Out', 'Self-Assured Hustler', 'Community-Driven', 'Balanced Founder', 'Growth Seeker');--> statement-breakpoint
CREATE TYPE "public"."motivation_type" AS ENUM('intrinsic', 'extrinsic', 'mixed');--> statement-breakpoint
CREATE TABLE "assessments" (
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
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"od_id" text NOT NULL,
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"pseudonym" text,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_od_id_unique" UNIQUE("od_id")
);
