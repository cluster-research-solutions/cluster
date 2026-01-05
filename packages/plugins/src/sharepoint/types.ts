/**
 * SharePoint-specific Types
 *
 * Types for Microsoft Graph API responses and SharePoint-specific concepts.
 * These extend the generic storage types with SharePoint-specific fields.
 */

import type {
  StorageContainer,
  StorageDrive,
  StorageItem,
  StorageParentReference,
  StorageFileInfo,
  StorageFolderInfo,
} from '@cluster/core';

// ============================================================================
// SharePoint Site (extends StorageContainer)
// ============================================================================

/**
 * SharePoint Site
 *
 * A site is the top-level container in SharePoint. Each site can contain
 * multiple document libraries (drives) and other content.
 */
export interface SharePointSite extends StorageContainer {
  /** Site display name */
  displayName: string;
}

// ============================================================================
// SharePoint Drive (extends StorageDrive)
// ============================================================================

/**
 * SharePoint Drive (Document Library)
 *
 * A drive represents a document library within a SharePoint site.
 * Most sites have at least one drive called "Documents".
 */
export interface SharePointDrive extends StorageDrive {
  /** Drive type (e.g., 'documentLibrary', 'personal') */
  driveType: string;
}

// ============================================================================
// SharePoint Item Types
// ============================================================================

/**
 * SharePoint Parent Reference
 *
 * Reference to the parent container of an item, including the path
 * for breadcrumb navigation.
 */
export interface SharePointParentReference extends StorageParentReference {
  /** Full path from drive root (e.g., '/drive/root:/Documents/Folder') */
  path?: string;
}

/**
 * SharePoint File Info
 *
 * Metadata specific to files in SharePoint, including content hashes
 * for integrity verification.
 */
export interface SharePointFileInfo extends StorageFileInfo {
  /** Content hashes for deduplication and integrity checks */
  hashes?: {
    quickXorHash?: string;
    sha1Hash?: string;
  };
}

/**
 * SharePoint Folder Info
 *
 * Metadata specific to folders in SharePoint.
 */
export interface SharePointFolderInfo extends StorageFolderInfo {
  // SharePoint doesn't add extra folder metadata beyond childCount
}

/**
 * SharePoint Drive Item (File or Folder)
 *
 * Represents a DriveItem from the Microsoft Graph API. This is the primary
 * unit that users browse and annotate.
 */
export interface SharePointDriveItem extends StorageItem {
  /** File metadata (present if this is a file) */
  file?: SharePointFileInfo;
  /** Folder metadata (present if this is a folder) */
  folder?: SharePointFolderInfo;
  /** Parent reference with SharePoint-specific path */
  parentReference: SharePointParentReference;
}

// ============================================================================
// Legacy Type Aliases (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use SharePointDriveItem instead
 */
export type SharePointItem = SharePointDriveItem;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a DriveItem is a media file (video, audio, or image).
 */
export function isMediaFile(file: SharePointDriveItem | null | undefined): boolean {
  const mimeType = file?.file?.mimeType || '';
  return (
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('image/')
  );
}

/**
 * Check if a DriveItem is a video file.
 */
export function isVideoFile(file: SharePointDriveItem | null | undefined): boolean {
  const mimeType = file?.file?.mimeType || '';
  return mimeType.startsWith('video/');
}

/**
 * Check if a DriveItem is an audio file.
 */
export function isAudioFile(file: SharePointDriveItem | null | undefined): boolean {
  const mimeType = file?.file?.mimeType || '';
  return mimeType.startsWith('audio/');
}

/**
 * Check if a DriveItem is a folder.
 */
export function isFolder(item: SharePointDriveItem): boolean {
  return !!item.folder;
}

/**
 * Check if a DriveItem is a file.
 */
export function isFile(item: SharePointDriveItem): boolean {
  return !!item.file;
}
