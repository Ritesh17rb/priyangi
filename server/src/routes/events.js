import { Router } from 'express';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.from && req.query.to) {
    filter.date = { $gte: new Date(req.query.from), $lte: new Date(req.query.to) };
  }
  const events = await Event.find(filter).sort({ date: 1 });
  res.json(events);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, date, endDate, color, category } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'title and date required' });
    const event = await Event.create({
      title,
      description: description || '',
      date,
      endDate: endDate || undefined,
      color: color || '#FF6B9D',
      category: category || 'personal',
      owner: req.user._id,
    });
    res.json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, owner: req.user._id });
  if (!event) return res.status(404).json({ error: 'Not found' });
  Object.assign(event, req.body);
  await event.save();
  res.json(event);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Event.deleteOne({ _id: req.params.id, owner: req.user._id });
  res.json({ ok: true });
});

export default router;
