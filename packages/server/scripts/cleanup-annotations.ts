import postgres from 'postgres';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../../.env') });

const sql = postgres(process.env.DATABASE_URL!);

async function cleanup() {
  console.log('🧹 Cleaning up malformed annotations and file_refs...\n');

  try {
    // 1. Delete annotation_targets that reference file_refs with 'unknown' driveId
    const deletedTargets = await sql`
      DELETE FROM annotation_targets
      WHERE file_ref_id IN (
        SELECT id FROM file_refs
        WHERE sharepoint_drive_id = 'unknown'
      )
    `;
    console.log(`✓ Deleted ${deletedTargets.count} annotation_targets with malformed file_refs`);

    // 2. Delete annotations that have no targets
    const deletedAnnotations = await sql`
      DELETE FROM annotations
      WHERE id NOT IN (
        SELECT DISTINCT annotation_id FROM annotation_targets
      )
    `;
    console.log(`✓ Deleted ${deletedAnnotations.count} orphaned annotations`);

    // 3. Delete orphaned annotation_tags
    const deletedTags = await sql`
      DELETE FROM annotation_tags
      WHERE annotation_id NOT IN (
        SELECT id FROM annotations
      )
    `;
    console.log(`✓ Deleted ${deletedTags.count} orphaned annotation_tags`);

    // 4. Delete file_refs with 'unknown' driveId
    const deletedFileRefs = await sql`
      DELETE FROM file_refs
      WHERE sharepoint_drive_id = 'unknown'
    `;
    console.log(`✓ Deleted ${deletedFileRefs.count} malformed file_refs`);

    // 5. Delete orphaned file_views
    const deletedFileViews = await sql`
      DELETE FROM file_views
      WHERE file_ref_id NOT IN (
        SELECT id FROM file_refs
      )
    `;
    console.log(`✓ Deleted ${deletedFileViews.count} orphaned file_views`);

    // Show summary
    console.log('\n📊 Database summary:');
    const summary = await sql`
      SELECT
        'annotations' as table_name,
        COUNT(*) as remaining_count
      FROM annotations
      UNION ALL
      SELECT
        'file_refs' as table_name,
        COUNT(*) as remaining_count
      FROM file_refs
      UNION ALL
      SELECT
        'annotation_targets' as table_name,
        COUNT(*) as remaining_count
      FROM annotation_targets
      UNION ALL
      SELECT
        'file_views' as table_name,
        COUNT(*) as remaining_count
      FROM file_views
    `;

    summary.forEach((row: any) => {
      console.log(`  ${row.table_name}: ${row.remaining_count} rows`);
    });

    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

cleanup();
