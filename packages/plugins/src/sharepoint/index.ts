/**
 * SharePoint Plugin
 *
 * Storage provider implementation for Microsoft SharePoint / OneDrive for Business.
 */

// Types
export type {
  SharePointSite,
  SharePointDrive,
  SharePointDriveItem,
  SharePointParentReference,
  SharePointFileInfo,
  SharePointFolderInfo,
  SharePointItem,
} from './types';

// Utility functions
export {
  isMediaFile,
  isVideoFile,
  isAudioFile,
  isFolder,
  isFile,
} from './types';

// Provider implementation
export { SharePointProvider, SharePointService } from './client';
