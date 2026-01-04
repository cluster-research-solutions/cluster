import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { canvasSnapshots } from '../db/schema.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const canvasSnapshotsRouter = Router();

/**
 * List all canvas snapshots (optionally filtered by study)
 * GET /api/canvas-snapshots?studyId=xxx
 */
canvasSnapshotsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { studyId } = req.query;

    const conditions = [eq(canvasSnapshots.orgId, req.orgId!)];

    if (studyId) {
      conditions.push(eq(canvasSnapshots.studyId, studyId as string));
    }

    const snapshots = await req.db!
      .select()
      .from(canvasSnapshots)
      .where(and(...conditions))
      .orderBy(desc(canvasSnapshots.createdAt));

    res.json(snapshots);
  } catch (error) {
    console.error('Error fetching canvas snapshots:', error);
    res.status(500).json({ error: 'Failed to fetch canvas snapshots' });
  }
});

/**
 * Get single canvas snapshot
 * GET /api/canvas-snapshots/:id
 */
canvasSnapshotsRouter.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const [snapshot] = await req.db!
      .select()
      .from(canvasSnapshots)
      .where(
        and(
          eq(canvasSnapshots.id, req.params.id),
          eq(canvasSnapshots.orgId, req.orgId!)
        )
      );

    if (!snapshot) {
      return res.status(404).json({ error: 'Canvas snapshot not found' });
    }

    res.json(snapshot);
  } catch (error) {
    console.error('Error fetching canvas snapshot:', error);
    res.status(500).json({ error: 'Failed to fetch canvas snapshot' });
  }
});

/**
 * Create canvas snapshot
 * POST /api/canvas-snapshots
 */
canvasSnapshotsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, studyId, canvasState } = req.body;

    if (!name || !canvasState) {
      return res.status(400).json({ error: 'Name and canvas state are required' });
    }

    // Get next version number for this study
    const existingSnapshots = await req.db!
      .select({ versionNumber: canvasSnapshots.versionNumber })
      .from(canvasSnapshots)
      .where(
        studyId
          ? and(
              eq(canvasSnapshots.orgId, req.orgId!),
              eq(canvasSnapshots.studyId, studyId)
            )
          : eq(canvasSnapshots.orgId, req.orgId!)
      )
      .orderBy(desc(canvasSnapshots.versionNumber))
      .limit(1);

    const nextVersion = existingSnapshots.length > 0
      ? (existingSnapshots[0].versionNumber ?? 0) + 1
      : 1;

    const [snapshot] = await req.db!
      .insert(canvasSnapshots)
      .values({
        name,
        description,
        studyId: studyId || null,
        versionNumber: nextVersion,
        canvasState,
        orgId: req.orgId!,
        createdBy: req.userId,
      })
      .returning();

    res.status(201).json(snapshot);
  } catch (error) {
    console.error('Error creating canvas snapshot:', error);
    res.status(500).json({ error: 'Failed to create canvas snapshot' });
  }
});

/**
 * Delete canvas snapshot
 * DELETE /api/canvas-snapshots/:id
 */
canvasSnapshotsRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    await req.db!
      .delete(canvasSnapshots)
      .where(
        and(
          eq(canvasSnapshots.id, req.params.id),
          eq(canvasSnapshots.orgId, req.orgId!)
        )
      );

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting canvas snapshot:', error);
    res.status(500).json({ error: 'Failed to delete canvas snapshot' });
  }
});
