import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env, validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import contactRoutes from './routes/contactRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

validateEnv();

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '50kb' }));

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Portfolio API is running.' });
});

app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`[server] Portfolio API running on http://localhost:${env.port}`);
    console.log(`[server] CORS origin: ${env.clientOrigin}`);
    if (!env.mongoUri) {
      console.warn('[server] Note: set MONGO_URI in backend/.env to enable contact storage.');
    }
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
