/**
 * Research-specific extension types
 * Custom vocabulary at https://research-annotations.io/ns/research.jsonld
 */

import type { Annotation } from './annotation.js';

export type StudyStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Study {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: StudyStatus;
  sharepointFolderUrl?: string;
  settings: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Insight extends Annotation {
  type: ['Annotation', 'research:Insight'];
  'research:confidence'?: ConfidenceLevel;
  'research:impact'?: ImpactLevel;
  'research:recommendation'?: string;
}

export interface ResearchAnnotation extends Annotation {
  'research:study'?: string;
  'research:participant'?: string;
  'research:session'?: string;
}

export interface AffinityGroup {
  id: string;
  studyId: string;
  boardId?: string;
  name: string;
  color?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Taxonomy {
  id: string;
  orgId: string;
  studyId?: string;
  name: string;
  description?: string;
  isGlobal: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  taxonomyId: string;
  parentId?: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
}

export interface FileRef {
  id: string;
  orgId: string;
  studyId?: string;
  sharepointDriveId: string;
  sharepointItemId: string;
  sharepointSiteId?: string;
  name: string;
  mimeType?: string;
  sizeBytes?: number;
  webUrl?: string;
  contentHash?: string;
  lastSyncedAt?: string;
  transcriptFileId?: string;
  createdAt: string;
  updatedAt: string;
}
