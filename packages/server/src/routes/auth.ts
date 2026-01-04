import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { loadOrgContext, type OrgRequest } from '../middleware/org.js';

export const authRouter = Router();

/**
 * Get current authentication status
 * Uses optional auth to check if token is valid
 */
authRouter.get('/status', requireAuth, loadOrgContext, (req: OrgRequest, res) => {
  res.json({
    authenticated: true,
    user: req.currentUser,
    org: req.org,
  });
});

/**
 * Get current user profile from Microsoft Graph
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await req.graphClient?.api('/me').get();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * Client-side logout endpoint (clears any server-side session if needed)
 * Actual logout happens on client via MSAL
 */
authRouter.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
