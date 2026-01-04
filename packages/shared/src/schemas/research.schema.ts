import { z } from 'zod';

export const studyStatusSchema = z.enum(['active', 'paused', 'completed', 'archived']);

export const studySchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: studyStatusSchema,
  sharepointFolderUrl: z.string().url().optional(),
  settings: z.record(z.unknown()),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const confidenceLevelSchema = z.enum(['low', 'medium', 'high']);
export const impactLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const taxonomySchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  studyId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isGlobal: z.boolean(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const tagSchema = z.object({
  id: z.string().uuid(),
  taxonomyId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
});

export const fileRefSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  studyId: z.string().uuid().optional(),
  sharepointDriveId: z.string(),
  sharepointItemId: z.string(),
  sharepointSiteId: z.string().optional(),
  name: z.string().min(1).max(500),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  webUrl: z.string().url().optional(),
  contentHash: z.string().optional(),
  lastSyncedAt: z.string().datetime().optional(),
  transcriptFileId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const affinityGroupSchema = z.object({
  id: z.string().uuid(),
  studyId: z.string().uuid(),
  boardId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
