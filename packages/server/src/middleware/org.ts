import { Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations, users } from '../db/schema.js';
import { env } from '../config/env.js';
import type { AuthenticatedRequest } from './auth.js';

export interface OrgRequest extends AuthenticatedRequest {
  org?: {
    id: string;
    name: string;
    azureTenantId: string;
  };
  currentUser?: {
    id: string;
    orgId: string;
    email: string;
    displayName?: string;
  };
}

/**
 * Middleware to load organization context and current user from database
 * Requires authentication (use after requireAuth middleware)
 */
export async function loadOrgContext(
  req: OrgRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get tenant ID from token (would need to decode JWT in production)
    // For now, using Azure AD to get tenant info via Graph API
    const orgInfo = await req.graphClient?.api('/organization').get();
    const azureTenantId = orgInfo?.value?.[0]?.id || env.AZURE_TENANT_ID;

    // Find or create organization
    let org = await db.query.organizations.findFirst({
      where: eq(organizations.azureTenantId, azureTenantId),
    });

    if (!org) {
      // Auto-create organization on first login
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: orgInfo?.value?.[0]?.displayName || 'My Organization',
          azureTenantId,
          settings: {},
        })
        .returning();
      org = newOrg;
    }

    // Find or create user
    let user = await db.query.users.findFirst({
      where: (users, { and, eq }) =>
        and(eq(users.orgId, org!.id), eq(users.azureUserId, req.user!.id)),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          orgId: org.id,
          azureUserId: req.user.id,
          email: req.user.email,
          displayName: req.user.displayName,
        })
        .returning();
      user = newUser;
    } else {
      // Update user info if changed
      await db
        .update(users)
        .set({
          email: req.user.email,
          displayName: req.user.displayName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    // Attach org and user to request
    req.org = {
      id: org.id,
      name: org.name,
      azureTenantId: org.azureTenantId,
    };

    req.currentUser = {
      id: user.id,
      orgId: org.id,
      email: user.email,
      displayName: user.displayName || undefined,
    };

    next();
  } catch (error) {
    console.error('Org context error:', error);
    res.status(500).json({ error: 'Failed to load organization context' });
  }
}
