CREATE TYPE "public"."article_category" AS ENUM('Rugby', 'Mentorship', 'Education', 'Business', 'Impact', 'Community', 'Wellness');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'in_review', 'published', 'rejected', 'unpublished');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('CV', 'LinkedIn', 'Portfolio', 'Other');--> statement-breakpoint
CREATE TYPE "public"."badge_type" AS ENUM('Supporter', 'Verified', 'TopMentor');--> statement-breakpoint
CREATE TYPE "public"."document_access_action" AS ENUM('view', 'download', 'print_attempt');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."document_tier" AS ENUM('1', '2', '3');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('Webinar', 'Clinic');--> statement-breakpoint
CREATE TYPE "public"."mentor_status" AS ENUM('pending', 'active', 'suspended', 'declined');--> statement-breakpoint
CREATE TYPE "public"."mentorship_status" AS ENUM('pending', 'active', 'completed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('nda_signed', 'user_approved', 'user_rejected', 'new_match', 'match_accepted', 'match_declined', 'payment_success', 'session_reminder', 'article_approved', 'article_rejected', 'general');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'shipped', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('clinic', 'webinar', 'tree_planting', 'mentorship_hub', 'corporate_funded', 'workshop');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SuperAdmin', 'Moderator', 'CorporatePartner', 'Mentor', 'Mentee', 'user');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"impact_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_helpful_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"voted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_saves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"co_author_ids" text[],
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"body_portable_text" jsonb,
	"cover_image_url" text,
	"cover_image_alt" text,
	"category" "article_category",
	"tags" text[],
	"read_time_minutes" integer,
	"word_count" integer,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"moderator_id" uuid,
	"moderator_note" text,
	"rejection_feedback" text,
	"approved_by" uuid,
	"sanity_doc_id" varchar(255),
	"is_featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"submitted_for_review_at" timestamp,
	"published_at" timestamp,
	"last_edited_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "corporate_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_name" varchar(255) NOT NULL,
	"logo_url" text,
	"contact_email" varchar(255) NOT NULL,
	"sponsorship_tier" varchar(50),
	"employee_count" integer DEFAULT 0,
	"impact_trees_planted" integer DEFAULT 0,
	"impact_hours_contributed" integer DEFAULT 0,
	"stripe_customer_id" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid,
	"action" "document_access_action" NOT NULL,
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"success" boolean DEFAULT true,
	"failure_reason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"paystack_reference" varchar(255),
	"paystack_subscription_code" varchar(255),
	"is_recurring" boolean DEFAULT false,
	"fund_allocation" varchar(100),
	"donated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"attended" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sanity_doc_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" "event_type" NOT NULL,
	"date" timestamp NOT NULL,
	"location" varchar(255),
	"is_online" boolean DEFAULT false,
	"capacity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_sanity_doc_id_unique" UNIQUE("sanity_doc_id")
);
--> statement-breakpoint
CREATE TABLE "impact_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_period" varchar(50) NOT NULL,
	"total_mentorship_hours" integer DEFAULT 0,
	"total_donations" numeric(20, 2) DEFAULT '0',
	"trees_planted" integer DEFAULT 0,
	"clinics_held" integer DEFAULT 0,
	"youth_engaged" integer DEFAULT 0,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"role_assigned" "user_role" NOT NULL,
	"partner_id" uuid,
	"invitee_email" varchar(255),
	"moderation_scope" varchar(50),
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "learning_pathways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pair_id" uuid NOT NULL,
	"milestones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentee_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentee_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"document_name" varchar(255) NOT NULL,
	"document_url" text NOT NULL,
	"document_type" varchar(50),
	"file_size_bytes" integer,
	"is_visible_to_mentee" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mentee_intake" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"academic_standing" text NOT NULL,
	"career_tags" text[] NOT NULL,
	"career_free_text" text,
	"support_types" text[] NOT NULL,
	"preferred_mentorship_style" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mentee_intake_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "academic_standing_check" CHECK ("mentee_intake"."academic_standing" IN ('Good', 'Probation', 'Honors')),
	CONSTRAINT "career_tags_length_check" CHECK (cardinality("mentee_intake"."career_tags") BETWEEN 1 AND 3),
	CONSTRAINT "career_free_text_length_check" CHECK ("mentee_intake"."career_free_text" IS NULL OR char_length("mentee_intake"."career_free_text") <= 280),
	CONSTRAINT "support_types_length_check" CHECK (cardinality("mentee_intake"."support_types") BETWEEN 1 AND 2),
	CONSTRAINT "mentorship_style_check" CHECK ("mentee_intake"."preferred_mentorship_style" IN ('Strict', 'Supportive', 'Mixed'))
);
--> statement-breakpoint
CREATE TABLE "mentorship_pairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"mentee_id" uuid NOT NULL,
	"status" "mentorship_status" DEFAULT 'pending' NOT NULL,
	"matched_at" timestamp DEFAULT now() NOT NULL,
	"match_score" numeric(5, 2),
	"partner_id" uuid
);
--> statement-breakpoint
CREATE TABLE "merchandise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sanity_product_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"stock_count" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"category" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderator_id" uuid,
	"action_type" varchar(100) NOT NULL,
	"target_id" uuid NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"requires_cosign" boolean DEFAULT false,
	"notes" text,
	"actioned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mood_journal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentee_id" uuid NOT NULL,
	"session_id" uuid,
	"mood_score" integer NOT NULL,
	"notes" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nda_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "nda_documents_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE "nda_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_version" varchar(50) NOT NULL,
	"sha256_hash" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"signature_name" varchar(255) NOT NULL,
	"role_at_signing" "user_role" NOT NULL,
	"signed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"link" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"guest_email" varchar(255),
	"paystack_reference" varchar(255),
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"items" jsonb NOT NULL,
	"impact_fund_contribution" numeric(12, 2),
	"ordered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "document_tier" NOT NULL,
	"title" varchar(255) NOT NULL,
	"version" varchar(20) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"checksum" varchar(64),
	"uploaded_by" uuid,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"require_2fa" boolean DEFAULT false,
	"is_indexed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"project_type" "project_type" NOT NULL,
	"funder_id" uuid,
	"amount_funded" numeric(12, 2) DEFAULT '0',
	"youth_engaged" integer DEFAULT 0,
	"trees_planted" integer DEFAULT 0,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "resilience_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"q1_response" text NOT NULL,
	"q2_response" text NOT NULL,
	"identity_response" text,
	"is_baseline" boolean DEFAULT true NOT NULL,
	"reassessment_due_date" timestamp,
	"assessed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "score_range_check" CHECK ("resilience_assessments"."score" BETWEEN 1 AND 10),
	CONSTRAINT "identity_required_on_reassessment" CHECK ("resilience_assessments"."is_baseline" = true OR "resilience_assessments"."identity_response" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sessions_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pair_id" uuid NOT NULL,
	"duration_minutes" integer NOT NULL,
	"notes" text,
	"session_date" timestamp NOT NULL,
	"logged_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"merchandise_id" uuid NOT NULL,
	"is_notified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_type" "badge_type" NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	"awarded_by" uuid
);
--> statement-breakpoint
CREATE TABLE "user_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768),
	"chunk_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "asset_type" NOT NULL,
	"url" text,
	"filename" varchar(255),
	"content_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"guest_email" varchar(255),
	"image" text,
	"role" "user_role" DEFAULT 'Mentee' NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"mentor_status" "mentor_status",
	"location_region" varchar(255),
	"embedding" vector(1536),
	"embedding_stale" boolean DEFAULT false NOT NULL,
	"intake_completed" boolean DEFAULT false NOT NULL,
	"partner_id" uuid,
	"account_created_by" uuid,
	"moderation_scope" varchar(255),
	"rejection_reason" text,
	"reapply_eligible_at" timestamp,
	"badge_ids" text[],
	"consent_given_at" timestamp,
	"marketing_opt_in" boolean DEFAULT false,
	"data_deletion_requested_at" timestamp,
	"deleted_at" timestamp,
	"nda_signed" boolean DEFAULT false NOT NULL,
	"nda_version" varchar(50),
	"nda_signed_at" timestamp,
	"onboarded" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"is_mentor_verified" boolean DEFAULT false,
	"metadata" jsonb,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_helpful_votes" ADD CONSTRAINT "article_helpful_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_helpful_votes" ADD CONSTRAINT "article_helpful_votes_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_saves" ADD CONSTRAINT "article_saves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_saves" ADD CONSTRAINT "article_saves_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_document_id_platform_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."platform_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_platform_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."platform_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_partner_id_corporate_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."corporate_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_pathways" ADD CONSTRAINT "learning_pathways_pair_id_mentorship_pairs_id_fk" FOREIGN KEY ("pair_id") REFERENCES "public"."mentorship_pairs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentee_documents" ADD CONSTRAINT "mentee_documents_mentee_id_users_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentee_documents" ADD CONSTRAINT "mentee_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentee_intake" ADD CONSTRAINT "mentee_intake_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_pairs" ADD CONSTRAINT "mentorship_pairs_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_pairs" ADD CONSTRAINT "mentorship_pairs_mentee_id_users_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_pairs" ADD CONSTRAINT "mentorship_pairs_partner_id_corporate_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."corporate_partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_log" ADD CONSTRAINT "moderation_log_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_journal" ADD CONSTRAINT "mood_journal_mentee_id_users_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_journal" ADD CONSTRAINT "mood_journal_session_id_sessions_log_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nda_documents" ADD CONSTRAINT "nda_documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nda_signatures" ADD CONSTRAINT "nda_signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_documents" ADD CONSTRAINT "platform_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_locations" ADD CONSTRAINT "project_locations_funder_id_corporate_partners_id_fk" FOREIGN KEY ("funder_id") REFERENCES "public"."corporate_partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_locations" ADD CONSTRAINT "project_locations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resilience_assessments" ADD CONSTRAINT "resilience_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions_log" ADD CONSTRAINT "sessions_log_pair_id_mentorship_pairs_id_fk" FOREIGN KEY ("pair_id") REFERENCES "public"."mentorship_pairs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions_log" ADD CONSTRAINT "sessions_log_logged_by_users_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_notifications" ADD CONSTRAINT "stock_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_notifications" ADD CONSTRAINT "stock_notifications_merchandise_id_merchandise_id_fk" FOREIGN KEY ("merchandise_id") REFERENCES "public"."merchandise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_awarded_by_users_id_fk" FOREIGN KEY ("awarded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_chunks" ADD CONSTRAINT "user_chunks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile_assets" ADD CONSTRAINT "user_profile_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_partner_id_corporate_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."corporate_partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_user_date_idx" ON "activity_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_article_vote_idx" ON "article_helpful_votes" USING btree ("user_id","article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_article_save_idx" ON "article_saves" USING btree ("user_id","article_id");--> statement-breakpoint
CREATE INDEX "doc_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "chunk_embedding_idx" ON "document_chunks" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "mentee_docs_idx" ON "mentee_documents" USING btree ("mentee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pair_idx" ON "mentorship_pairs" USING btree ("mentor_id","mentee_id");--> statement-breakpoint
CREATE INDEX "mood_mentee_date_idx" ON "mood_journal" USING btree ("mentee_id","recorded_at");--> statement-breakpoint
CREATE INDEX "notif_user_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "geo_idx" ON "project_locations" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "project_type_idx" ON "project_locations" USING btree ("project_type");--> statement-breakpoint
CREATE INDEX "funder_idx" ON "project_locations" USING btree ("funder_id");--> statement-breakpoint
CREATE INDEX "resilience_user_idx" ON "resilience_assessments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_chunk_idx" ON "user_chunks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_chunk_embedding_idx" ON "user_chunks" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "embedding_idx" ON "users" USING ivfflat ("embedding" vector_cosine_ops);