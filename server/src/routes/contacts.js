import { Router } from 'express';
import Contact from '../models/Contact.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const contacts = await Contact.find({ owner: req.user._id }).sort({
    favorite: -1,
    name: 1,
  });
  res.json(contacts);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, owner: req.user._id });
    res.json(contact);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
  if (!contact) return res.status(404).json({ error: 'Not found' });
  Object.assign(contact, req.body);
  await contact.save();
  res.json(contact);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Contact.deleteOne({ _id: req.params.id, owner: req.user._id });
  res.json({ ok: true });
});

export default router;
