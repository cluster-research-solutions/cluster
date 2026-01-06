import { Router, type Router as RouterType } from 'express';
import type { Readable } from 'node:stream';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { SharePointService } from '../services/sharepoint/client.js';
import { parseVTT } from '../services/transcripts/parser.js';

export const filesRouter: RouterType = Router();

/**
 * List SharePoint sites (containers)
 */
filesRouter.get('/sites', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);
    const sites = await sp.listContainers();
    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

/**
 * Get a specific site (container)
 */
filesRouter.get('/sites/:siteId', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);
    const site = await sp.getContainer(req.params.siteId!);
    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

/**
 * List drives for a site
 */
filesRouter.get('/sites/:siteId/drives', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);
    const drives = await sp.listDrives(req.params.siteId!);
    res.json(drives);
  } catch (error) {
    console.error('Error fetching drives:', error);
    res.status(500).json({ error: 'Failed to fetch drives' });
  }
});

/**
 * List items in a drive
 */
filesRouter.get('/drives/:driveId/items', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);
    const itemId = (req.query.itemId as string) || 'root';
    const items = await sp.listItems(req.params.driveId!, itemId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching drive items:', error);
    res.status(500).json({ error: 'Failed to fetch drive items' });
  }
});

/**
 * Get a specific item
 */
filesRouter.get('/drives/:driveId/items/:itemId', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);
    const item = await sp.getItem(req.params.driveId!, req.params.itemId!);
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * Stream file content
 */
filesRouter.get('/drives/:driveId/items/:itemId/content', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);
    const stream = (await sp.getFileContent(
      req.params.driveId!,
      req.params.itemId!
    )) as Readable;

    // Pipe the stream to response
    stream.pipe(res);
  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).json({ error: 'Failed to stream file' });
  }
});

/**
 * Get download URL for a file
 */
filesRouter.get('/drives/:driveId/items/:itemId/download-url', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);
    const url = await sp.getDownloadUrl(req.params.driveId!, req.params.itemId!);
    res.json({ url });
  } catch (error) {
    console.error('Error getting download URL:', error);
    res.status(500).json({ error: 'Failed to get download URL' });
  }
});

/**
 * Get and parse transcript file
 */
filesRouter.get('/drives/:driveId/items/:itemId/transcript', async (req: AuthenticatedRequest, res) => {
  try {
    const sp = new SharePointService(req.graphClient!);

    // Get file content
    const stream = (await sp.getFileContent(
      req.params.driveId!,
      req.params.itemId!
    )) as Readable;

    // Collect stream data
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const vttContent = Buffer.concat(chunks).toString('utf-8');

    // Parse VTT
    const transcript = parseVTT(vttContent);

    res.json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});
