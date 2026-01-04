import { Router } from 'express';
import { eq, and, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { affinityGroups, affinityGroupItems, annotations, annotationTargets, fileRefs } from '../db/schema.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const clustersRouter = Router();

/**
 * Helper function to fetch a cluster with full items and annotations
 */
async function fetchClusterWithItems(db: any, clusterId: string) {
  const [cluster] = await db
    .select()
    .from(affinityGroups)
    .where(eq(affinityGroups.id, clusterId));

  if (!cluster) {
    return null;
  }

  // Fetch items with full annotation data including file metadata
  const itemsRaw = await db
    .select({
      item: affinityGroupItems,
      annotation: annotations,
    })
    .from(affinityGroupItems)
    .leftJoin(annotations, eq(affinityGroupItems.annotationId, annotations.id))
    .where(eq(affinityGroupItems.affinityGroupId, clusterId));

  // Fetch targets and file metadata for each annotation
  const items = await Promise.all(
    itemsRaw.map(async (row) => {
      if (!row.annotation) {
        return null;
      }

      // Fetch targets with file metadata
      const targetsRaw = await db
        .select({
          target: annotationTargets,
          fileRef: fileRefs,
        })
        .from(annotationTargets)
        .leftJoin(fileRefs, eq(annotationTargets.fileRefId, fileRefs.id))
        .where(eq(annotationTargets.annotationId, row.annotation.id));

      const targets = targetsRaw.map((t: any) => ({
        ...t.target,
        fileRef: t.fileRef ? {
          id: t.fileRef.id,
          name: t.fileRef.name,
          mimeType: t.fileRef.mimeType,
          webUrl: t.fileRef.webUrl,
          sharepointDriveId: t.fileRef.sharepointDriveId,
          sharepointItemId: t.fileRef.sharepointItemId,
        } : undefined,
      }));

      return {
        annotationId: row.item.annotationId,
        position: {
          x: parseFloat(row.item.positionX || '0'),
          y: parseFloat(row.item.positionY || '0'),
        },
        sortOrder: row.item.sortOrder,
        annotation: {
          ...row.annotation,
          targets,
        },
      };
    })
  );

  return {
    ...cluster,
    position: {
      x: parseFloat(cluster.positionX || '0'),
      y: parseFloat(cluster.positionY || '0'),
    },
    size: {
      width: parseFloat(cluster.width || '300'),
      height: parseFloat(cluster.height || '200'),
    },
    items: items.filter((item) => item !== null),
  };
}

/**
 * List all clusters (optionally filtered by study)
 * GET /api/clusters?studyId=xxx
 */
clustersRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { studyId } = req.query;

    const conditions = [];
    if (studyId) {
      conditions.push(eq(affinityGroups.studyId, studyId as string));
    }

    const query = req.db!
      .select()
      .from(affinityGroups);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const clusters = await query;

    // Fetch items for each cluster
    const clustersWithItems = await Promise.all(
      clusters.map(async (cluster) => {
        // Fetch items with annotations
        const itemsRaw = await req.db!
          .select({
            item: affinityGroupItems,
            annotation: annotations,
          })
          .from(affinityGroupItems)
          .leftJoin(annotations, eq(affinityGroupItems.annotationId, annotations.id))
          .where(eq(affinityGroupItems.affinityGroupId, cluster.id));

        // Fetch targets for each annotation
        const items = await Promise.all(
          itemsRaw.map(async (row) => {
            if (!row.annotation) return null;

            const targetsRaw = await req.db!
              .select({
                target: annotationTargets,
                fileRef: fileRefs,
              })
              .from(annotationTargets)
              .leftJoin(fileRefs, eq(annotationTargets.fileRefId, fileRefs.id))
              .where(eq(annotationTargets.annotationId, row.annotation.id));

            const targets = targetsRaw.map((t) => ({
              ...t.target,
              fileRef: t.fileRef ? {
                id: t.fileRef.id,
                name: t.fileRef.name,
                mimeType: t.fileRef.mimeType,
                webUrl: t.fileRef.webUrl,
              } : undefined,
            }));

            return {
              annotationId: row.item.annotationId,
              position: {
                x: parseFloat(row.item.positionX || '0'),
                y: parseFloat(row.item.positionY || '0'),
              },
              sortOrder: row.item.sortOrder,
              annotation: {
                ...row.annotation,
                targets,
              },
            };
          })
        );

        return {
          ...cluster,
          position: {
            x: parseFloat(cluster.positionX || '0'),
            y: parseFloat(cluster.positionY || '0'),
          },
          size: {
            width: parseFloat(cluster.width || '300'),
            height: parseFloat(cluster.height || '200'),
          },
          items: items.filter(Boolean),
        };
      })
    );

    res.json(clustersWithItems);
  } catch (error) {
    console.error('Error listing clusters:', error);
    res.status(500).json({ error: 'Failed to list clusters' });
  }
});

/**
 * Get single cluster with items
 * GET /api/clusters/:id
 */
clustersRouter.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const [cluster] = await req.db!
      .select()
      .from(affinityGroups)
      .where(eq(affinityGroups.id, req.params.id));

    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    // Fetch items with full annotation data including file metadata
    const itemsRaw = await req.db!
      .select({
        item: affinityGroupItems,
        annotation: annotations,
      })
      .from(affinityGroupItems)
      .leftJoin(annotations, eq(affinityGroupItems.annotationId, annotations.id))
      .where(eq(affinityGroupItems.affinityGroupId, req.params.id));

    // Fetch targets and file metadata for each annotation
    const items = await Promise.all(
      itemsRaw.map(async (row) => {
        if (!row.annotation) {
          return null;
        }

        // Fetch targets with file metadata
        const targetsRaw = await req.db!
          .select({
            target: annotationTargets,
            fileRef: fileRefs,
          })
          .from(annotationTargets)
          .leftJoin(fileRefs, eq(annotationTargets.fileRefId, fileRefs.id))
          .where(eq(annotationTargets.annotationId, row.annotation.id));

        const targets = targetsRaw.map((t) => ({
          ...t.target,
          fileRef: t.fileRef ? {
            id: t.fileRef.id,
            name: t.fileRef.name,
            mimeType: t.fileRef.mimeType,
            webUrl: t.fileRef.webUrl,
            sharepointDriveId: t.fileRef.sharepointDriveId,
            sharepointItemId: t.fileRef.sharepointItemId,
          } : undefined,
        }));

        return {
          annotationId: row.item.annotationId,
          position: {
            x: parseFloat(row.item.positionX || '0'),
            y: parseFloat(row.item.positionY || '0'),
          },
          sortOrder: row.item.sortOrder,
          annotation: {
            ...row.annotation,
            targets,
          },
        };
      })
    );

    res.json({
      ...cluster,
      position: {
        x: parseFloat(cluster.positionX || '0'),
        y: parseFloat(cluster.positionY || '0'),
      },
      size: {
        width: parseFloat(cluster.width || '300'),
        height: parseFloat(cluster.height || '200'),
      },
      items: items.filter((item) => item !== null),
    });
  } catch (error) {
    console.error('Error fetching cluster:', error);
    res.status(500).json({ error: 'Failed to fetch cluster' });
  }
});

/**
 * Create cluster
 * POST /api/clusters
 * Body: { name, color?, studyId?, position: { x, y }, size: { width, height } }
 */
clustersRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, color, studyId, position, size } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const clusterId = uuidv4();
    const now = new Date();

    const [cluster] = await req.db!
      .insert(affinityGroups)
      .values({
        id: clusterId,
        studyId: studyId || null,
        name,
        color: color || null,
        positionX: position?.x?.toString() || '0',
        positionY: position?.y?.toString() || '0',
        width: size?.width?.toString() || '300',
        height: size?.height?.toString() || '200',
        createdBy: req.userId!,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    res.status(201).json({
      ...cluster,
      position: {
        x: parseFloat(cluster.positionX || '0'),
        y: parseFloat(cluster.positionY || '0'),
      },
      size: {
        width: parseFloat(cluster.width || '300'),
        height: parseFloat(cluster.height || '200'),
      },
    });
  } catch (error) {
    console.error('Error creating cluster:', error);
    res.status(500).json({ error: 'Failed to create cluster' });
  }
});

/**
 * Update cluster
 * PATCH /api/clusters/:id
 * Body: { name?, color?, position?: { x, y }, size?: { width, height } }
 */
clustersRouter.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, color, position, size } = req.body;

    const updates: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (position?.x !== undefined) updates.positionX = position.x.toString();
    if (position?.y !== undefined) updates.positionY = position.y.toString();
    if (size?.width !== undefined) updates.width = size.width.toString();
    if (size?.height !== undefined) updates.height = size.height.toString();

    const [cluster] = await req.db!
      .update(affinityGroups)
      .set(updates)
      .where(eq(affinityGroups.id, req.params.id))
      .returning();

    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    res.json({
      ...cluster,
      position: {
        x: parseFloat(cluster.positionX || '0'),
        y: parseFloat(cluster.positionY || '0'),
      },
      size: {
        width: parseFloat(cluster.width || '300'),
        height: parseFloat(cluster.height || '200'),
      },
    });
  } catch (error) {
    console.error('Error updating cluster:', error);
    res.status(500).json({ error: 'Failed to update cluster' });
  }
});

/**
 * Delete cluster
 * DELETE /api/clusters/:id
 */
clustersRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    await req.db!
      .delete(affinityGroups)
      .where(eq(affinityGroups.id, req.params.id));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting cluster:', error);
    res.status(500).json({ error: 'Failed to delete cluster' });
  }
});

/**
 * Add annotation to cluster
 * POST /api/clusters/:id/items
 * Body: { annotationId, position?: { x, y } }
 */
clustersRouter.post('/:id/items', async (req: AuthenticatedRequest, res) => {
  try {
    const { annotationId, position } = req.body;

    if (!annotationId) {
      return res.status(400).json({ error: 'annotationId is required' });
    }

    // Check if cluster exists
    const [cluster] = await req.db!
      .select()
      .from(affinityGroups)
      .where(eq(affinityGroups.id, req.params.id));

    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    // Check if annotation exists
    const [annotation] = await req.db!
      .select()
      .from(annotations)
      .where(
        and(
          eq(annotations.id, annotationId),
          eq(annotations.orgId, req.orgId!),
          isNull(annotations.deletedAt)
        )
      );

    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    // Add item
    await req.db!
      .insert(affinityGroupItems)
      .values({
        affinityGroupId: req.params.id,
        annotationId,
        positionX: position?.x?.toString() || '0',
        positionY: position?.y?.toString() || '0',
        sortOrder: 0,
      });

    // Fetch and return full updated cluster with items
    const updatedCluster = await fetchClusterWithItems(req.db!, req.params.id);

    if (!updatedCluster) {
      return res.status(404).json({ error: 'Cluster not found after update' });
    }

    res.status(201).json(updatedCluster);
  } catch (error) {
    console.error('Error adding item to cluster:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Annotation already in cluster' });
    }
    res.status(500).json({ error: 'Failed to add item to cluster' });
  }
});

/**
 * Remove annotation from cluster
 * DELETE /api/clusters/:id/items/:annotationId
 */
clustersRouter.delete('/:id/items/:annotationId', async (req: AuthenticatedRequest, res) => {
  try {
    await req.db!
      .delete(affinityGroupItems)
      .where(
        and(
          eq(affinityGroupItems.affinityGroupId, req.params.id),
          eq(affinityGroupItems.annotationId, req.params.annotationId)
        )
      );

    // Fetch and return full updated cluster with items
    const updatedCluster = await fetchClusterWithItems(req.db!, req.params.id);

    if (!updatedCluster) {
      return res.status(404).json({ error: 'Cluster not found after update' });
    }

    res.status(200).json(updatedCluster);
  } catch (error) {
    console.error('Error removing item from cluster:', error);
    res.status(500).json({ error: 'Failed to remove item from cluster' });
  }
});
