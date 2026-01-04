DO $$ BEGIN
 CREATE TYPE "annotation_motivation" AS ENUM('highlighting', 'tagging', 'classifying', 'commenting', 'describing', 'linking', 'questioning', 'bookmarking');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "selector_type" AS ENUM('TextQuoteSelector', 'TextPositionSelector', 'FragmentSelector', 'CssSelector', 'XPathSelector', 'RangeSelector');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "affinity_group_items" (
	"affinity_group_id" uuid NOT NULL,
	"annotation_id" uuid NOT NULL,
	"position_x" numeric(10, 2),
	"position_y" numeric(10, 2),
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "affinity_group_items_affinity_group_id_annotation_id_pk" PRIMARY KEY("affinity_group_id","annotation_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "affinity_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_id" uuid NOT NULL,
	"board_id" uuid,
	"name" varchar(255) NOT NULL,
	"color" varchar(7),
	"position_x" numeric(10, 2),
	"position_y" numeric(10, 2),
	"width" numeric(10, 2),
	"height" numeric(10, 2),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "annotation_tags" (
	"annotation_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "annotation_tags_annotation_id_tag_id_pk" PRIMARY KEY("annotation_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "annotation_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"annotation_id" uuid NOT NULL,
	"file_ref_id" uuid NOT NULL,
	"selector_type" "selector_type" NOT NULL,
	"selector_value" jsonb NOT NULL,
	"exact_text" text,
	"start_time" numeric(10, 3),
	"end_time" numeric(10, 3),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"study_id" uuid,
	"motivation" annotation_motivation[] NOT NULL,
	"creator_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp DEFAULT now() NOT NULL,
	"participant_id" varchar(100),
	"session_id" varchar(100),
	"jsonld" jsonb NOT NULL,
	"body_text" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"study_id" uuid,
	"sharepoint_drive_id" varchar(255) NOT NULL,
	"sharepoint_item_id" varchar(255) NOT NULL,
	"sharepoint_site_id" varchar(255),
	"name" varchar(500) NOT NULL,
	"mime_type" varchar(100),
	"size_bytes" bigint,
	"web_url" varchar(1000),
	"content_hash" varchar(64),
	"last_synced_at" timestamp,
	"transcript_file_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insight_evidence" (
	"insight_id" uuid NOT NULL,
	"annotation_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"note" text,
	CONSTRAINT "insight_evidence_insight_id_annotation_id_pk" PRIMARY KEY("insight_id","annotation_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"study_id" uuid,
	"title" varchar(500) NOT NULL,
	"body_markdown" text,
	"confidence" varchar(50),
	"impact" varchar(50),
	"recommendation" text,
	"creator_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"jsonld" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"azure_tenant_id" varchar(255) NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_azure_tenant_id_unique" UNIQUE("azure_tenant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"sharepoint_folder_url" varchar(1000),
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taxonomy_id" uuid NOT NULL,
	"parent_id" uuid,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"color" varchar(7),
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxonomies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"study_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_global" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"azure_user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"avatar_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_annotation_targets_file" ON "annotation_targets" ("file_ref_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_annotations_org" ON "annotations" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_annotations_study" ON "annotations" ("study_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_annotations_creator" ON "annotations" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_annotations_created" ON "annotations" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "file_refs_org_sharepoint_idx" ON "file_refs" ("org_id","sharepoint_drive_id","sharepoint_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_file_refs_sharepoint" ON "file_refs" ("sharepoint_drive_id","sharepoint_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_study" ON "insights" ("study_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tags_taxonomy_slug_idx" ON "tags" ("taxonomy_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tags_taxonomy" ON "tags" ("taxonomy_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_org_user_idx" ON "users" ("org_id","azure_user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affinity_group_items" ADD CONSTRAINT "affinity_group_items_affinity_group_id_affinity_groups_id_fk" FOREIGN KEY ("affinity_group_id") REFERENCES "affinity_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affinity_group_items" ADD CONSTRAINT "affinity_group_items_annotation_id_annotations_id_fk" FOREIGN KEY ("annotation_id") REFERENCES "annotations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affinity_groups" ADD CONSTRAINT "affinity_groups_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affinity_groups" ADD CONSTRAINT "affinity_groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotation_tags" ADD CONSTRAINT "annotation_tags_annotation_id_annotations_id_fk" FOREIGN KEY ("annotation_id") REFERENCES "annotations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotation_tags" ADD CONSTRAINT "annotation_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotation_targets" ADD CONSTRAINT "annotation_targets_annotation_id_annotations_id_fk" FOREIGN KEY ("annotation_id") REFERENCES "annotations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotation_targets" ADD CONSTRAINT "annotation_targets_file_ref_id_file_refs_id_fk" FOREIGN KEY ("file_ref_id") REFERENCES "file_refs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotations" ADD CONSTRAINT "annotations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotations" ADD CONSTRAINT "annotations_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotations" ADD CONSTRAINT "annotations_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_refs" ADD CONSTRAINT "file_refs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_refs" ADD CONSTRAINT "file_refs_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_refs" ADD CONSTRAINT "file_refs_transcript_file_id_file_refs_id_fk" FOREIGN KEY ("transcript_file_id") REFERENCES "file_refs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insight_evidence" ADD CONSTRAINT "insight_evidence_insight_id_insights_id_fk" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insight_evidence" ADD CONSTRAINT "insight_evidence_annotation_id_annotations_id_fk" FOREIGN KEY ("annotation_id") REFERENCES "annotations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studies" ADD CONSTRAINT "studies_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studies" ADD CONSTRAINT "studies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags" ADD CONSTRAINT "tags_taxonomy_id_taxonomies_id_fk" FOREIGN KEY ("taxonomy_id") REFERENCES "taxonomies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags" ADD CONSTRAINT "tags_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "tags"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxonomies" ADD CONSTRAINT "taxonomies_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxonomies" ADD CONSTRAINT "taxonomies_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxonomies" ADD CONSTRAINT "taxonomies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
