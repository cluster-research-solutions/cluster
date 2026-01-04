import { eq, desc, and } from 'drizzle-orm';
import { fileViews, fileRefs } from '../../db/schema';
import { FileRefResolver } from '../files/file-ref-resolver';

export interface FileView {
  id: string;
  userId: string;
  fileRefId: string;
  viewedAt: Date;
  updatedAt: Date;
  fileRef?: {
    id: string;
    name: string;
    mimeType: string | null;
    sizeBytes: bigint | null;
    webUrl: string | null;
    sharepointDriveId: string;
    sharepointItemId: string;
  };
}

export class ActivityService {
  private fileRefResolver: FileRefResolver;

  constructor(
    private db: any,
    private orgId: string,
    private userId: string
  ) {
    this.fileRefResolver = new FileRefResolver(db, orgId);
  }

  /**
   * Record a file view (upserts based on user_id + file_ref_id unique constraint)
   * @param provider - File storage provider ('sharepoint', 'googledrive', etc.)
   * @param driveId - External drive ID
   * @param itemId - External item ID
   */
  async recordFileView(
    provider: 'sharepoint' | 'googledrive',
    driveId: string,
    itemId: string
  ): Promise<FileView> {
    const now = new Date();

    // Resolve external IDs to internal file_ref UUID
    const fileRefId = await this.fileRefResolver.findOrCreate(provider, driveId, itemId);

    // Insert or update using ON CONFLICT
    const [fileView] = await this.db
      .insert(fileViews)
      .values({
        userId: this.userId,
        fileRefId,
        viewedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [fileViews.userId, fileViews.fileRefId],
        set: {
          viewedAt: now,
          updatedAt: now,
        },
      })
      .returning();

    return {
      id: fileView.id,
      userId: fileView.userId,
      fileRefId: fileView.fileRefId,
      viewedAt: fileView.viewedAt,
      updatedAt: fileView.updatedAt,
    };
  }

  /**
   * Get recent file views for the current user with file metadata
   */
  async getRecentActivity(limit: number = 10): Promise<FileView[]> {
    const views = await this.db
      .select({
        id: fileViews.id,
        userId: fileViews.userId,
        fileRefId: fileViews.fileRefId,
        viewedAt: fileViews.viewedAt,
        updatedAt: fileViews.updatedAt,
        fileRef: {
          id: fileRefs.id,
          name: fileRefs.name,
          mimeType: fileRefs.mimeType,
          sizeBytes: fileRefs.sizeBytes,
          webUrl: fileRefs.webUrl,
          sharepointDriveId: fileRefs.sharepointDriveId,
          sharepointItemId: fileRefs.sharepointItemId,
        },
      })
      .from(fileViews)
      .leftJoin(fileRefs, eq(fileViews.fileRefId, fileRefs.id))
      .where(
        and(
          eq(fileViews.userId, this.userId),
          eq(fileRefs.orgId, this.orgId)
        )
      )
      .orderBy(desc(fileViews.viewedAt))
      .limit(limit);

    return views.map(view => ({
      id: view.id,
      userId: view.userId,
      fileRefId: view.fileRefId,
      viewedAt: view.viewedAt,
      updatedAt: view.updatedAt,
      fileRef: view.fileRef,
    }));
  }
}
