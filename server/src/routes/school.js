import { Router } from 'express';
import SchoolInfo from '../models/SchoolInfo.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  let info = await SchoolInfo.findOne({ singleton: 1 });
  if (!info) info = await SchoolInfo.create({ singleton: 1 });
  res.json(info);
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  const body = { ...req.body };
  delete body.singleton;
  const info = await SchoolInfo.findOneAndUpdate({ singleton: 1 }, body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
  res.json(info);
});

export default router;
