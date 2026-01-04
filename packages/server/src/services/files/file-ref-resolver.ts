import { eq, and } from 'drizzle-orm';
import { fileRefs } from '../../db/schema.js';

/**
 * Service to resolve external file identifiers (SharePoint, Google Drive, etc.)
 * to internal file_ref UUIDs. Creates file_ref entries on-demand if they don't exist.
 */
export class FileRefResolver {
  constructor(
    private db: any,
    private orgId: string
  ) {}

  /**
   * Find or create a file_ref by external identifiers.
   *
   * @param provider - File storage provider ('sharepoint', 'googledrive', etc.)
   * @param driveId - External drive/folder ID
   * @param itemId - External file/item ID
   * @param metadata - Optional metadata to store if creating new entry
   * @returns file_ref UUID
   */
  async findOrCreate(
    provider: 'sharepoint' | 'googledrive',
    driveId: string,
    itemId: string,
    metadata?: {
      name?: string;
      mimeType?: string;
      sizeBytes?: number;
      webUrl?: string;
      siteId?: string;
    }
  ): Promise<string> {
    // For now, only SharePoint is supported
    if (provider !== 'sharepoint') {
      throw new Error(`Provider ${provider} not yet supported`);
    }

    // Use upsert to handle race conditions - insert or return existing
    const [fileRef] = await this.db
      .insert(fileRefs)
      .values({
        orgId: this.orgId,
        sharepointDriveId: driveId,
        sharepointItemId: itemId,
        sharepointSiteId: metadata?.siteId || null,
        name: metadata?.name || 'Unknown File',
        mimeType: metadata?.mimeType || null,
        sizeBytes: metadata?.sizeBytes || null,
        webUrl: metadata?.webUrl || null,
        lastSyncedAt: new Date(),
      })
      .onConflictDoNothing({
        target: [fileRefs.orgId, fileRefs.sharepointDriveId, fileRefs.sharepointItemId],
      })
      .returning({ id: fileRefs.id });

    // If conflict occurred, fetch the existing record
    if (!fileRef) {
      const [existing] = await this.db
        .select({ id: fileRefs.id })
        .from(fileRefs)
        .where(
          and(
            eq(fileRefs.orgId, this.orgId),
            eq(fileRefs.sharepointDriveId, driveId),
            eq(fileRefs.sharepointItemId, itemId)
          )
        )
        .limit(1);

      return existing.id;
    }

    return fileRef.id;
  }

  /**
   * Find file_ref UUID by external IDs (does not create if missing).
   */
  async find(
    provider: 'sharepoint' | 'googledrive',
    driveId: string,
    itemId: string
  ): Promise<string | null> {
    if (provider !== 'sharepoint') {
      return null;
    }

    const [existing] = await this.db
      .select({ id: fileRefs.id })
      .from(fileRefs)
      .where(
        and(
          eq(fileRefs.orgId, this.orgId),
          eq(fileRefs.sharepointDriveId, driveId),
          eq(fileRefs.sharepointItemId, itemId)
        )
      )
      .limit(1);

    return existing?.id || null;
  }
}
