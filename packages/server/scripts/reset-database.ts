import postgres from 'postgres';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../../.env') });

const sql = postgres(process.env.DATABASE_URL!);

async function reset() {
  console.log('🗑️  Resetting all annotations, file_refs, and file_views...\n');

  try {
    // Delete everything in reverse dependency order
    await sql`DELETE FROM file_views`;
    console.log('✓ Deleted all file_views');

    await sql`DELETE FROM annotation_tags`;
    console.log('✓ Deleted all annotation_tags');

    await sql`DELETE FROM annotation_targets`;
    console.log('✓ Deleted all annotation_targets');

    await sql`DELETE FROM annotations`;
    console.log('✓ Deleted all annotations');

    await sql`DELETE FROM file_refs`;
    console.log('✓ Deleted all file_refs');

    await sql`DELETE FROM affinity_group_items`;
    console.log('✓ Deleted all affinity_group_items');

    await sql`DELETE FROM affinity_groups`;
    console.log('✓ Deleted all affinity_groups');

    console.log('\n✅ Database reset complete! Ready for fresh start.');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

reset();
