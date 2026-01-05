/**
 * Storage Provider Interface
 *
 * Abstract interface for cloud storage providers (SharePoint, Google Drive, etc.).
 * This enables Cluster to work with multiple storage backends while keeping the
 * core application logic provider-agnostic.
 *
 * Each provider implementation lives in @cluster/plugins and implements this interface.
 */

import type { StorageProvider as StorageProviderType } from '../db';

// ============================================================================
// Common Types (Provider-Agnostic)
// ============================================================================

/**
 * A container for files (e.g., SharePoint Site, Google Drive shared drive).
 * This is the top-level organizational unit in most cloud storage systems.
 */
export interface StorageContainer {
  /** Provider-specific unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description */
  description?: string;
  /** URL to access this container in the provider's web UI */
  webUrl?: string;
}

/**
 * A drive or document library within a container.
 * Some providers (like SharePoint) have multiple drives per container.
 */
export interface StorageDrive {
  /** Provider-specific unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description */
  description?: string;
  /** Type of drive (e.g., 'documentLibrary', 'personal') */
  driveType?: string;
  /** URL to access this drive in the provider's web UI */
  webUrl?: string;
}

/**
 * Parent reference for hierarchical navigation.
 */
export interface StorageParentReference {
  /** Drive ID containing this item */
  driveId: string;
  /** Parent folder ID (or 'root') */
  id: string;
  /** Optional path string for display */
  path?: string;
}

/**
 * File-specific metadata.
 */
export interface StorageFileInfo {
  /** MIME type of the file */
  mimeType: string;
  /** Optional content hashes for integrity verification */
  hashes?: {
    quickXorHash?: string;
    sha1Hash?: string;
    md5Hash?: string;
  };
}

/**
 * Folder-specific metadata.
 */
export interface StorageFolderInfo {
  /** Number of direct children (files + folders) */
  childCount: number;
}

/**
 * A file or folder in cloud storage.
 * This is the primary unit of content that users browse and annotate.
 */
export interface StorageItem {
  /** Provider-specific unique identifier */
  id: string;
  /** File or folder name */
  name: string;
  /** Size in bytes (files only) */
  size?: number;
  /** URL to access this item in the provider's web UI */
  webUrl?: string;
  /** ISO 8601 creation timestamp */
  createdDateTime?: string;
  /** ISO 8601 last modified timestamp */
  lastModifiedDateTime: string;
  /** Present if this is a file */
  file?: StorageFileInfo;
  /** Present if this is a folder */
  folder?: StorageFolderInfo;
  /** Reference to parent container/folder */
  parentReference: StorageParentReference;
}

// ============================================================================
// Navigation State
// ============================================================================

/**
 * Breadcrumb item for folder navigation.
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
}

/**
 * Current navigation state in the file browser.
 */
export interface FileBrowserState {
  /** Currently selected container (site) ID */
  selectedContainerId: string | null;
  /** Currently selected drive ID */
  selectedDriveId: string | null;
  /** Current folder ID (or 'root') */
  currentFolderId: string;
  /** Navigation breadcrumb trail */
  breadcrumbs: BreadcrumbItem[];
}

// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Storage Provider Interface
 *
 * Implementations of this interface provide access to a specific cloud storage
 * system. The interface is designed to be general enough to support:
 * - SharePoint / OneDrive for Business (Microsoft Graph API)
 * - Google Drive (Google Drive API)
 * - Local/Network file systems
 *
 * All methods are async and may throw on network/auth errors.
 */
export interface IStorageProvider {
  /** Provider identifier */
  readonly providerType: StorageProviderType;

  // ---- Container/Site Operations ----

  /** List all containers the user has access to */
  listContainers(): Promise<StorageContainer[]>;

  /** Get a specific container by ID */
  getContainer(containerId: string): Promise<StorageContainer>;

  /** Search containers by name */
  searchContainers?(query: string): Promise<StorageContainer[]>;

  // ---- Drive Operations ----

  /** List drives within a container */
  listDrives(containerId: string): Promise<StorageDrive[]>;

  /** Get a specific drive by ID */
  getDrive(driveId: string): Promise<StorageDrive>;

  // ---- Item Operations ----

  /** List items in a folder (use 'root' for drive root) */
  listItems(driveId: string, folderId?: string): Promise<StorageItem[]>;

  /** Get a specific item by ID */
  getItem(driveId: string, itemId: string): Promise<StorageItem>;

  /** Search for items within a drive */
  searchItems?(driveId: string, query: string): Promise<StorageItem[]>;

  // ---- Content Operations ----

  /** Get a direct download URL for a file (may be temporary) */
  getDownloadUrl(driveId: string, itemId: string): Promise<string>;

  /** Stream file content (returns platform-appropriate stream) */
  getFileContent(driveId: string, itemId: string): Promise<unknown>;

  /** Get thumbnail URL for a file (for previews) */
  getThumbnail?(
    driveId: string,
    itemId: string,
    size?: 'small' | 'medium' | 'large'
  ): Promise<string | null>;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a storage item is a file (has file metadata).
 */
export function isFile(item: StorageItem | null | undefined): boolean {
  return !!item?.file;
}

/**
 * Check if a storage item is a folder (has folder metadata).
 */
export function isFolder(item: StorageItem | null | undefined): boolean {
  return !!item?.folder;
}

/**
 * Check if a storage item is a media file (video, audio, or image).
 */
export function isMediaFile(item: StorageItem | null | undefined): boolean {
  const mimeType = item?.file?.mimeType || '';
  return (
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('image/')
  );
}

/**
 * Check if a storage item is a video file.
 */
export function isVideoFile(item: StorageItem | null | undefined): boolean {
  const mimeType = item?.file?.mimeType || '';
  return mimeType.startsWith('video/');
}

/**
 * Check if a storage item is an audio file.
 */
export function isAudioFile(item: StorageItem | null | undefined): boolean {
  const mimeType = item?.file?.mimeType || '';
  return mimeType.startsWith('audio/');
}
