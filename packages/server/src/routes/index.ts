import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { annotationsRouter } from './annotations.js';
import { filesRouter } from './files.js';
import { studiesRouter } from './studies.js';
import { activityRouter } from './activity.js';
import { clustersRouter } from './clusters.js';
import { canvasNodesRouter } from './canvas-nodes.js';
import { canvasSnapshotsRouter } from './canvas-snapshots.js';
import { requireAuth, attachOrgContext } from '../middleware/auth.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);

// Protected routes - require authentication and org context
apiRouter.use('/annotations', requireAuth, attachOrgContext, annotationsRouter);
apiRouter.use('/files', requireAuth, attachOrgContext, filesRouter);
apiRouter.use('/studies', requireAuth, attachOrgContext, studiesRouter);
apiRouter.use('/activity', requireAuth, attachOrgContext, activityRouter);
apiRouter.use('/clusters', requireAuth, attachOrgContext, clustersRouter);
apiRouter.use('/canvas-nodes', requireAuth, attachOrgContext, canvasNodesRouter);
apiRouter.use('/canvas-snapshots', requireAuth, attachOrgContext, canvasSnapshotsRouter);
