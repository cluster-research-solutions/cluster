import postgres from 'postgres';
import { env } from '../src/config/env.js';

async function createCanvasNodesTable() {
  console.log('Creating canvas_nodes table...');

  const sql = postgres(env.DATABASE_URL, { max: 1 });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS canvas_nodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
        annotation_id UUID NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,

        position_x DECIMAL(10, 2) NOT NULL,
        position_y DECIMAL(10, 2) NOT NULL,

        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

        UNIQUE(org_id, study_id, annotation_id)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_canvas_nodes_org ON canvas_nodes(org_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_canvas_nodes_study ON canvas_nodes(study_id)`;

    console.log('✅ canvas_nodes table created successfully');
  } catch (error) {
    console.error('❌ Failed to create canvas_nodes table:', error);
    process.exit(1);
  }

  await sql.end();
  process.exit(0);
}

createCanvasNodesTable();
