DO $$ BEGIN
 CREATE TYPE "storage_provider" AS ENUM('sharepoint', 'googledrive', 'onedrive', 'local');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "file_refs" DROP CONSTRAINT "file_refs_transcript_file_id_file_refs_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_parent_id_tags_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_file_views_user_viewed";--> statement-breakpoint
ALTER TABLE "file_refs" ADD COLUMN "provider" "storage_provider" DEFAULT 'sharepoint' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_file_views_user_viewed" ON "file_views" ("user_id","viewed_at");