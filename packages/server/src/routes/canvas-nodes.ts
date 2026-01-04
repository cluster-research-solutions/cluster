import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { canvasNodes, annotations } from '../db/schema.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const canvasNodesRouter = Router();

/**
 * List all canvas nodes (optionally filtered by study)
 * GET /api/canvas-nodes?studyId=xxx
 */
canvasNodesRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { studyId } = req.query;

    const conditions = [eq(canvasNodes.orgId, req.orgId!)];
    if (studyId) {
      conditions.push(eq(canvasNodes.studyId, studyId as string));
    }

    const nodes = await req.db!
      .select()
      .from(canvasNodes)
      .where(and(...conditions));

    const nodesWithPosition = nodes.map((node) => ({
      ...node,
      position: {
        x: parseFloat(node.positionX || '0'),
        y: parseFloat(node.positionY || '0'),
      },
    }));

    res.json(nodesWithPosition);
  } catch (error) {
    console.error('Error listing canvas nodes:', error);
    res.status(500).json({ error: 'Failed to list canvas nodes' });
  }
});

/**
 * Create or update canvas node
 * POST /api/canvas-nodes
 * Body: { annotationId, position: { x, y }, studyId? }
 */
canvasNodesRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { annotationId, position, studyId } = req.body;

    if (!annotationId || !position) {
      return res.status(400).json({ error: 'annotationId and position are required' });
    }

    // Check if annotation exists
    const [annotation] = await req.db!
      .select()
      .from(annotations)
      .where(and(
        eq(annotations.id, annotationId),
        eq(annotations.orgId, req.orgId!)
      ));

    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    // Always insert (allows multiple instances of same annotation on canvas)
    const [node] = await req.db!
      .insert(canvasNodes)
      .values({
        orgId: req.orgId!,
        studyId: studyId || null,
        annotationId,
        positionX: position.x.toString(),
        positionY: position.y.toString(),
      })
      .returning();

    if (!node) {
      return res.status(500).json({ error: 'Failed to create canvas node' });
    }

    res.status(201).json({
      ...node,
      position: {
        x: parseFloat(node.positionX),
        y: parseFloat(node.positionY),
      },
    });
  } catch (error) {
    console.error('Error creating/updating canvas node:', error);
    res.status(500).json({ error: 'Failed to save canvas node' });
  }
});

/**
 * Update canvas node position
 * PATCH /api/canvas-nodes/:id
 * Body: { position: { x, y } }
 */
canvasNodesRouter.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { position } = req.body;

    if (!position) {
      return res.status(400).json({ error: 'position is required' });
    }

    const [node] = await req.db!
      .update(canvasNodes)
      .set({
        positionX: position.x.toString(),
        positionY: position.y.toString(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(canvasNodes.id, req.params.id),
        eq(canvasNodes.orgId, req.orgId!)
      ))
      .returning();

    if (!node) {
      return res.status(404).json({ error: 'Canvas node not found' });
    }

    res.json({
      ...node,
      position: {
        x: parseFloat(node.positionX),
        y: parseFloat(node.positionY),
      },
    });
  } catch (error) {
    console.error('Error updating canvas node:', error);
    res.status(500).json({ error: 'Failed to update canvas node' });
  }
});

/**
 * Delete canvas node by ID
 * DELETE /api/canvas-nodes/:id
 */
canvasNodesRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Node ID is required' });
    }

    await req.db!
      .delete(canvasNodes)
      .where(and(
        eq(canvasNodes.id, id),
        eq(canvasNodes.orgId, req.orgId!)
      ));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting canvas node:', error);
    res.status(500).json({ error: 'Failed to delete canvas node' });
  }
});
