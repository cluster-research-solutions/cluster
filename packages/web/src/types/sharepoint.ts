/**
 * SharePoint Types
 *
 * Re-exports SharePoint types from @cluster/plugins for the web package.
 * Also includes SharePoint-specific navigation state types.
 */

// Re-export all SharePoint types from plugins
export type {
  SharePointSite,
  SharePointDrive,
  SharePointDriveItem,
  SharePointParentReference,
  SharePointFileInfo,
  SharePointFolderInfo,
} from '@cluster/plugins';

// Re-export utility functions
export {
  isMediaFile,
  isVideoFile,
  isAudioFile,
  isFolder,
  isFile,
} from '@cluster/plugins';

// Import BreadcrumbItem from core for use in FileBrowserState
import type { BreadcrumbItem } from '@cluster/core';

// Re-export it for consumers
export type { BreadcrumbItem };

// ============================================================================
// SharePoint-specific Navigation State
// ============================================================================

/**
 * File browser navigation state (SharePoint-specific naming).
 *
 * Uses SharePoint terminology (site, drive) rather than the generic
 * names (container, drive) from @cluster/core.
 */
export interface FileBrowserState {
  /** Currently selected SharePoint site ID */
  selectedSiteId: string | null;
  /** Currently selected drive (document library) ID */
  selectedDriveId: string | null;
  /** Current folder ID (or 'root') */
  currentFolderId: string;
  /** Navigation breadcrumb trail */
  breadcrumbs: BreadcrumbItem[];
}
