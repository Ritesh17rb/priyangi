import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';

import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import drawingRoutes from './routes/drawings.js';
import musicRoutes from './routes/music.js';
import eventRoutes from './routes/events.js';
import contactRoutes from './routes/contacts.js';
import schoolRoutes from './routes/school.js';
import youtubeRoutes from './routes/youtube.js';
import uploadRoutes from './routes/uploads.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || true,
    credentials: true,
  })
);
app.use(morgan('dev'));

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    time: new Date(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
);

app.use('/api/youtube', youtubeRoutes);

export function requiresDatabase(pathname = '') {
  return !(
    pathname === '/api/health' ||
    pathname === '/api/youtube' ||
    pathname.startsWith('/api/youtube/')
  );
}

app.use('/api', (req, res, next) => {
  if (!requiresDatabase(req.path.startsWith('/api') ? req.path : `/api${req.path}`)) return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error:
        'Database not connected. Whitelist your IP in MongoDB Atlas (Network Access → Add Current IP Address) and check MONGODB_URI / password in server/.env.',
    });
  }
  return next();
});

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/drawings', drawingRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/school', schoolRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err && err.name === 'MulterError') {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || 'Server error' });
});

let readyPromise = null;
let adminBootstrapped = false;

async function bootstrapAdmin() {
  if (adminBootstrapped) return;

  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  if (!email || !process.env.ADMIN_PASSWORD) {
    adminBootstrapped = true;
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`👑 Promoted ${email} to admin`);
    }
    adminBootstrapped = true;
    return;
  }

  const passwordHash = await User.hashPassword(process.env.ADMIN_PASSWORD);
  await User.create({
    name: process.env.ADMIN_NAME || 'Priyangi',
    email,
    passwordHash,
    role: 'admin',
  });
  adminBootstrapped = true;
  console.log(`👑 Created admin user: ${email}`);
}

export async function ensureServerReady() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set.');
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    await connectDB(process.env.MONGODB_URI);
    await bootstrapAdmin();
  })();

  try {
    await readyPromise;
  } finally {
    if (mongoose.connection.readyState !== 1) readyPromise = null;
  }
}

export default app;
