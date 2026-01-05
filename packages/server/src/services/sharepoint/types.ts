/**
 * SharePoint Types
 *
 * Re-exports SharePoint types from @cluster/plugins for backward compatibility.
 * New code should import directly from '@cluster/plugins'.
 */

export type {
  SharePointSite,
  SharePointDrive,
  SharePointDriveItem,
  SharePointDriveItem as SharePointItem, // Alias for backward compatibility
} from '@cluster/plugins';
