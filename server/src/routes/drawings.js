import { Router } from 'express';
import Drawing from '../models/Drawing.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadImage, saveUpload, deleteUpload } from '../lib/imageStore.js';

const router = Router();

router.get('/', async (_req, res) => {
  const drawings = await Drawing.find()
    .populate('author', 'name avatar role')
    .sort({ createdAt: -1 });
  res.json(drawings);
});

router.post('/', requireAuth, requireAdmin, uploadImage.single('image'), async (req, res) => {
  let imageUrl = '';
  try {
    const title = req.body.title?.trim();
    if (!title || !req.file) {
      return res.status(400).json({ error: 'title and image required' });
    }

    imageUrl = await saveUpload(req.file);

    const drawing = await Drawing.create({
      title,
      description: req.body.description?.trim() || '',
      imageUrl,
      medium: req.body.medium?.trim() || 'digital',
      author: req.user._id,
    });
    res.json(drawing);
  } catch (e) {
    await deleteUpload(imageUrl);
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, requireAdmin, uploadImage.single('image'), async (req, res) => {
  let newImageUrl = '';
  try {
    const drawing = await Drawing.findById(req.params.id);
    if (!drawing) return res.status(404).json({ error: 'Not found' });

    const nextTitle = req.body.title?.trim();
    if (!nextTitle) return res.status(400).json({ error: 'title required' });

    const previousImageUrl = drawing.imageUrl;

    drawing.title = nextTitle;
    drawing.description = req.body.description?.trim() || '';
    drawing.medium = req.body.medium?.trim() || 'digital';
    if (req.file) {
      newImageUrl = await saveUpload(req.file);
      drawing.imageUrl = newImageUrl;
    }

    await drawing.save();

    if (newImageUrl && previousImageUrl !== newImageUrl) {
      await deleteUpload(previousImageUrl);
    }

    res.json(drawing);
  } catch (e) {
    await deleteUpload(newImageUrl);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const drawing = await Drawing.findByIdAndDelete(req.params.id);
  if (!drawing) return res.status(404).json({ error: 'Not found' });
  await deleteUpload(drawing.imageUrl);
  res.json({ ok: true });
});

router.post('/:id/like', requireAuth, async (req, res) => {
  const drawing = await Drawing.findById(req.params.id);
  if (!drawing) return res.status(404).json({ error: 'Not found' });
  const i = drawing.likes.findIndex((u) => u.equals(req.user._id));
  if (i >= 0) drawing.likes.splice(i, 1);
  else drawing.likes.push(req.user._id);
  await drawing.save();
  res.json({ likes: drawing.likes.length, liked: i < 0 });
});

export default router;
