import { Router } from 'express';
import { ActivityService } from '../services/activity/service.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const activityRouter = Router();

/**
 * Get recent activity (file views with file metadata)
 * GET /api/activity/recent?limit=10
 */
activityRouter.get('/recent', async (req: AuthenticatedRequest, res) => {
  try {
    const { limit } = req.query;

    const service = new ActivityService(
      req.db!,
      req.orgId!,
      req.userId!
    );

    const recentActivity = await service.getRecentActivity(
      limit ? parseInt(limit as string, 10) : undefined
    );

    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

/**
 * Record a file view
 * POST /api/activity/file-view
 * Body: { driveId: string, itemId: string, provider?: 'sharepoint' }
 */
activityRouter.post('/file-view', async (req: AuthenticatedRequest, res) => {
  try {
    const { driveId, itemId, provider = 'sharepoint' } = req.body;

    if (!driveId || !itemId) {
      return res.status(400).json({ error: 'driveId and itemId are required' });
    }

    const service = new ActivityService(
      req.db!,
      req.orgId!,
      req.userId!
    );

    const fileView = await service.recordFileView(provider, driveId, itemId);

    res.status(201).json(fileView);
  } catch (error) {
    console.error('Error recording file view:', error);
    res.status(500).json({ error: 'Failed to record file view' });
  }
});
