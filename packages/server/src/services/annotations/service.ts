import { eq, and, isNull, inArray, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { annotations, annotationTargets, annotationTags, fileRefs, affinityGroupItems } from '../../db/schema.js';
import { FileRefResolver } from '../files/file-ref-resolver.js';

export interface CreateAnnotationInput {
  motivation: string[];
  bodyText?: string;
  targets: {
    driveId: string;
    itemId: string;
    provider?: 'sharepoint' | 'googledrive';
    selectorType: string;
    selectorValue: any;
    exactText?: string;
    startTime?: number;
    endTime?: number;
    fileMetadata?: {
      name: string;
      mimeType?: string;
      size?: number;
      webUrl?: string;
      siteId?: string;
    };
  }[];
  tagIds?: string[];
  studyId?: string;
  participantId?: string;
  sessionId?: string;
}

export interface UpdateAnnotationInput {
  motivation?: string[];
  bodyText?: string;
  tagIds?: string[];
  studyId?: string;
  participantId?: string;
  sessionId?: string;
}

export class AnnotationService {
  private fileRefResolver: FileRefResolver;

  constructor(
    private db: any,
    private orgId: string,
    private userId: string
  ) {
    this.fileRefResolver = new FileRefResolver(db, orgId);
  }

  /**
   * Create a new annotation
   */
  async create(input: CreateAnnotationInput) {
    const annotationId = uuidv4();
    const now = new Date();

    // Build W3C JSON-LD
    const jsonld = this.buildJsonLD(annotationId, input, now);

    // Insert annotation
    const [annotation] = await this.db
      .insert(annotations)
      .values({
        id: annotationId,
        orgId: this.orgId,
        studyId: input.studyId || null,
        motivation: input.motivation as any,
        creatorId: this.userId,
        participantId: input.participantId || null,
        sessionId: input.sessionId || null,
        jsonld,
        bodyText: input.bodyText || null,
        createdAt: now,
        modifiedAt: now,
      })
      .returning();

    // Insert targets - resolve external IDs to internal file_ref UUIDs
    if (input.targets.length > 0) {
      const targetValues = await Promise.all(
        input.targets.map(async (target) => {
          const provider = target.provider || 'sharepoint';

          // Resolve external IDs to internal file_ref UUID, passing metadata if available
          const fileRefId = await this.fileRefResolver.findOrCreate(
            provider,
            target.driveId,
            target.itemId,
            target.fileMetadata ? {
              name: target.fileMetadata.name,
              mimeType: target.fileMetadata.mimeType,
              sizeBytes: target.fileMetadata.size,
              webUrl: target.fileMetadata.webUrl,
              siteId: target.fileMetadata.siteId,
            } : undefined
          );

          return {
            annotationId,
            fileRefId,
            selectorType: target.selectorType as any,
            selectorValue: target.selectorValue,
            exactText: target.exactText || null,
            startTime: target.startTime?.toString() || null,
            endTime: target.endTime?.toString() || null,
          };
        })
      );

      await this.db.insert(annotationTargets).values(targetValues);
    }

    // Insert tags
    if (input.tagIds && input.tagIds.length > 0) {
      await this.db.insert(annotationTags).values(
        input.tagIds.map((tagId) => ({
          annotationId,
          tagId,
        }))
      );
    }

    return this.findById(annotationId);
  }

  /**
   * Find annotation by ID
   */
  async findById(id: string) {
    const [annotation] = await this.db
      .select()
      .from(annotations)
      .where(
        and(
          eq(annotations.id, id),
          eq(annotations.orgId, this.orgId),
          isNull(annotations.deletedAt)
        )
      );

    if (!annotation) {
      return null;
    }

    // Fetch targets with SharePoint IDs and file metadata
    const targetsRaw = await this.db
      .select({
        target: annotationTargets,
        fileRef: fileRefs,
      })
      .from(annotationTargets)
      .leftJoin(fileRefs, eq(annotationTargets.fileRefId, fileRefs.id))
      .where(eq(annotationTargets.annotationId, id));

    // Map targets to include SharePoint item ID and file metadata
    const targets = targetsRaw.map((row) => ({
      ...row.target,
      sharepointItemId: row.fileRef?.sharepointItemId,
      fileRef: row.fileRef ? {
        id: row.fileRef.id,
        name: row.fileRef.name,
        mimeType: row.fileRef.mimeType,
        webUrl: row.fileRef.webUrl,
      } : undefined,
    }));

    // Fetch tags
    const tags = await this.db
      .select()
      .from(annotationTags)
      .where(eq(annotationTags.annotationId, id));

    return {
      ...annotation,
      targets,
      tagIds: tags.map((t) => t.tagId),
    };
  }

  /**
   * List annotations with optional filters
   */
  async list(filters?: {
    studyId?: string;
    tagIds?: string[];
    limit?: number;
    offset?: number;
  }) {
    const conditions = [
      eq(annotations.orgId, this.orgId),
      isNull(annotations.deletedAt),
    ];

    if (filters?.studyId) {
      conditions.push(eq(annotations.studyId, filters.studyId));
    }

    let query = this.db
      .select()
      .from(annotations)
      .where(and(...conditions))
      .orderBy(desc(annotations.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);

    const results = await query;

    // Filter by tags if needed
    let filteredResults = results;
    if (filters?.tagIds && filters.tagIds.length > 0) {
      const annotationIds = await this.db
        .select({ annotationId: annotationTags.annotationId })
        .from(annotationTags)
        .where(inArray(annotationTags.tagId, filters.tagIds));

      const ids = annotationIds.map((a) => a.annotationId);
      filteredResults = results.filter((a) => ids.includes(a.id));
    }

    // Fetch targets and tags for each annotation
    const annotationsWithRelations = await Promise.all(
      filteredResults.map(async (annotation) => {
        // Fetch targets with SharePoint IDs and file metadata
        const targetsRaw = await this.db
          .select({
            target: annotationTargets,
            fileRef: fileRefs,
          })
          .from(annotationTargets)
          .leftJoin(fileRefs, eq(annotationTargets.fileRefId, fileRefs.id))
          .where(eq(annotationTargets.annotationId, annotation.id));

        // Map targets to include SharePoint item ID and file metadata
        const targets = targetsRaw.map((row) => ({
          ...row.target,
          sharepointItemId: row.fileRef?.sharepointItemId,
          fileRef: row.fileRef ? {
            id: row.fileRef.id,
            name: row.fileRef.name,
            mimeType: row.fileRef.mimeType,
            webUrl: row.fileRef.webUrl,
          } : undefined,
        }));

        // Fetch tags
        const tags = await this.db
          .select()
          .from(annotationTags)
          .where(eq(annotationTags.annotationId, annotation.id));

        return {
          ...annotation,
          targets,
          tagIds: tags.map((t) => t.tagId),
        };
      })
    );

    return annotationsWithRelations;
  }

  /**
   * Update an annotation
   */
  async update(id: string, input: UpdateAnnotationInput) {
    const annotation = await this.findById(id);
    if (!annotation) {
      throw new Error('Annotation not found');
    }

    const updates: any = {
      modifiedAt: new Date(),
    };

    if (input.motivation) updates.motivation = input.motivation;
    if (input.bodyText !== undefined) updates.bodyText = input.bodyText;
    if (input.studyId !== undefined) updates.studyId = input.studyId;
    if (input.participantId !== undefined) updates.participantId = input.participantId;
    if (input.sessionId !== undefined) updates.sessionId = input.sessionId;

    // Update JSON-LD
    const updatedJsonLD = {
      ...annotation.jsonld,
      modified: updates.modifiedAt.toISOString(),
      ...this.buildPartialJsonLD(input),
    };
    updates.jsonld = updatedJsonLD;

    await this.db
      .update(annotations)
      .set(updates)
      .where(eq(annotations.id, id));

    // Update tags if provided
    if (input.tagIds) {
      await this.db.delete(annotationTags).where(eq(annotationTags.annotationId, id));
      if (input.tagIds.length > 0) {
        await this.db.insert(annotationTags).values(
          input.tagIds.map((tagId) => ({
            annotationId: id,
            tagId,
          }))
        );
      }
    }

    return this.findById(id);
  }

  /**
   * Soft delete an annotation
   */
  async delete(id: string) {
    // Remove from cluster items first
    await this.db
      .delete(affinityGroupItems)
      .where(eq(affinityGroupItems.annotationId, id));

    // Then soft delete the annotation
    await this.db
      .update(annotations)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(annotations.id, id),
          eq(annotations.orgId, this.orgId)
        )
      );
  }

  /**
   * Build W3C JSON-LD for annotation
   */
  private buildJsonLD(id: string, input: CreateAnnotationInput, created: Date): any {
    return {
      '@context': [
        'http://www.w3.org/ns/anno.jsonld',
        'https://research-annotations.io/ns/research.jsonld',
      ],
      id: `urn:uuid:${id}`,
      type: 'Annotation',
      motivation: input.motivation,
      creator: {
        id: `urn:uuid:${this.userId}`,
        type: 'Person',
      },
      created: created.toISOString(),
      body: input.bodyText
        ? {
            type: 'TextualBody',
            value: input.bodyText,
            purpose: 'describing',
          }
        : undefined,
      target: input.targets.map((t) => ({
        selector: t.selectorValue,
      })),
      'research:study': input.studyId ? `urn:uuid:${input.studyId}` : undefined,
      'research:participant': input.participantId,
      'research:session': input.sessionId,
    };
  }

  /**
   * Build partial JSON-LD for updates
   */
  private buildPartialJsonLD(input: UpdateAnnotationInput): any {
    const partial: any = {};

    if (input.motivation) partial.motivation = input.motivation;
    if (input.bodyText !== undefined) {
      partial.body = input.bodyText
        ? {
            type: 'TextualBody',
            value: input.bodyText,
            purpose: 'describing',
          }
        : null;
    }
    if (input.studyId !== undefined) {
      partial['research:study'] = input.studyId ? `urn:uuid:${input.studyId}` : null;
    }
    if (input.participantId !== undefined) {
      partial['research:participant'] = input.participantId;
    }
    if (input.sessionId !== undefined) {
      partial['research:session'] = input.sessionId;
    }

    return partial;
  }
}
