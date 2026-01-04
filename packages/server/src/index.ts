import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { attachDatabase } from './middleware/db.js';

const app = express();

// Middleware
app.use(cors({
  origin: env.WEB_URL,
  credentials: true,
}));
app.use(express.json());

// Attach database to all requests
app.use(attachDatabase);

// Routes
app.use('/api', apiRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
});
