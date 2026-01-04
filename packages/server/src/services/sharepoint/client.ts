import { Client } from '@microsoft/microsoft-graph-client';
import type { SharePointSite, SharePointDrive, SharePointItem } from './types.js';

export class SharePointService {
  constructor(private graphClient: Client) {}

  /**
   * List all SharePoint sites the user has access to
   */
  async listSites(): Promise<SharePointSite[]> {
    // Use search=* to get all sites the user has access to
    const response = await this.graphClient
      .api('/sites')
      .query({ search: '*' })
      .select('id,displayName,webUrl,description')
      .get();

    return response.value;
  }

  /**
   * Get a specific site by ID
   */
  async getSite(siteId: string): Promise<SharePointSite> {
    return this.graphClient
      .api(`/sites/${siteId}`)
      .select('id,displayName,webUrl,description')
      .get();
  }

  /**
   * Search for sites by name
   */
  async searchSites(query: string): Promise<SharePointSite[]> {
    const response = await this.graphClient
      .api('/sites')
      .filter(`search('${query}')`)
      .select('id,displayName,webUrl,description')
      .get();

    return response.value;
  }

  /**
   * List drives (document libraries) for a site
   */
  async listDrives(siteId: string): Promise<SharePointDrive[]> {
    const response = await this.graphClient
      .api(`/sites/${siteId}/drives`)
      .select('id,name,description,driveType,webUrl')
      .get();

    return response.value;
  }

  /**
   * Get a specific drive
   */
  async getDrive(driveId: string): Promise<SharePointDrive> {
    return this.graphClient
      .api(`/drives/${driveId}`)
      .select('id,name,description,driveType,webUrl')
      .get();
  }

  /**
   * List items in a drive (root or specific folder)
   */
  async listDriveItems(
    driveId: string,
    itemId: string = 'root'
  ): Promise<SharePointItem[]> {
    const response = await this.graphClient
      .api(`/drives/${driveId}/items/${itemId}/children`)
      .select(
        'id,name,size,webUrl,createdDateTime,lastModifiedDateTime,folder,file,parentReference'
      )
      .get();

    return response.value;
  }

  /**
   * Get a specific item
   */
  async getItem(driveId: string, itemId: string): Promise<SharePointItem> {
    return this.graphClient
      .api(`/drives/${driveId}/items/${itemId}`)
      .select(
        'id,name,size,webUrl,createdDateTime,lastModifiedDateTime,folder,file,parentReference'
      )
      .get();
  }

  /**
   * Search for items in a drive
   */
  async searchDriveItems(
    driveId: string,
    query: string
  ): Promise<SharePointItem[]> {
    const response = await this.graphClient
      .api(`/drives/${driveId}/search(q='${query}')`)
      .select(
        'id,name,size,webUrl,createdDateTime,lastModifiedDateTime,folder,file,parentReference'
      )
      .get();

    return response.value;
  }

  /**
   * Get download URL for a file
   */
  async getDownloadUrl(driveId: string, itemId: string): Promise<string> {
    const item = await this.graphClient
      .api(`/drives/${driveId}/items/${itemId}`)
      .select('@microsoft.graph.downloadUrl')
      .get();

    return item['@microsoft.graph.downloadUrl'];
  }

  /**
   * Stream file content
   */
  async getFileContent(
    driveId: string,
    itemId: string
  ): Promise<ReadableStream> {
    return this.graphClient
      .api(`/drives/${driveId}/items/${itemId}/content`)
      .getStream();
  }

  /**
   * Get thumbnail for a file (useful for video previews)
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
