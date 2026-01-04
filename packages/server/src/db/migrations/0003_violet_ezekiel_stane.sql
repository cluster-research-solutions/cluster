CREATE TABLE IF NOT EXISTS "canvas_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"study_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"version_number" integer NOT NULL,
	"canvas_state" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_canvas_snapshots_study" ON "canvas_snapshots" ("study_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_canvas_snapshots_created" ON "canvas_snapshots" ("created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_snapshots" ADD CONSTRAINT "canvas_snapshots_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_snapshots" ADD CONSTRAINT "canvas_snapshots_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_snapshots" ADD CONSTRAINT "canvas_snapshots_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
