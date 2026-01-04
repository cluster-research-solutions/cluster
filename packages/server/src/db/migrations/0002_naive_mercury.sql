CREATE TABLE IF NOT EXISTS "canvas_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"study_id" uuid,
	"annotation_id" uuid NOT NULL,
	"position_x" numeric(10, 2) NOT NULL,
	"position_y" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_canvas_nodes_org_study_annotation" ON "canvas_nodes" ("org_id","study_id","annotation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_canvas_nodes_org" ON "canvas_nodes" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_canvas_nodes_study" ON "canvas_nodes" ("study_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_nodes" ADD CONSTRAINT "canvas_nodes_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_nodes" ADD CONSTRAINT "canvas_nodes_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_nodes" ADD CONSTRAINT "canvas_nodes_annotation_id_annotations_id_fk" FOREIGN KEY ("annotation_id") REFERENCES "annotations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
