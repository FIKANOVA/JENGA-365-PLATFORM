CREATE TABLE "corporate_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestone_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"amount" numeric,
	"currency" text DEFAULT 'KES',
	"status" text DEFAULT 'LOCKED',
	"unlocked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "corporate_unlock_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corporate_partner_id" uuid NOT NULL,
	"milestone_type" text NOT NULL,
	"threshold_value" integer NOT NULL,
	"current_value" integer DEFAULT 0,
	"status" text DEFAULT 'LOCKED',
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "give_back_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quarter" text NOT NULL,
	"activity_completed" boolean DEFAULT false,
	"activity_type" text,
	"activity_description" text,
	"strike_count" integer DEFAULT 0,
	"suspended" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mentor_commitment_tracker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"month" text NOT NULL,
	"hours_logged" integer DEFAULT 0,
	"status" text DEFAULT 'at_risk',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ngo_mou_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"mou_document_url" text,
	"resource_types" text[],
	"signed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "power_hour_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"mentee_id" uuid,
	"session_date" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resource_exchange_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_partner_id" uuid NOT NULL,
	"to_partner_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"quantity" integer,
	"notes" text,
	"exchanged_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tree_survival_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kobo_submission_id" text NOT NULL,
	"project_location_id" uuid,
	"check_interval_months" integer NOT NULL,
	"survey_date" timestamp with time zone NOT NULL,
	"trees_planted" integer NOT NULL,
	"trees_alive" integer NOT NULL,
	"surveyor_name" text,
	"photo_url" text,
	"geo_lat" numeric(10, 7),
	"geo_lng" numeric(10, 7),
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tree_survival_checks_kobo_submission_id_unique" UNIQUE("kobo_submission_id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "mentee_intake" ADD COLUMN "goal_categories" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mentor_specialisations" text[];--> statement-breakpoint
ALTER TABLE "corporate_resources" ADD CONSTRAINT "corporate_resources_milestone_id_corporate_unlock_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."corporate_unlock_milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_unlock_milestones" ADD CONSTRAINT "corporate_unlock_milestones_corporate_partner_id_users_id_fk" FOREIGN KEY ("corporate_partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_unlock_milestones" ADD CONSTRAINT "corporate_unlock_milestones_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "give_back_tracking" ADD CONSTRAINT "give_back_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_commitment_tracker" ADD CONSTRAINT "mentor_commitment_tracker_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ngo_mou_agreements" ADD CONSTRAINT "ngo_mou_agreements_partner_id_corporate_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."corporate_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "power_hour_sessions" ADD CONSTRAINT "power_hour_sessions_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "power_hour_sessions" ADD CONSTRAINT "power_hour_sessions_mentee_id_users_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_survival_checks" ADD CONSTRAINT "tree_survival_checks_project_location_id_project_locations_id_fk" FOREIGN KEY ("project_location_id") REFERENCES "public"."project_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "give_back_user_quarter_idx" ON "give_back_tracking" USING btree ("user_id","quarter");--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_month_idx" ON "mentor_commitment_tracker" USING btree ("mentor_id","month");--> statement-breakpoint
CREATE INDEX "tree_survey_date_idx" ON "tree_survival_checks" USING btree ("survey_date");--> statement-breakpoint
CREATE INDEX "tree_location_idx" ON "tree_survival_checks" USING btree ("project_location_id");--> statement-breakpoint
CREATE VIEW "public"."v_corporate_partner_scorecard" AS (select "corporate_partner_id", "milestone_type", "threshold_value", "current_value", "status", "verified_at" from "corporate_unlock_milestones");--> statement-breakpoint
CREATE VIEW "public"."v_tree_survival_time_series" AS (select "id", "project_location_id", "check_interval_months", "survey_date", "trees_planted", "trees_alive", round("trees_alive"::numeric / nullif("trees_planted", 0) * 100, 1) as "survival_rate", "surveyor_name", "geo_lat", "geo_lng" from "tree_survival_checks");--> statement-breakpoint
CREATE VIEW "public"."v_unlocked_resources" AS (select "corporate_resources"."milestone_id", "corporate_unlock_milestones"."corporate_partner_id", "corporate_unlock_milestones"."milestone_type", "corporate_resources"."resource_type", "corporate_resources"."amount", "corporate_resources"."currency", "corporate_resources"."status", "corporate_resources"."unlocked_at" from "corporate_resources" inner join "corporate_unlock_milestones" on "corporate_resources"."milestone_id" = "corporate_unlock_milestones"."id");