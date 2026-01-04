import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, bigint, integer, decimal, pgEnum, uniqueIndex, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations, desc } from 'drizzle-orm';

// Enums
export const annotationMotivationEnum = pgEnum('annotation_motivation', [
  'highlighting',
  'tagging',
  'classifying',
  'commenting',
  'describing',
  'linking',
  'questioning',
  'bookmarking',
]);

export const selectorTypeEnum = pgEnum('selector_type', [
  'TextQuoteSelector',
  'TextPositionSelector',
  'FragmentSelector',
  'CssSelector',
  'XPathSelector',
  'RangeSelector',
]);

// Organizations
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  azureTenantId: varchar('azure_tenant_id', { length: 255 }).notNull().unique(),
  settings: jsonb('settings').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  azureUserId: varchar('azure_user_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgUserIdx: uniqueIndex('users_org_user_idx').on(table.orgId, table.azureUserId),
}));

// Studies
export const studies = pgTable('studies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  sharepointFolderUrl: varchar('sharepoint_folder_url', { length: 1000 }),
  settings: jsonb('settings').default({}).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// File references
export const fileRefs = pgTable('file_refs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),

  sharepointDriveId: varchar('sharepoint_drive_id', { length: 255 }).notNull(),
  sharepointItemId: varchar('sharepoint_item_id', { length: 255 }).notNull(),
  sharepointSiteId: varchar('sharepoint_site_id', { length: 255 }),

  name: varchar('name', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  webUrl: varchar('web_url', { length: 1000 }),

  contentHash: varchar('content_hash', { length: 64 }),
  lastSyncedAt: timestamp('last_synced_at'),

  transcriptFileId: uuid('transcript_file_id').references(() => fileRefs.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgSharepointIdx: uniqueIndex('file_refs_org_sharepoint_idx').on(
    table.orgId,
    table.sharepointDriveId,
    table.sharepointItemId
  ),
  sharepointIdx: index('idx_file_refs_sharepoint').on(table.sharepointDriveId, table.sharepointItemId),
}));

// File views (activity tracking)
export const fileViews = pgTable('file_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  fileRefId: uuid('file_ref_id').references(() => fileRefs.id, { onDelete: 'cascade' }).notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userFileUnique: uniqueIndex('file_views_user_file_unique').on(table.userId, table.fileRefId),
  userViewedIdx: index('idx_file_views_user_viewed').on(table.userId, desc(table.viewedAt)),
  fileIdx: index('idx_file_views_file').on(table.fileRefId),
}));

// Taxonomies
export const taxonomies = pgTable('taxonomies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isGlobal: boolean('is_global').default(false).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tags
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  taxonomyId: uuid('taxonomy_id').references(() => taxonomies.id, { onDelete: 'cascade' }).notNull(),
  parentId: uuid('parent_id').references(() => tags.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  taxonomySlugIdx: uniqueIndex('tags_taxonomy_slug_idx').on(table.taxonomyId, table.slug),
  taxonomyIdx: index('idx_tags_taxonomy').on(table.taxonomyId),
}));

// Annotations
export const annotations = pgTable('annotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),

  motivation: annotationMotivationEnum('motivation').array().notNull(),

  creatorId: uuid('creator_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  modifiedAt: timestamp('modified_at').defaultNow().notNull(),

  participantId: varchar('participant_id', { length: 100 }),
  sessionId: varchar('session_id', { length: 100 }),

  jsonld: jsonb('jsonld').notNull(),
  bodyText: text('body_text'),

  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('idx_annotations_org').on(table.orgId),
  studyIdx: index('idx_annotations_study').on(table.studyId),
  creatorIdx: index('idx_annotations_creator').on(table.creatorId),
  createdIdx: index('idx_annotations_created').on(table.createdAt),
}));

// Annotation targets
export const annotationTargets = pgTable('annotation_targets', {
  id: uuid('id').primaryKey().defaultRandom(),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  fileRefId: uuid('file_ref_id').references(() => fileRefs.id, { onDelete: 'cascade' }).notNull(),

  selectorType: selectorTypeEnum('selector_type').notNull(),
  selectorValue: jsonb('selector_value').notNull(),

  exactText: text('exact_text'),
  startTime: decimal('start_time', { precision: 10, scale: 3 }),
  endTime: decimal('end_time', { precision: 10, scale: 3 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  fileIdx: index('idx_annotation_targets_file').on(table.fileRefId),
}));

// Annotation tags (many-to-many)
export const annotationTags = pgTable('annotation_tags', {
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.annotationId, table.tagId] }),
}));

// Insights
export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),

  title: varchar('title', { length: 500 }).notNull(),
  bodyMarkdown: text('body_markdown'),

  confidence: varchar('confidence', { length: 50 }),
  impact: varchar('impact', { length: 50 }),
  recommendation: text('recommendation'),

  creatorId: uuid('creator_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  jsonld: jsonb('jsonld'),
}, (table) => ({
  studyIdx: index('idx_insights_study').on(table.studyId),
}));

// Insight evidence
export const insightEvidence = pgTable('insight_evidence', {
  insightId: uuid('insight_id').references(() => insights.id, { onDelete: 'cascade' }).notNull(),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  note: text('note'),
}, (table) => ({
  pk: primaryKey({ columns: [table.insightId, table.annotationId] }),
}));

// Affinity groups
export const affinityGroups = pgTable('affinity_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'cascade' }),
  boardId: uuid('board_id'),

  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }),

  positionX: decimal('position_x', { precision: 10, scale: 2 }),
  positionY: decimal('position_y', { precision: 10, scale: 2 }),
  width: decimal('width', { precision: 10, scale: 2 }),
  height: decimal('height', { precision: 10, scale: 2 }),

  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Affinity group items
export const affinityGroupItems = pgTable('affinity_group_items', {
  affinityGroupId: uuid('affinity_group_id').references(() => affinityGroups.id, { onDelete: 'cascade' }).notNull(),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  positionX: decimal('position_x', { precision: 10, scale: 2 }),
  positionY: decimal('position_y', { precision: 10, scale: 2 }),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.affinityGroupId, table.annotationId] }),
}));

// Canvas nodes (standalone highlights on the organize canvas)
export const canvasNodes = pgTable('canvas_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'cascade' }),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),

  positionX: decimal('position_x', { precision: 10, scale: 2 }).notNull(),
  positionY: decimal('position_y', { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgStudyAnnotationIdx: index('idx_canvas_nodes_org_study_annotation').on(table.orgId, table.studyId, table.annotationId),
  orgIdx: index('idx_canvas_nodes_org').on(table.orgId),
  studyIdx: index('idx_canvas_nodes_study').on(table.studyId),
}));

// Canvas snapshots (versioned canvas states for affinity mapping)
export const canvasSnapshots = pgTable('canvas_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  versionNumber: integer('version_number').notNull(),

  // Serialized React Flow state (nodes, edges, viewport)
  canvasState: jsonb('canvas_state').notNull(),

  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  studyIdx: index('idx_canvas_snapshots_study').on(table.studyId),
  createdIdx: index('idx_canvas_snapshots_created').on(table.createdAt),
}));
