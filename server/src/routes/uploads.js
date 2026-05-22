import { Router } from 'express';
import mongoose from 'mongoose';
import Upload from '../models/Upload.js';

const router = Router();

// Serves an image stored in MongoDB. URLs look like /api/uploads/<id>.
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // NOTE: no .lean() here on purpose. A lean query returns the raw BSON
  // Binary for `data`, which res.send would serialize into a base64 JSON
  // string (a broken image). The hydrated doc casts `data` to a Buffer.
  const upload = await Upload.findById(req.params.id);
  if (!upload) return res.status(404).json({ error: 'Image not found' });

  res.set('Content-Type', upload.contentType || 'application/octet-stream');
  // Each upload gets a fresh id, so the bytes behind a URL never change.
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(upload.data));
});

export default router;
