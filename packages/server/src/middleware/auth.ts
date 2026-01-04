import { Request, Response, NextFunction } from 'express';
import { Client } from '@microsoft/microsoft-graph-client';
import { env } from '../config/env.js';
import type { DatabaseRequest } from './db.js';
import { eq, and } from 'drizzle-orm';
import { organizations, users } from '../db/schema.js';

export interface AuthenticatedRequest extends DatabaseRequest {
  user?: {
    id: string;
    email: string;
    displayName?: string;
    accessToken: string;
  };
  graphClient?: Client;
  orgId?: string;
  userId?: string;
  tenantId?: string;
}

/**
 * Middleware to validate Azure AD access token and attach user info to request
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const accessToken = authHeader.substring(7);

    // Create Graph client with the user's access token directly
    // This uses the delegated permissions already granted to the user
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    // Verify token and get user info
    const user = await graphClient.api('/me').get();

    // Attach user info and graph client to request
    req.user = {
      id: user.id,
      email: user.mail || user.userPrincipalName,
      displayName: user.displayName,
      accessToken,
    };
    req.graphClient = graphClient;

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware - doesn't fail if no token provided
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user
    next();
    return;
  }

  // Token provided, try to authenticate
  return requireAuth(req, res, next);
}

/**
 * Middleware to sync user/org to database and attach IDs to request
 * Must be called after requireAuth
 */
export async function attachOrgContext(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.graphClient || !req.db) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get tenant ID from Graph API
    const orgData = await req.graphClient.api('/organization').get();
    const tenantId = orgData.value[0]?.id;

    if (!tenantId) {
      res.status(500).json({ error: 'Could not determine tenant ID' });
      return;
    }

    req.tenantId = tenantId;

    // Find or create organization
    let [org] = await req.db
      .select()
      .from(organizations)
      .where(eq(organizations.azureTenantId, tenantId));

    if (!org) {
      // Create organization
      [org] = await req.db
        .insert(organizations)
        .values({
          name: orgData.value[0]?.displayName || 'Organization',
          azureTenantId: tenantId,
          settings: {},
        })
        .returning();
    }

    req.orgId = org.id;

    // Find or create user
    let [user] = await req.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.orgId, org.id),
          eq(users.azureUserId, req.user.id)
        )
      );

    if (!user) {
      // Create user
      [user] = await req.db
        .insert(users)
        .values({
          orgId: org.id,
          azureUserId: req.user.id,
          email: req.user.email,
          displayName: req.user.displayName,
        })
        .returning();
    }

    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Org context error:', error);
    res.status(500).json({ error: 'Failed to establish org context' });
  }
}
