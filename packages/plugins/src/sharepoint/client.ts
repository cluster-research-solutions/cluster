/**
 * SharePoint Storage Provider
 *
 * Implementation of IStorageProvider for Microsoft SharePoint / OneDrive for Business
 * using the Microsoft Graph API.
 */

import { Client } from '@microsoft/microsoft-graph-client';
import type { IStorageProvider, StorageProvider as StorageProviderType } from '@cluster/core';
import type {
  SharePointSite,
  SharePointDrive,
  SharePointDriveItem,
} from './types';

/**
 * SharePoint Storage Provider
 *
 * Provides access to SharePoint sites, drives, and files via Microsoft Graph API.
 * Requires an authenticated Graph client with appropriate permissions:
 * - Sites.Read.All (for listing sites)
 * - Files.Read.All (for reading files)
 */
export class SharePointProvider implements IStorageProvider {
  readonly providerType: StorageProviderType = 'sharepoint';

  constructor(private graphClient: Client) {}

  // ============================================================================
  // Container (Site) Operations
  // ============================================================================

  /**
   * List all SharePoint sites the user has access to.
   */
  async listContainers(): Promise<SharePointSite[]> {
    const response = await this.graphClient
      .api('/sites')
      .query({ search: '*' })
      .select('id,displayName,webUrl,description')
      .get();

    return response.value.map((site: SharePointSite) => ({
      ...site,
      name: site.displayName,
    }));
  }

  /**
   * Get a specific site by ID.
   */
  async getContainer(siteId: string): Promise<SharePointSite> {
    const site = await this.graphClient
      .api(`/sites/${siteId}`)
      .select('id,displayName,webUrl,description')
      .get();

    return {
      ...site,
      name: site.displayName,
    };
  }

  /**
   * Search for sites by name.
   */
  async searchContainers(query: string): Promise<SharePointSite[]> {
    const response = await this.graphClient
      .api('/sites')
      .filter(`search('${query}')`)
      .select('id,displayName,webUrl,description')
      .get();

    return response.value.map((site: SharePointSite) => ({
      ...site,
      name: site.displayName,
    }));
  }

  // ============================================================================
  // Drive Operations
  // ============================================================================

  /**
   * List drives (document libraries) for a site.
   */
  async listDrives(siteId: string): Promise<SharePointDrive[]> {
    const response = await this.graphClient
      .api(`/sites/${siteId}/drives`)
      .select('id,name,description,driveType,webUrl')
      .get();

    return response.value;
  }

  /**
   * Get a specific drive by ID.
   */
  async getDrive(driveId: string): Promise<SharePointDrive> {
    return this.graphClient
      .api(`/drives/${driveId}`)
      .select('id,name,description,driveType,webUrl')
      .get();
  }

  // ============================================================================
  // Item Operations
  // ============================================================================

  /**
   * List items in a drive folder.
   * @param driveId - The drive ID
   * @param folderId - Folder ID, or 'root' for drive root (default)
   */
  async listItems(
    driveId: string,
    folderId: string = 'root'
  ): Promise<SharePointDriveItem[]> {
    const response = await this.graphClient
      .api(`/drives/${driveId}/items/${folderId}/children`)
      .select(
        'id,name,size,webUrl,createdDateTime,lastModifiedDateTime,folder,file,parentReference'
      )
      .get();

    return response.value;
  }

  /**
   * Get a specific item by ID.
   */
  async getItem(driveId: string, itemId: string): Promise<SharePointDriveItem> {
    return this.graphClient
      .api(`/drives/${driveId}/items/${itemId}`)
      .select(
        'id,name,size,webUrl,createdDateTime,lastModifiedDateTime,folder,file,parentReference'
      )
      .get();
  }

  /**
   * Search for items within a drive.
   */
  async searchItems(
    driveId: string,
    query: string
  ): Promise<SharePointDriveItem[]> {
    const response = await this.graphClient
      .api(`/drives/${driveId}/search(q='${query}')`)
      .select(
        'id,name,size,webUrl,createdDateTime,lastModifiedDateTime,folder,file,parentReference'
      )
      .get();

    return response.value;
  }

  // ============================================================================
  // Content Operations
  // ============================================================================

  /**
   * Get a direct download URL for a file.
   * Note: This URL is temporary and will expire.
   */
  async getDownloadUrl(driveId: string, itemId: string): Promise<string> {
    const item = await this.graphClient
      .api(`/drives/${driveId}/items/${itemId}`)
      .select('@microsoft.graph.downloadUrl')
      .get();

    return item['@microsoft.graph.downloadUrl'];
  }

  /**
   * Stream file content.
   * Returns a ReadableStream (browser) or NodeJS.ReadableStream (Node).
   */
  async getFileContent(driveId: string, itemId: string): Promise<unknown> {
    return this.graphClient
      .api(`/drives/${driveId}/items/${itemId}/content`)
      .getStream();
  }

  /**
   * Get thumbnail URL for a file (useful for video/image previews).
   */
  async getThumbnail(
    driveId: string,
    itemId: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): Promise<string | null> {
    try {
      const response = await this.graphClient
        .api(`/drives/${driveId}/items/${itemId}/thumbnails`)
        .get();

      return response.value?.[0]?.[size]?.url || null;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Legacy Export (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use SharePointProvider instead
 */
export { SharePointProvider as SharePointService };
