import { Router } from 'express';

export const studiesRouter = Router();

studiesRouter.get('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

studiesRouter.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

studiesRouter.get('/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

studiesRouter.put('/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

studiesRouter.delete('/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});
