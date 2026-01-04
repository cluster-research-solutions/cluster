-- Clean up annotations and file_refs with malformed data from old architecture
-- This removes entries created before we implemented the FileRefResolver pattern

BEGIN;

-- 1. Delete annotation_targets that reference file_refs with 'unknown' driveId
DELETE FROM annotation_targets
WHERE file_ref_id IN (
  SELECT id FROM file_refs
  WHERE sharepoint_drive_id = 'unknown'
);

-- 2. Delete annotations that have no targets
DELETE FROM annotations
WHERE id NOT IN (
  SELECT DISTINCT annotation_id FROM annotation_targets
);

-- 3. Delete orphaned annotation_tags
DELETE FROM annotation_tags
WHERE annotation_id NOT IN (
  SELECT id FROM annotations
);

-- 4. Delete file_refs with 'unknown' driveId (no longer referenced)
DELETE FROM file_refs
WHERE sharepoint_drive_id = 'unknown';

-- 5. Delete orphaned file_views
DELETE FROM file_views
WHERE file_ref_id NOT IN (
  SELECT id FROM file_refs
);

-- Show cleanup summary
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
FROM annotation_targets;

COMMIT;
