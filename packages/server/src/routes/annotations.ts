import { Router } from 'express';
import { AnnotationService } from '../services/annotations/service.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const annotationsRouter = Router();

// W3C Web Annotation Protocol endpoints
// https://www.w3.org/TR/annotation-protocol/

/**
 * List annotations
 * GET /api/annotations?studyId=xxx&tagIds=xxx,yyy&limit=50&offset=0
 */
annotationsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { studyId, tagIds, limit, offset } = req.query;

    const service = new AnnotationService(
      req.db!,
      req.orgId!,
      req.userId!
    );

    const annotations = await service.list({
      studyId: studyId as string | undefined,
      tagIds: tagIds ? (tagIds as string).split(',') : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(annotations);
  } catch (error) {
    console.error('Error listing annotations:', error);
    res.status(500).json({ error: 'Failed to list annotations' });
  }
});

/**
 * Create annotation
 * POST /api/annotations
 */
annotationsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Creating annotation with body:', JSON.stringify(req.body, null, 2));

    const service = new AnnotationService(
      req.db!,
      req.orgId!,
      req.userId!
    );

    const annotation = await service.create(req.body);

    res.status(201).json(annotation);
  } catch (error) {
    console.error('Error creating annotation:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: 'Failed to create annotation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get annotation by ID
 * GET /api/annotations/:id
 */
annotationsRouter.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const service = new AnnotationService(
      req.db!,
      req.orgId!,
      req.userId!
    );

    const annotation = await service.findById(req.params.id);

    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    res.json(annotation);
  } catch (error) {
    console.error('Error fetching annotation:', error);
    res.status(500).json({ error: 'Failed to fetch annotation' });
  }
});

/**
 * Update annotation
 * PUT /api/annotations/:id
 */
annotationsRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const service = new AnnotationService(
      req.db!,
      req.orgId!,
      req.userId!
    );

    const annotation = await service.update(req.params.id, req.body);

    res.json(annotation);
  } catch (error) {
    console.error('Error updating annotation:', error);
    if (error instanceof Error && error.message === 'Annotation not found') {
      return res.status(404).json({ error: 'Annotation not found' });
    }
    res.status(500).json({ error: 'Failed to update annotation' });
  }
});

/**
 * Delete annotation (soft delete)
 * DELETE /api/annotations/:id
 */
annotationsRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const service = new AnnotationService(
      req.db!,
      req.orgId!,
      req.userId!
    );

    await service.delete(req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({ error: 'Failed to delete annotation' });
  }
});
