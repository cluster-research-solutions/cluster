CREATE TABLE IF NOT EXISTS "file_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_ref_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affinity_groups" ALTER COLUMN "study_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "file_views_user_file_unique" ON "file_views" ("user_id","file_ref_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_file_views_user_viewed" ON "file_views" ("user_id", "viewed_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_file_views_file" ON "file_views" ("file_ref_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_views" ADD CONSTRAINT "file_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_views" ADD CONSTRAINT "file_views_file_ref_id_file_refs_id_fk" FOREIGN KEY ("file_ref_id") REFERENCES "file_refs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
